begin;
alter table governance.approved_processors drop constraint approved_processors_purpose_check;
alter table governance.approved_processors add constraint approved_processors_purpose_check check(purpose in ('FILE_SCAN','AI','TRANSCRIPTION','EMAIL','WHATSAPP'));
create table notifications.delivery_preferences(account_id uuid primary key references identity.accounts(id),email_enabled boolean not null default false,whatsapp_enabled boolean not null default false,whatsapp_number text,consent_reference text,updated_at timestamptz not null default now(),check(not whatsapp_enabled or (whatsapp_number ~ '^\+[1-9][0-9]{7,14}$' and length(consent_reference)>=3)));
create table notifications.outbox(id uuid primary key default gen_random_uuid(),notification_id uuid not null references notifications.inbox(id),channel text not null check(channel in ('EMAIL','WHATSAPP')),status text not null default 'PENDING' check(status in ('PENDING','PROCESSING','SENT','FAILED','CANCELLED')),attempts integer not null default 0,available_at timestamptz not null default now(),lease_until timestamptz,claim_token uuid,updated_at timestamptz not null default now(),unique(notification_id,channel));
alter table notifications.delivery_preferences enable row level security;alter table notifications.outbox enable row level security;
revoke all on notifications.delivery_preferences,notifications.outbox from public,anon,authenticated;
create function notifications.recipient_source_access(item notifications.inbox) returns boolean language plpgsql stable security definer set search_path='' as $$
declare c content.managed_items;k intake.cases;m management.records;
begin
 if not governance.actor_permission(item.recipient_account_id,'NOTIFICATION_READ',item.organization_id,item.period_id,item.division_id,null) then return false;end if;
 if item.required_permission='CONTENT_ACCESS' then return governance.actor_permission(item.recipient_account_id,'CONTENT_DRAFT_WRITE',item.organization_id,item.period_id,item.division_id,item.entity_id) or governance.actor_permission(item.recipient_account_id,'CONTENT_REVIEW',item.organization_id,item.period_id,item.division_id,item.entity_id) or governance.actor_permission(item.recipient_account_id,'CONTENT_PUBLISH',item.organization_id,item.period_id,item.division_id,item.entity_id);end if;
 if not governance.actor_permission(item.recipient_account_id,item.required_permission,item.organization_id,item.period_id,item.division_id,item.entity_id) then return false;end if;
 if item.required_permission='CASE_READ' then
  select * into k from intake.cases where id=item.entity_id;return k.id is not null and (k.secretary_account_id=item.recipient_account_id or exists(select 1 from intake.case_personnel where case_id=k.id and account_id=item.recipient_account_id and active));
 end if;
 if item.required_permission in ('EVALUATION_READ','HANDOVER_READ') then
  select * into m from management.records where id=item.entity_id;
  return m.id is not null and item.recipient_account_id in (m.created_by_account_id,m.subject_account_id,m.reviewer_account_id);
 end if;
 return true;
