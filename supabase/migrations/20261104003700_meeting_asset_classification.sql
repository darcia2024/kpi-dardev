begin;
-- Meetings join the classification register. Existing meetings become INTERNAL, which is how they were already treated.
create function governance.meeting_resource() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into governance.information_resources(id,organization_id,period_id,kind,classification) values(new.id,new.organization_id,new.period_id,'MEETING','INTERNAL') on conflict(id) do nothing;return new;end $$;
insert into governance.information_resources(id,organization_id,period_id,kind,classification) select id,organization_id,period_id,'MEETING','INTERNAL' from work.meetings on conflict(id) do nothing;
create trigger meeting_classification after insert on work.meetings for each row execute function governance.meeting_resource();

-- Internal: holders of the meeting permission or invited members. Restricted or secret: permission and invitation.
create function work.meeting_can_read(item work.meetings) returns boolean language sql stable security definer set search_path='' as $$
 select case when coalesce((select governance.classification_rank(r.classification) from governance.information_resources r where r.id=item.id),1)<=1 then
  identity.has_permission('MEETING_READ',item.organization_id,item.period_id,item.division_id,item.id)
  or (identity.is_active_member(item.organization_id,item.period_id) and exists(select 1 from work.meeting_participants p where p.meeting_id=item.id and p.account_id=identity.current_account_id()))
 else identity.is_super_admin(item.organization_id) and identity.has_permission('MEETING_READ',item.organization_id,item.period_id,item.division_id,item.id)
  or (identity.has_permission('MEETING_READ',item.organization_id,item.period_id,item.division_id,item.id) and exists(select 1 from work.meeting_participants p where p.meeting_id=item.id and p.account_id=identity.current_account_id()))
 end
 or (item.created_by_account_id=identity.current_account_id() and identity.has_permission('MEETING_READ',item.organization_id,item.period_id,item.division_id));
$$;
revoke all on function work.meeting_can_read(work.meetings) from public,anon,authenticated;
-- Used for reminders and delivery, where the reader is not the signed-in account.
create function work.meeting_recipient_can_read(item work.meetings,recipient uuid) returns boolean language sql stable security definer set search_path='' as $$
 select governance.actor_permission(recipient,'MEETING_READ',item.organization_id,item.period_id,item.division_id,item.id)
 or (coalesce((select governance.classification_rank(r.classification) from governance.information_resources r where r.id=item.id),1)<=1
  and exists(select 1 from work.meeting_participants p where p.meeting_id=item.id and p.account_id=recipient)
  and exists(select 1 from org.assignments s join org.positions pos on pos.id=s.position_id join org.periods t on t.id=s.period_id join identity.accounts a on a.id=s.account_id where s.account_id=recipient and s.period_id=item.period_id and pos.organization_id=item.organization_id and t.status in ('ACTIVE','CLOSING') and current_date between t.starts_on and t.ends_on and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date) and a.status='ACTIVE' and a.deactivated_at is null));
$$;
revoke all on function work.meeting_recipient_can_read(work.meetings,uuid) from public,anon,authenticated;

create or replace function work.meeting_json(item work.meetings) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',item.id,'title',item.title,'agenda',item.agenda,'startsAt',item.starts_at,
 'classification',coalesce((select r.classification from governance.information_resources r where r.id=item.id),'INTERNAL'),
 'divisionCode',(select code from org.divisions where id=item.division_id),'createdByAccountId',item.created_by_account_id,
 'minutesAuthorId',item.minutes_author_id,'minutesSummary',item.minutes_summary,'status',item.status,'version',item.version,'updatedAt',item.updated_at,
 'participants',(select coalesce(jsonb_agg(jsonb_build_object('accountId',p.account_id,'name',a.display_name,'response',p.response,'attendance',p.attendance) order by a.display_name,p.account_id),'[]'::jsonb)
 from work.meeting_participants p join identity.accounts a on a.id=p.account_id where p.meeting_id=item.id),
 'motions',(select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'text',m.text,'quorum',m.quorum,'eligibleCount',cardinality(m.eligible_ids),
 'votesCast',(select count(*) from work.meeting_votes v where v.motion_id=m.id),'closedAt',m.closed_at,
 'tally',case when m.closed_at is not null then jsonb_build_object('SETUJU',(select count(*) from work.meeting_votes v where v.motion_id=m.id and v.choice='SETUJU'),
 'TOLAK',(select count(*) from work.meeting_votes v where v.motion_id=m.id and v.choice='TOLAK'),'ABSTAIN',(select count(*) from work.meeting_votes v where v.motion_id=m.id and v.choice='ABSTAIN')) else null end) order by m.opened_at),'[]'::jsonb)
 from work.meeting_motions m where m.meeting_id=item.id),
 'events',(select coalesce(jsonb_agg(jsonb_build_object('action',e.action,'actorName',a.display_name,'note',e.note,'version',e.version,'createdAt',e.created_at) order by e.version),'[]'::jsonb)
 from work.meeting_events e join identity.accounts a on a.id=e.actor_account_id where e.meeting_id=item.id));
