begin;
create schema if not exists notifications;
revoke all on schema notifications from public,anon,authenticated;
create table notifications.inbox (
 id uuid primary key default gen_random_uuid(),recipient_account_id uuid not null references identity.accounts(id),organization_id uuid not null references org.organizations(id),
 period_id uuid not null references org.periods(id),division_id uuid references org.divisions(id),entity_id uuid not null,required_permission text not null,
 title text not null,href text not null,event_key text not null,created_at timestamptz not null default now(),read_at timestamptz,
 unique(recipient_account_id,event_key)
);
alter table notifications.inbox enable row level security;
revoke all on notifications.inbox from public,anon,authenticated;
create function notifications.source_access(wanted text,oid uuid,pid uuid,did uuid,entity uuid) returns boolean language sql stable security definer set search_path='' as $$
 select case when wanted='CONTENT_ACCESS' then content.can_read('PUBLICATION',oid,pid,did,entity) else identity.has_permission(wanted,oid,pid,did,entity) end;
$$;
revoke all on function notifications.source_access(text,uuid,uuid,uuid,uuid) from public,anon,authenticated;
create policy own_notification_read on notifications.inbox for select to authenticated using(recipient_account_id=identity.current_account_id() and identity.has_permission('NOTIFICATION_READ',organization_id,period_id,division_id) and notifications.source_access(required_permission,organization_id,period_id,division_id,entity_id));
create function notifications.enqueue(recipients uuid[],oid uuid,pid uuid,did uuid,entity uuid,wanted text,event text,title text,href text) returns void language sql security definer set search_path='' as $$
 insert into notifications.inbox(recipient_account_id,organization_id,period_id,division_id,entity_id,required_permission,event_key,title,href)
 select distinct a.id,oid,pid,did,entity,wanted,event,title,href from identity.accounts a where a.id=any(recipients) and a.status='ACTIVE' and a.deactivated_at is null on conflict(recipient_account_id,event_key) do nothing;
$$;
revoke all on function notifications.enqueue(uuid[],uuid,uuid,uuid,uuid,text,text,text,text) from public,anon,authenticated;
create function notifications.task_event() returns trigger language plpgsql security definer set search_path='' as $$
declare item work.tasks; recipients uuid[];
begin
 select * into item from work.tasks where id=new.task_id;
 select array_agg(distinct a) into recipients from unnest(array[item.owner_account_id,item.created_by_account_id,new.actor_account_id]||
 coalesce((select array_agg(account_id) from identity.permission_grants where organization_id=item.organization_id and period_id=item.period_id
 and permission='TASK_REVIEW' and (division_id is null or division_id=item.division_id) and (object_id is null or object_id=item.id) and revoked_at is null and starts_at<=now() and (expires_at is null or expires_at>now())),'{}'::uuid[])) a;
 perform notifications.enqueue(recipients,item.organization_id,item.period_id,item.division_id,item.id,'TASK_READ','task:'||new.id,'Tugas diperbarui: '||item.title,'/portal/tugas');return new;
end $$;
create trigger task_inbox after insert on work.task_events for each row execute function notifications.task_event();
create function notifications.meeting_event() returns trigger language plpgsql security definer set search_path='' as $$
declare item work.meetings; recipients uuid[];
begin
 select * into item from work.meetings where id=new.meeting_id;
 select array_agg(account_id) into recipients from work.meeting_participants where meeting_id=item.id;
 perform notifications.enqueue(coalesce(recipients,'{}'::uuid[])||array[item.created_by_account_id,new.actor_account_id],item.organization_id,item.period_id,item.division_id,item.id,'MEETING_READ','meeting:'||new.id,'Rapat diperbarui: '||item.title,'/portal/rapat');return new;
end $$;
create trigger meeting_inbox after insert on work.meeting_events for each row execute function notifications.meeting_event();
create function notifications.content_event() returns trigger language plpgsql security definer set search_path='' as $$
declare item content.managed_items; recipients uuid[];wanted text;
begin
 select * into item from content.managed_items where id=new.item_id;
 wanted:=case when item.kind='KNOWLEDGE' then 'KNOWLEDGE_REVIEW' else 'CONTENT_REVIEW' end;
 select coalesce(array_agg(account_id),'{}'::uuid[]) into recipients from identity.permission_grants where organization_id=item.organization_id and period_id=item.period_id and permission=wanted
 and (division_id is null or division_id=item.division_id) and (object_id is null or object_id=item.id) and revoked_at is null and starts_at<=now() and (expires_at is null or expires_at>now());
 perform notifications.enqueue(recipients||array[item.created_by_account_id,item.author_account_id,new.actor_account_id],item.organization_id,item.period_id,item.division_id,item.id,
 case when item.kind='KNOWLEDGE' then 'KNOWLEDGE_READ' else 'CONTENT_ACCESS' end,'content:'||item.id||':'||new.version,'Konten diperbarui: '||item.title,
 case when item.kind='KNOWLEDGE' then '/portal/knowledge' else '/portal/editor' end);return new;
end $$;
create trigger content_inbox after insert on content.managed_revisions for each row execute function notifications.content_event();
revoke all on function notifications.task_event(),notifications.meeting_event(),notifications.content_event() from public,anon,authenticated;
create function public.kpi_notifications_list() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();
begin
 if actor is null then raise exception 'Access denied' using errcode='42501';end if;
 return(select coalesce(jsonb_agg(jsonb_build_object('id',n.id,'title',n.title,'href',n.href,'createdAt',n.created_at,'readAt',n.read_at) order by n.created_at desc,n.id),'[]'::jsonb)
 from(select * from notifications.inbox t where t.recipient_account_id=actor and identity.has_permission('NOTIFICATION_READ',t.organization_id,t.period_id,t.division_id)
 and notifications.source_access(t.required_permission,t.organization_id,t.period_id,t.division_id,t.entity_id) order by t.created_at desc,t.id limit 100) n);
end $$;
create function public.kpi_notification_read(notification_id uuid) returns boolean language plpgsql security definer set search_path='' as $$
declare item notifications.inbox;
begin
 select * into item from notifications.inbox where id=notification_id for update;
 if item.id is null or item.recipient_account_id<>identity.current_account_id() or not identity.has_permission('NOTIFICATION_READ',item.organization_id,item.period_id,item.division_id)
 or not notifications.source_access(item.required_permission,item.organization_id,item.period_id,item.division_id,item.entity_id) then raise exception 'Access denied' using errcode='42501';end if;
 update notifications.inbox set read_at=coalesce(read_at,now()) where id=item.id;return true;
end $$;
revoke all on function public.kpi_notifications_list(),public.kpi_notification_read(uuid) from public,anon;
grant execute on function public.kpi_notifications_list(),public.kpi_notification_read(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
