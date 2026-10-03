begin;
create table work.meetings (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references org.organizations(id),
 period_id uuid not null references org.periods(id), division_id uuid references org.divisions(id),
 title text not null check(length(trim(title)) between 3 and 180), agenda text not null check(length(trim(agenda)) between 3 and 6000),
 starts_at timestamptz not null, created_by_account_id uuid not null references identity.accounts(id),
 minutes_author_id uuid references identity.accounts(id), minutes_summary text not null default '' check(length(minutes_summary)<=16000),
 status text not null default 'DRAFT' check(status in ('DRAFT','IN_REVIEW','REVISION','FINAL','ARCHIVED')),
 version integer not null default 1, request_key uuid not null, updated_at timestamptz not null default now(),
 unique(created_by_account_id,request_key)
);
create index meetings_scope on work.meetings(organization_id,period_id,starts_at desc);
create table work.meeting_participants (
 meeting_id uuid references work.meetings(id), account_id uuid references identity.accounts(id),
 response text check(response in ('HADIR','TIDAK_HADIR','RAGU')),
 attendance text check(attendance in ('HADIR','IZIN','TIDAK_HADIR')), primary key(meeting_id,account_id)
);
create table work.meeting_events (
 id uuid primary key default gen_random_uuid(), meeting_id uuid not null references work.meetings(id),
 actor_account_id uuid not null references identity.accounts(id), action text not null,
 note text not null check(length(note)<=2000), version integer not null, created_at timestamptz not null default now()
);
create table work.meeting_motions (
 id uuid primary key default gen_random_uuid(), meeting_id uuid not null references work.meetings(id),
 text text not null check(length(trim(text)) between 3 and 2000), quorum integer not null check(quorum>0),
 eligible_ids uuid[] not null, opened_at timestamptz not null default now(), closed_at timestamptz
);
create unique index one_open_motion on work.meeting_motions(meeting_id) where closed_at is null;
create table work.meeting_votes (
 motion_id uuid references work.meeting_motions(id), voter_account_id uuid references identity.accounts(id),
 choice text not null check(choice in ('SETUJU','TOLAK','ABSTAIN')), primary key(motion_id,voter_account_id)
);
alter table work.meetings enable row level security;
alter table work.meeting_participants enable row level security;
alter table work.meeting_events enable row level security;
alter table work.meeting_motions enable row level security;
alter table work.meeting_votes enable row level security;
revoke all on work.meetings,work.meeting_participants,work.meeting_events,work.meeting_motions,work.meeting_votes from public,anon,authenticated;
create policy meeting_read on work.meetings for select to authenticated using(identity.has_permission('MEETING_READ',organization_id,period_id,division_id,id));

create function work.meeting_json(item work.meetings) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',item.id,'title',item.title,'agenda',item.agenda,'startsAt',item.starts_at,
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
revoke all on function work.meeting_json(work.meetings) from public,anon,authenticated;

create function public.kpi_meetings_list(organization_code text,period_code text,division_code text default null) returns jsonb
 language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid; pid uuid; did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code; end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('MEETING_READ',oid,pid,did) then raise exception 'Access denied' using errcode='42501'; end if;
 return (select coalesce(jsonb_agg(work.meeting_json(m) order by m.starts_at desc,m.id),'[]'::jsonb) from
 (select * from work.meetings t where t.organization_id=oid and t.period_id=pid and (division_code is null or t.division_id=did)
 and identity.has_permission('MEETING_READ',oid,pid,t.division_id,t.id) order by t.starts_at desc,t.id limit 100) m);
end $$;