$$;

create or replace function public.kpi_meetings_list(organization_code text,period_code text,division_code text default null) returns jsonb
 language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid; pid uuid; did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code; end if;
 if oid is null or (division_code is not null and did is null) or not (identity.has_permission('MEETING_READ',oid,pid,did) or identity.is_active_member(oid,pid,did)) then raise exception 'Access denied' using errcode='42501'; end if;
 return (select coalesce(jsonb_agg(work.meeting_json(m) order by m.starts_at desc,m.id),'[]'::jsonb) from
 (select * from work.meetings t where t.organization_id=oid and t.period_id=pid and (division_code is null or t.division_id=did)
 and work.meeting_can_read(t) order by t.starts_at desc,t.id limit 100) m);
end $$;

create or replace function public.kpi_meeting_detail(meeting_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item work.meetings;
begin
 select * into item from work.meetings where id=meeting_id;
 if item.id is null or not work.meeting_can_read(item) then raise exception 'Access denied' using errcode='42501'; end if;
 return work.meeting_json(item);
end $$;

alter function public.kpi_meeting_create(text,text,jsonb,text) rename to kpi_meeting_create_before_classification;
revoke all on function public.kpi_meeting_create_before_classification(text,text,jsonb,text) from public,anon,authenticated;
create function public.kpi_meeting_create(organization_code text,period_code text,input jsonb,division_code text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;class text:=coalesce(input->>'classification','INTERNAL');item work.meetings;
begin
 if class not in ('INTERNAL','TERBATAS','RAHASIA') then raise exception 'Invalid classification' using errcode='22023';end if;
 result:=public.kpi_meeting_create_before_classification(organization_code,period_code,input,division_code);
 update governance.information_resources set classification=class,classification_reference='Ditetapkan pembuat rapat' where id=(result->>'id')::uuid and version=1 and classification='INTERNAL' and class<>'INTERNAL';
 select * into item from work.meetings where id=(result->>'id')::uuid;
 return work.meeting_json(item);
end $$;
revoke all on function public.kpi_meeting_create(text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.kpi_meeting_create(text,text,jsonb,text) to authenticated;

-- RSVP and votes no longer need a note. A creator keeps managing their own meeting even if it is classified above their grant.
create or replace function public.kpi_meeting_action(meeting_id uuid,expected_version integer,command text,input jsonb) returns jsonb
 language plpgsql security definer set search_path='' as $$
declare item work.meetings; actor uuid:=identity.current_account_id(); motion work.meeting_motions; eligible uuid[]; target uuid; manage boolean; note text;
begin
 select * into item from work.meetings where id=meeting_id for update;
 if item.id is null or not work.meeting_can_read(item) then raise exception 'Access denied' using errcode='42501'; end if;
 if expected_version is null or item.version<>expected_version then raise exception 'Meeting changed; reload first' using errcode='40001'; end if;
 note:=nullif(trim(input->>'note'),'');
 if command='RSVP' then note:=coalesce(note,'Konfirmasi kehadiran.'); elsif command='VOTE' then note:=coalesce(note,'Suara diberikan.'); end if;
 if item.status='ARCHIVED' or input is null or coalesce(length(note),0) not between 3 and 2000 then raise exception 'Invalid action' using errcode='22023'; end if;
 manage:=identity.has_permission('MEETING_MANAGE',item.organization_id,item.period_id,item.division_id,item.id)
  or (item.created_by_account_id=actor and identity.has_permission('MEETING_MANAGE',item.organization_id,item.period_id,item.division_id));
 if command not in ('RSVP','VOTE') and not manage then raise exception 'Access denied' using errcode='42501'; end if;
 if command='SAVE_MINUTES' then
 if item.status not in ('DRAFT','REVISION') or coalesce(length(trim(input->>'summary')),0) not between 3 and 16000 then raise exception 'Invalid minutes' using errcode='22023'; end if;
 item.minutes_summary:=trim(input->>'summary'); item.minutes_author_id:=actor; item.status:='DRAFT';
 elsif command='SUBMIT_MINUTES' then
 if item.status not in ('DRAFT','REVISION') or length(item.minutes_summary)<3 or exists(select 1 from work.meeting_motions where meeting_motions.meeting_id=item.id and closed_at is null) then raise exception 'Minutes not ready' using errcode='22023'; end if;
 item.status:='IN_REVIEW';
 elsif command in ('APPROVE_MINUTES','REQUEST_REVISION') then
 if actor in (item.created_by_account_id,item.minutes_author_id) then raise exception 'Independent reviewer required' using errcode='42501'; end if;
 if item.status<>'IN_REVIEW' then raise exception 'Invalid review transition' using errcode='22023'; end if;
 item.status:=case when command='APPROVE_MINUTES' then 'FINAL' else 'REVISION' end;
 elsif command='ARCHIVE' then
 if item.status<>'FINAL' then raise exception 'Finalize minutes first' using errcode='22023'; end if; item.status:='ARCHIVED';
 elsif command='RSVP' then
 if item.starts_at<=now() or input->>'response' is null or input->>'response' not in ('HADIR','TIDAK_HADIR','RAGU') or not exists(select 1 from work.meeting_participants where meeting_participants.meeting_id=item.id and account_id=actor) then raise exception 'Invalid RSVP' using errcode='22023'; end if;
 update work.meeting_participants set response=input->>'response' where meeting_participants.meeting_id=item.id and account_id=actor;
 elsif command='ATTENDANCE' then
 target:=(input->>'accountId')::uuid;
 if item.status not in ('DRAFT','REVISION') or input->>'attendance' is null or input->>'attendance' not in ('HADIR','IZIN','TIDAK_HADIR')
 or not exists(select 1 from work.meeting_participants where meeting_participants.meeting_id=item.id and account_id=target) then raise exception 'Invalid attendance' using errcode='22023'; end if;
 update work.meeting_participants set attendance=input->>'attendance' where meeting_participants.meeting_id=item.id and account_id=target;
 elsif command='OPEN_MOTION' then
 select coalesce(array_agg(account_id),'{}'::uuid[]) into eligible from work.meeting_participants where meeting_participants.meeting_id=item.id and attendance='HADIR';
 if item.status not in ('DRAFT','REVISION') or coalesce(length(trim(input->>'text')),0) not between 3 and 2000 or coalesce((input->>'quorum')::int,0) not between 1 and cardinality(eligible)
 or exists(select 1 from work.meeting_motions where meeting_motions.meeting_id=item.id and closed_at is null) then raise exception 'Invalid motion or quorum' using errcode='22023'; end if;
 insert into work.meeting_motions(meeting_id,text,quorum,eligible_ids) values(item.id,trim(input->>'text'),(input->>'quorum')::int,eligible);
 elsif command in ('VOTE','CLOSE_MOTION') then
 select * into motion from work.meeting_motions where id=(input->>'motionId')::uuid and meeting_motions.meeting_id=item.id for update;
 if motion.id is null or motion.closed_at is not null or item.status not in ('DRAFT','REVISION') then raise exception 'Motion not open' using errcode='22023'; end if;
 if command='VOTE' then
 if not actor=any(motion.eligible_ids) then raise exception 'Not eligible to vote' using errcode='42501'; end if;
 if input->>'choice' is null or input->>'choice' not in ('SETUJU','TOLAK','ABSTAIN') then raise exception 'Invalid vote' using errcode='22023'; end if;
 if exists(select 1 from work.meeting_votes where motion_id=motion.id and voter_account_id=actor) then raise exception 'Vote already recorded' using errcode='40001'; end if;
 insert into work.meeting_votes(motion_id,voter_account_id,choice) values(motion.id,actor,input->>'choice');
 else update work.meeting_motions set closed_at=now() where id=motion.id; end if;
 else raise exception 'Unknown meeting action' using errcode='22023'; end if;
 update work.meetings set status=item.status,minutes_summary=item.minutes_summary,minutes_author_id=item.minutes_author_id,version=version+1,updated_at=now() where id=item.id returning * into item;
 insert into work.meeting_events(meeting_id,actor_account_id,action,note,version) values(item.id,actor,command,note,item.version);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
 values('MEETING_'||command,'meeting','meeting',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'version',item.version));
 return work.meeting_json(item);
exception when invalid_text_representation then raise exception 'Invalid meeting action values' using errcode='22023';
end $$;

create or replace function files.module_context(module text,entity uuid,write_access boolean default false) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare m work.meetings;c content.managed_items;k intake.cases;oid uuid;pid uuid;did uuid;version integer;editable boolean;allowed boolean;
begin
 if module='MEETING' then
  select * into m from work.meetings where id=entity;oid:=m.organization_id;pid:=m.period_id;did:=m.division_id;version:=m.version;editable:=m.status in ('DRAFT','REVISION');
  allowed:=work.meeting_can_read(m) and (not write_access or identity.has_permission('MEETING_MANAGE',oid,pid,did,entity) or (m.created_by_account_id=identity.current_account_id() and identity.has_permission('MEETING_MANAGE',oid,pid,did)));
 elsif module='CONTENT' then
  select * into c from content.managed_items where id=entity;oid:=c.organization_id;pid:=c.period_id;did:=c.division_id;version:=c.version;editable:=c.status in ('DRAFT','REVISION');
  allowed:=content.can_read(c.kind,oid,pid,did,entity) and (not write_access or identity.has_permission(case when c.kind='KNOWLEDGE' then 'KNOWLEDGE_WRITE' else 'CONTENT_DRAFT_WRITE' end,oid,pid,did,entity));
 elsif module='CASE' then
  select * into k from intake.cases where id=entity;oid:=k.organization_id;pid:=k.period_id;did:=k.iod_division_id;version:=k.version;editable:=k.status in ('RECEIVED','TRIAGED','IN_PROGRESS');
  allowed:=intake.can_read(k) and (not write_access or intake.permission('CASE_MANAGE',k));
 end if;
 if oid is null or coalesce(allowed,false)=false or (write_access and not editable) then raise exception 'Access denied or finalized' using errcode='42501';end if;
 return jsonb_build_object('organizationId',oid,'periodId',pid,'divisionId',did,'version',version,'classification',coalesce((select classification from governance.information_resources where id=entity),'INTERNAL'));
end $$;

alter function public.kpi_workspace_snapshot(text,text,text) rename to kpi_workspace_snapshot_before_classification;
revoke all on function public.kpi_workspace_snapshot_before_classification(text,text,text) from public,anon,authenticated;
create function public.kpi_workspace_snapshot(organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare result jsonb:=public.kpi_workspace_snapshot_before_classification(organization_code,period_code,division_code);oid uuid;pid uuid;did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 return result||jsonb_build_object('meetings',(select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'title',m.title,'startsAt',m.starts_at,'status',m.status) order by m.starts_at),'[]'::jsonb) from work.meetings m where m.organization_id=oid and m.period_id=pid and (did is null or m.division_id=did) and m.status<>'ARCHIVED' and m.starts_at>=now()-interval '1 day' and work.meeting_can_read(m)));
end $$;
revoke all on function public.kpi_workspace_snapshot(text,text,text) from public,anon,authenticated;
grant execute on function public.kpi_workspace_snapshot(text,text,text) to authenticated;