end $$;
create function public.kpi_delivery_preferences(input jsonb default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();p notifications.delivery_preferences;
begin
 if actor is null then raise exception 'Access denied' using errcode='42501';end if;
 if input is not null then
  if jsonb_typeof(input->'emailEnabled') is distinct from 'boolean' or jsonb_typeof(input->'whatsappEnabled') is distinct from 'boolean' or length(coalesce(input->>'consentReference',''))>500 then raise exception 'Invalid delivery preferences' using errcode='22023';end if;
  if (input->>'whatsappEnabled')::boolean and (input->>'whatsappNumber' is null or input->>'whatsappNumber' !~ '^\+[1-9][0-9]{7,14}$' or coalesce(length(trim(input->>'consentReference')),0)<3) then raise exception 'Contact and consent required' using errcode='22023';end if;
  insert into notifications.delivery_preferences values(actor,(input->>'emailEnabled')::boolean,(input->>'whatsappEnabled')::boolean,input->>'whatsappNumber',input->>'consentReference',now()) on conflict(account_id) do update set email_enabled=excluded.email_enabled,whatsapp_enabled=excluded.whatsapp_enabled,whatsapp_number=excluded.whatsapp_number,consent_reference=excluded.consent_reference,updated_at=now();
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('NOTIFICATION_PREFERENCES_UPDATED','notifications','account',actor,'SUCCESS','hosted:'||gen_random_uuid(),'{}');
 end if;
 select * into p from notifications.delivery_preferences where account_id=actor;
 return jsonb_build_object('emailEnabled',coalesce(p.email_enabled,false),'whatsappEnabled',coalesce(p.whatsapp_enabled,false),'whatsappNumber',p.whatsapp_number,'consentReference',p.consent_reference);
end $$;
create function public.kpi_enqueue_reminders() returns integer language plpgsql security definer set search_path='' as $$
declare t work.tasks;m work.meetings;recipient uuid;count integer:=0;
begin
 for t in select * from work.tasks where status in ('OPEN','IN_PROGRESS','REVISION') and due_at is not null and due_at<=now()+interval '24 hours' and due_at>=now()-interval '7 days' loop
  if governance.actor_permission(t.owner_account_id,'TASK_READ',t.organization_id,t.period_id,t.division_id,t.id) then perform notifications.enqueue(array[t.owner_account_id],t.organization_id,t.period_id,t.division_id,t.id,'TASK_READ','reminder:task:'||t.id||':'||current_date,'Tenggat pekerjaan perlu diperiksa.','/portal/tugas');count:=count+1;end if;
 end loop;
 for m in select * from work.meetings where status<>'ARCHIVED' and starts_at between now() and now()+interval '24 hours' loop
  for recipient in select account_id from work.meeting_participants where meeting_id=m.id loop
   if governance.actor_permission(recipient,'MEETING_READ',m.organization_id,m.period_id,m.division_id,m.id) then perform notifications.enqueue(array[recipient],m.organization_id,m.period_id,m.division_id,m.id,'MEETING_READ','reminder:meeting:'||m.id||':'||current_date,'Agenda rapat mendatang tersedia.','/portal/rapat');count:=count+1;end if;
  end loop;
 end loop;
 insert into notifications.outbox(notification_id,channel) select n.id,c.channel from notifications.inbox n join notifications.delivery_preferences p on p.account_id=n.recipient_account_id cross join (values('EMAIL'),('WHATSAPP')) c(channel) where n.created_at>=now()-interval '7 days' and n.read_at is null and ((c.channel='EMAIL' and p.email_enabled) or (c.channel='WHATSAPP' and p.whatsapp_enabled)) and notifications.recipient_source_access(n) on conflict do nothing;
 return count;
end $$;
create function public.kpi_delivery_claim(delivery_channel text) returns jsonb language plpgsql security definer set search_path='' as $$
declare o notifications.outbox;n notifications.inbox;p notifications.delivery_preferences;a identity.accounts;token uuid;
begin
 if delivery_channel not in ('EMAIL','WHATSAPP') then raise exception 'Invalid channel' using errcode='22023';end if;
 for o in select * from notifications.outbox where channel=delivery_channel and attempts<5 and ((status in ('PENDING','FAILED') and available_at<=now()) or (status='PROCESSING' and lease_until<now())) order by available_at limit 20 for update skip locked loop
  select * into n from notifications.inbox where id=o.notification_id;select * into p from notifications.delivery_preferences where account_id=n.recipient_account_id;select * into a from identity.accounts where id=n.recipient_account_id;
  if n.read_at is not null or not notifications.recipient_source_access(n) or (delivery_channel='EMAIL' and not coalesce(p.email_enabled,false)) or (delivery_channel='WHATSAPP' and not coalesce(p.whatsapp_enabled,false)) then update notifications.outbox set status='CANCELLED',updated_at=now() where id=o.id;continue;end if;
  token:=gen_random_uuid();update notifications.outbox set status='PROCESSING',attempts=attempts+1,lease_until=now()+interval '2 minutes',claim_token=token,updated_at=now() where id=o.id;
  return jsonb_build_object('id',o.id,'claimToken',token,'channel',delivery_channel,'recipient',case when delivery_channel='EMAIL' then a.email else p.whatsapp_number end,'message','Ada pembaruan pekerjaan KPI. Masuk ke portal untuk melihat informasi sesuai izin Anda.','href','/portal/notifikasi');
 end loop;return null;
end $$;
create function public.kpi_delivery_finish(delivery_id uuid,token uuid,sent boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 update notifications.outbox set status=case when sent then 'SENT' else 'FAILED' end,available_at=now()+interval '1 hour',lease_until=null,updated_at=now() where id=delivery_id and claim_token=token and status='PROCESSING';
 if not found then raise exception 'Delivery claim expired' using errcode='40001';end if;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('NOTIFICATION_DELIVERY','notifications','delivery',delivery_id,case when sent then 'SUCCESS' else 'FAILURE' end,'hosted:'||gen_random_uuid(),'{}');
end $$;
revoke all on function notifications.recipient_source_access(notifications.inbox),public.kpi_delivery_preferences(jsonb),public.kpi_enqueue_reminders(),public.kpi_delivery_claim(text),public.kpi_delivery_finish(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.kpi_delivery_preferences(jsonb) to authenticated;
grant execute on function public.kpi_enqueue_reminders(),public.kpi_delivery_claim(text),public.kpi_delivery_finish(uuid,uuid,boolean) to service_role;
create function public.kpi_delivery_validate(delivery_id uuid,token uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from notifications.outbox o join notifications.inbox n on n.id=o.notification_id join notifications.delivery_preferences p on p.account_id=n.recipient_account_id where o.id=delivery_id and o.claim_token=token and o.status='PROCESSING' and o.lease_until>now() and n.read_at is null and notifications.recipient_source_access(n) and ((o.channel='EMAIL' and p.email_enabled) or (o.channel='WHATSAPP' and p.whatsapp_enabled)));
$$;
revoke all on function public.kpi_delivery_validate(uuid,uuid) from public,anon,authenticated;
grant execute on function public.kpi_delivery_validate(uuid,uuid) to service_role;
notify pgrst,'reload schema';
commit;