create function public.kpi_meeting_detail(meeting_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item work.meetings;
begin
 select * into item from work.meetings where id=meeting_id;
 if item.id is null or not identity.has_permission('MEETING_READ',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501'; end if;
 return work.meeting_json(item);
end $$;

create function public.kpi_meeting_create(organization_code text,period_code text,input jsonb,division_code text default null) returns jsonb
 language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid; pid uuid; did uuid; actor uuid:=identity.current_account_id(); item work.meetings; ids uuid[]; key uuid; start_at timestamptz;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code; end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('MEETING_MANAGE',oid,pid,did)
 or not identity.has_permission('MEETING_READ',oid,pid,did) then raise exception 'Access denied' using errcode='42501'; end if;
 if input is null or coalesce(length(trim(input->>'title')),0) not between 3 and 180 or coalesce(length(trim(input->>'agenda')),0) not between 3 and 6000
 or jsonb_typeof(input->'participantAccountIds') is distinct from 'array' or jsonb_array_length(input->'participantAccountIds') not between 1 and 100 then raise exception 'Invalid meeting' using errcode='22023'; end if;
 key:=(input->>'idempotencyKey')::uuid; start_at:=(input->>'startsAt')::timestamptz;
 if key is null or start_at is null then raise exception 'Invalid meeting' using errcode='22023'; end if;
 select array_agg(distinct x::uuid order by x::uuid) into ids from jsonb_array_elements_text(input->'participantAccountIds') x;
 if exists(select 1 from unnest(ids) a where not exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id join identity.accounts ac on ac.id=s.account_id
 where s.account_id=a and s.period_id=pid and p.organization_id=oid and (did is null or p.division_id=did)
 and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date) and ac.status='ACTIVE' and ac.deactivated_at is null)) then raise exception 'Invalid participants' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||key::text,0));
 select * into item from work.meetings where created_by_account_id=actor and request_key=key;
 if item.id is not null then
 if item.organization_id<>oid or item.period_id<>pid or item.division_id is distinct from did or item.title<>trim(input->>'title') or item.agenda<>trim(input->>'agenda') or item.starts_at<>start_at
 or ids is distinct from (select array_agg(account_id order by account_id) from work.meeting_participants where meeting_id=item.id) then raise exception 'Request key already used' using errcode='40001'; end if;
 return work.meeting_json(item); end if;
 if start_at<=now() then raise exception 'Meeting must start in future' using errcode='22023'; end if;
 insert into work.meetings(organization_id,period_id,division_id,title,agenda,starts_at,created_by_account_id,request_key)
 values(oid,pid,did,trim(input->>'title'),trim(input->>'agenda'),start_at,actor,key) returning * into item;
 insert into work.meeting_participants(meeting_id,account_id) select item.id,x from unnest(ids) x;
 insert into work.meeting_events(meeting_id,actor_account_id,action,note,version) values(item.id,actor,'CREATE','Undangan rapat dibuat.',1);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
 values('MEETING_CREATED','meeting','meeting',item.id,'SUCCESS',key::text,jsonb_build_object('actorAccountId',actor,'version',1));
 return work.meeting_json(item);
exception when invalid_text_representation or datetime_field_overflow or invalid_datetime_format then raise exception 'Invalid meeting values' using errcode='22023';
end $$;

create function public.kpi_meeting_action(meeting_id uuid,expected_version integer,command text,input jsonb) returns jsonb
 language plpgsql security definer set search_path='' as $$
declare item work.meetings; actor uuid:=identity.current_account_id(); motion work.meeting_motions; eligible uuid[]; target uuid; manage boolean;
begin
 select * into item from work.meetings where id=meeting_id for update;
 if item.id is null or not identity.has_permission('MEETING_READ',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501'; end if;
 if expected_version is null or item.version<>expected_version then raise exception 'Meeting changed; reload first' using errcode='40001'; end if;
 if item.status='ARCHIVED' or input is null or coalesce(length(trim(input->>'note')),0) not between 3 and 2000 then raise exception 'Invalid action' using errcode='22023'; end if;
 manage:=identity.has_permission('MEETING_MANAGE',item.organization_id,item.period_id,item.division_id,item.id);
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
 insert into work.meeting_events(meeting_id,actor_account_id,action,note,version) values(item.id,actor,command,trim(input->>'note'),item.version);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
 values('MEETING_'||command,'meeting','meeting',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'version',item.version));
 return work.meeting_json(item);
exception when invalid_text_representation then raise exception 'Invalid meeting action values' using errcode='22023';
end $$;
revoke all on function public.kpi_meetings_list(text,text,text),public.kpi_meeting_detail(uuid),public.kpi_meeting_create(text,text,jsonb,text),public.kpi_meeting_action(uuid,integer,text,jsonb) from public,anon;
grant execute on function public.kpi_meetings_list(text,text,text),public.kpi_meeting_detail(uuid),public.kpi_meeting_create(text,text,jsonb,text),public.kpi_meeting_action(uuid,integer,text,jsonb) to authenticated;
create function public.kpi_meeting_members(organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid; pid uuid; did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code; end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('MEETING_MANAGE',oid,pid,did) then raise exception 'Access denied' using errcode='42501'; end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('accountId',a.id,'name',a.display_name) order by a.display_name,a.id),'[]'::jsonb)
 from identity.accounts a where a.status='ACTIVE' and a.deactivated_at is null and exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id
 where s.account_id=a.id and s.period_id=pid and p.organization_id=oid and (did is null or p.division_id=did) and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date)));
end $$;
revoke all on function public.kpi_meeting_members(text,text,text) from public,anon;
grant execute on function public.kpi_meeting_members(text,text,text) to authenticated;
notify pgrst,'reload schema';
commit;