-- Notifications follow the same read rule. ACCESS_REVIEW_DUE is the three-month review reminder (a reminder only; access is not suspended).
create or replace function notifications.source_access(wanted text,oid uuid,pid uuid,did uuid,entity uuid) returns boolean language sql stable security definer set search_path='' as $$
 select case when wanted='CASE_ACCESS' then exists(select 1 from intake.cases c where c.id=entity and c.organization_id=oid and c.period_id=pid and intake.can_read(c))
 when wanted='CONTENT_ACCESS' then content.can_read('PUBLICATION',oid,pid,did,entity)
 when wanted='MEETING_READ' then exists(select 1 from work.meetings m where m.id=entity and work.meeting_can_read(m))
 when wanted='ACCESS_REVIEW_DUE' then exists(select 1 from governance.access_decisions d where d.id=entity and (identity.current_account_id()=d.approved_by_account_id or governance.authorized(identity.current_account_id(),'SOP_ACCESS_REVIEW',d.organization_id,d.period_id,d.division_id,d.classification,d.object_id)))
 else identity.has_permission(wanted,oid,pid,did,entity) end;
$$;
create or replace function notifications.recipient_source_access(item notifications.inbox) returns boolean language plpgsql stable security definer set search_path='' as $$
declare c content.managed_items;k intake.cases;m management.records;t work.meetings;d governance.access_decisions;
begin
 if not governance.actor_permission(item.recipient_account_id,'NOTIFICATION_READ',item.organization_id,item.period_id,item.division_id,null) then return false;end if;
 if item.required_permission='CONTENT_ACCESS' then return governance.actor_permission(item.recipient_account_id,'CONTENT_DRAFT_WRITE',item.organization_id,item.period_id,item.division_id,item.entity_id) or governance.actor_permission(item.recipient_account_id,'CONTENT_REVIEW',item.organization_id,item.period_id,item.division_id,item.entity_id) or governance.actor_permission(item.recipient_account_id,'CONTENT_PUBLISH',item.organization_id,item.period_id,item.division_id,item.entity_id);end if;
 if item.required_permission='MEETING_READ' then select * into t from work.meetings where id=item.entity_id;return t.id is not null and work.meeting_recipient_can_read(t,item.recipient_account_id);end if;
 if item.required_permission='ACCESS_REVIEW_DUE' then select * into d from governance.access_decisions where id=item.entity_id;return d.id is not null and (item.recipient_account_id=d.approved_by_account_id or governance.authorized(item.recipient_account_id,'SOP_ACCESS_REVIEW',d.organization_id,d.period_id,d.division_id,d.classification,d.object_id));end if;
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
create or replace function public.kpi_enqueue_reminders() returns integer language plpgsql security definer set search_path='' as $$
declare t work.tasks;m work.meetings;d governance.access_decisions;recipient uuid;count integer:=0;
begin
 for t in select * from work.tasks where status in ('OPEN','IN_PROGRESS','REVISION') and due_at is not null and due_at<=now()+interval '24 hours' and due_at>=now()-interval '7 days' loop
  if governance.actor_permission(t.owner_account_id,'TASK_READ',t.organization_id,t.period_id,t.division_id,t.id) then perform notifications.enqueue(array[t.owner_account_id],t.organization_id,t.period_id,t.division_id,t.id,'TASK_READ','reminder:task:'||t.id||':'||current_date,'Tenggat pekerjaan perlu diperiksa.','/portal/tugas');count:=count+1;end if;
 end loop;
 for m in select * from work.meetings where status<>'ARCHIVED' and starts_at between now() and now()+interval '24 hours' loop
  for recipient in select account_id from work.meeting_participants where meeting_id=m.id loop
   if work.meeting_recipient_can_read(m,recipient) then perform notifications.enqueue(array[recipient],m.organization_id,m.period_id,m.division_id,m.id,'MEETING_READ','reminder:meeting:'||m.id||':'||current_date,'Agenda rapat mendatang tersedia.','/portal/rapat');count:=count+1;end if;
  end loop;
 end loop;
 for d in select * from governance.access_decisions where revoked_at is null and suspended_at is null and implemented_at is not null and expires_at>now() and review_due_at<=now()+interval '7 days' loop
  perform notifications.enqueue(array[d.approved_by_account_id]||coalesce((select array_agg(a.account_id) from governance.access_authorities a where a.organization_id=d.organization_id and a.period_id=d.period_id and 'SOP_ACCESS_REVIEW'=any(a.permissions) and a.revoked_at is null and a.starts_at<=now() and a.expires_at>now() and a.account_id<>d.recipient_account_id),'{}'::uuid[]),d.organization_id,d.period_id,d.division_id,d.id,'ACCESS_REVIEW_DUE','reminder:access-review:'||d.id||':'||to_char(current_date,'IYYY-IW'),'Peninjauan hak akses perlu dilakukan.','/portal/kebijakan');count:=count+1;
 end loop;
 insert into notifications.outbox(notification_id,channel) select n.id,c.channel from notifications.inbox n join notifications.delivery_preferences p on p.account_id=n.recipient_account_id cross join (values('EMAIL'),('WHATSAPP')) c(channel) where n.created_at>=now()-interval '7 days' and n.read_at is null and ((c.channel='EMAIL' and p.email_enabled) or (c.channel='WHATSAPP' and p.whatsapp_enabled)) and notifications.recipient_source_access(n) on conflict do nothing;
 return count;
end $$;

-- Documents: the uploader chooses the classification and always keeps sight of their own file.
create function files.can_read(item files.managed_assets) returns boolean language sql stable security definer set search_path='' as $$
 select identity.has_permission('ASSET_READ',item.organization_id,item.period_id,item.division_id,item.id)
 or (item.owner_account_id=identity.current_account_id() and identity.is_active_member(item.organization_id,item.period_id));
$$;
revoke all on function files.can_read(files.managed_assets) from public,anon,authenticated;
create or replace function files.asset_json(item files.managed_assets) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',item.id,'name',item.original_name,'mimeType',item.mime_type,'sizeBytes',item.size_bytes,'status',item.status,'createdAt',item.created_at,'ownerAccountId',item.owner_account_id,'rootAssetId',coalesce(item.root_asset_id,item.id),'revision',item.revision,
 'classification',(select r.classification from governance.information_resources r where r.id=item.id));
$$;
create or replace function public.kpi_assets_list(organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or (not identity.has_permission('ASSET_READ',oid,pid,did) and not exists(select 1 from files.managed_assets a where a.organization_id=oid and a.period_id=pid and (did is null or a.division_id=did) and files.can_read(a))) then raise exception 'Access denied' using errcode='42501';end if;
 return(select coalesce(jsonb_agg(files.asset_json(t) order by t.created_at desc,t.id),'[]'::jsonb) from (select * from files.managed_assets a where a.organization_id=oid and a.period_id=pid
 and (division_code is null or a.division_id=did) and files.can_read(a) order by a.created_at desc,a.id limit 100) t);
end $$;
create or replace function public.kpi_asset_register(organization_code text,period_code text,input jsonb,division_code text default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare previous files.managed_assets;item files.managed_assets;result jsonb;root uuid;revision_number integer;previous_id uuid:=nullif(input->>'previousAssetId','')::uuid;actor uuid:=identity.current_account_id();class text:=input->>'classification';already boolean;
begin
 if class is not null and class not in ('INTERNAL','TERBATAS','RAHASIA') then raise exception 'Invalid classification' using errcode='22023';end if;
 if previous_id is not null then
  select * into previous from files.managed_assets where id=previous_id;
  if previous.id is null or not (
   (previous.owner_account_id=actor and files.can_read(previous) and identity.has_permission('ASSET_UPLOAD',previous.organization_id,previous.period_id,previous.division_id))
   or (identity.has_permission('ASSET_READ',previous.organization_id,previous.period_id,previous.division_id,previous.id) and identity.has_permission('ASSET_UPLOAD',previous.organization_id,previous.period_id,previous.division_id,previous.id))) then raise exception 'Version access denied' using errcode='42501';end if;
  if exists(select 1 from governance.information_resources where id=previous.id and hold_reference is not null) then raise exception 'Evidence hold: create a separate document' using errcode='42501';end if;
  root:=coalesce(previous.root_asset_id,previous.id);perform pg_advisory_xact_lock(hashtextextended('asset-version:'||root::text,0));
 end if;
 already:=exists(select 1 from files.managed_assets a where a.owner_account_id=actor and a.request_key=(input->>'idempotencyKey')::uuid);
 result:=public.kpi_asset_register_before_versions(organization_code,period_code,input,division_code);
 select * into item from files.managed_assets where id=(result->>'id')::uuid for update;
 if previous_id is null then
  if item.root_asset_id is not null then raise exception 'Request key conflict' using errcode='40001';end if;
 else
  if item.organization_id<>previous.organization_id or item.period_id<>previous.period_id or item.division_id is distinct from previous.division_id or item.id=previous.id then raise exception 'Version scope mismatch' using errcode='22023';end if;
  if item.root_asset_id is null then
   select coalesce(max(a.revision),1)+1 into revision_number from files.managed_assets a where coalesce(a.root_asset_id,a.id)=root;
   update files.managed_assets set root_asset_id=root,revision=revision_number where id=item.id returning * into item;
   insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('ASSET_VERSION_REGISTERED','files','asset',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'revision',revision_number));
  elsif item.root_asset_id<>root then raise exception 'Request key conflict' using errcode='40001';end if;
 end if;
 -- A new version keeps the document's classification. Without a choice the file stays RAHASIA, as other upload paths expect.
 if not already then
  update governance.information_resources set classification=case when previous_id is not null then (select r.classification from governance.information_resources r where r.id=previous_id) else coalesce(class,classification) end,
   classification_reference=case when previous_id is null and class is not null then 'Ditetapkan pengunggah' else classification_reference end where id=item.id;
 end if;
 return files.asset_json(item)||jsonb_build_object('objectPath',item.object_path,'sha256',item.sha256);
exception when invalid_text_representation then raise exception 'Invalid asset values' using errcode='22023';
end $$;
create or replace function public.kpi_asset_versions(asset_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item files.managed_assets;
begin
 select * into item from files.managed_assets where id=asset_id;
 if item.id is null or not files.can_read(item) then raise exception 'Access denied' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(files.asset_json(a) order by a.revision desc),'[]'::jsonb) from files.managed_assets a where coalesce(a.root_asset_id,a.id)=coalesce(item.root_asset_id,item.id) and files.can_read(a));
end $$;
create or replace function public.kpi_asset_scan_request(asset_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare item files.managed_assets;
begin
 select * into item from files.managed_assets where id=asset_id;
 if item.id is null or not files.can_read(item) or not (identity.has_permission('ASSET_UPLOAD',item.organization_id,item.period_id,item.division_id,item.id) or (item.owner_account_id=identity.current_account_id() and identity.has_permission('ASSET_UPLOAD',item.organization_id,item.period_id,item.division_id))) then raise exception 'Access denied' using errcode='42501';end if;
 if item.status<>'PENDING_SCAN' then raise exception 'Pending scan required' using errcode='22023';end if;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('ASSET_RESCAN_REQUESTED','files','asset',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',identity.current_account_id()));
 return files.asset_json(item)||jsonb_build_object('objectPath',item.object_path,'sha256',item.sha256);
end $$;
create or replace function public.kpi_asset_download(asset_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare item files.managed_assets;
begin
 select * into item from files.managed_assets where id=asset_id;
 if item.id is null or not (identity.has_permission('ASSET_DOWNLOAD',item.organization_id,item.period_id,item.division_id,item.id) or (item.owner_account_id=identity.current_account_id() and files.can_read(item))) then raise exception 'Access denied' using errcode='42501';end if;
 if item.status<>'AVAILABLE' then raise exception 'Asset not cleared for download' using errcode='22023';end if;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('ASSET_DOWNLOAD_AUTHORIZED','files','asset',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',identity.current_account_id()));
 return files.asset_json(item)||jsonb_build_object('objectPath',item.object_path);
end $$;
notify pgrst,'reload schema';
commit;
