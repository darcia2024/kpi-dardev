begin;
create schema if not exists intake;
revoke all on schema intake from public,anon,authenticated;
alter table identity.permission_grants drop constraint permission_grants_permission_check;
alter table identity.permission_grants add constraint permission_grants_permission_check check(permission in (
 'SYSTEM_CONFIGURATION_READ','IDENTITY_READ','IDENTITY_MANAGE','WORKSPACE_READ','TASK_READ','TASK_CREATE','TASK_SUBMIT','TASK_REVIEW','MEETING_READ','MEETING_MANAGE',
 'FINANCE_READ','FINANCE_MANAGE','FINANCE_APPROVE_FINAL','EVALUATION_READ','EVALUATION_WRITE','KNOWLEDGE_READ','KNOWLEDGE_WRITE','KNOWLEDGE_REVIEW','HANDOVER_READ','HANDOVER_ACCEPT',
 'AI_READ','AI_ACTION_CONFIRM','CONTENT_DRAFT_WRITE','CONTENT_REVIEW','CONTENT_PUBLISH','ASSET_UPLOAD','ASSET_DOWNLOAD','ASPIRATION_TRIAGE','CASE_READ','CASE_MANAGE','CASE_REVIEW','NOTIFICATION_READ','NOTIFICATION_TEMPLATE_REVIEW'));
create table intake.routing (
 organization_id uuid references org.organizations(id),period_id uuid references org.periods(id),secretary_account_id uuid not null references identity.accounts(id),iod_division_id uuid not null references org.divisions(id),
 enabled boolean not null default false,updated_at timestamptz not null default now(),updated_by uuid not null references identity.accounts(id),primary key(organization_id,period_id)
);
create table intake.cases (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),iod_division_id uuid not null references org.divisions(id),
 secretary_account_id uuid not null references identity.accounts(id),owner_account_id uuid references identity.accounts(id),
 kind text not null check(kind in ('SARAN','PERTANYAAN','PENGADUAN')),subject text not null check(length(trim(subject)) between 3 and 180),
 description text not null check(length(trim(description)) between 20 and 6000),contact text not null default '' check(length(contact)<=254),
 tracking_hash text not null unique check(tracking_hash ~ '^[a-f0-9]{64}$'),request_key uuid not null unique,
 status text not null default 'RECEIVED' check(status in ('RECEIVED','TRIAGED','IN_PROGRESS','IN_REVIEW','CLOSED')),
 version integer not null default 1,submitted_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table intake.case_personnel(case_id uuid references intake.cases(id),account_id uuid references identity.accounts(id),active boolean not null default true,primary key(case_id,account_id));
create table intake.case_events(id uuid primary key default gen_random_uuid(),case_id uuid not null references intake.cases(id),actor_account_id uuid references identity.accounts(id),action text not null,
 visibility text not null check(visibility in ('INTERNAL','PUBLIC')),note text not null check(length(note) between 3 and 2000),version integer not null,created_at timestamptz not null default now());
create table intake.rate_limits(fingerprint text not null,purpose text not null,window_start bigint not null,count integer not null default 1,primary key(fingerprint,purpose,window_start));
alter table intake.routing enable row level security;alter table intake.cases enable row level security;alter table intake.case_personnel enable row level security;alter table intake.case_events enable row level security;alter table intake.rate_limits enable row level security;
revoke all on intake.routing,intake.cases,intake.case_personnel,intake.case_events,intake.rate_limits from public,anon,authenticated;

create function intake.permission(wanted text,item intake.cases) returns boolean language sql stable security definer set search_path='' as $$
 select (identity.is_system_admin() and identity.has_permission('ASPIRATION_TRIAGE',item.organization_id,item.period_id,item.iod_division_id,item.id))
 or identity.has_permission(wanted,item.organization_id,item.period_id,case when identity.current_account_id()=item.secretary_account_id then null else item.iod_division_id end,item.id);
$$;
create function intake.can_read(item intake.cases) returns boolean language sql stable security definer set search_path='' as $$
 select intake.permission('CASE_READ',item) and (identity.is_system_admin() or identity.current_account_id()=item.secretary_account_id
 or exists(select 1 from intake.case_personnel where case_id=item.id and account_id=identity.current_account_id() and active));
$$;
revoke all on function intake.permission(text,intake.cases),intake.can_read(intake.cases) from public,anon,authenticated;
create policy case_personnel_read on intake.cases for select to authenticated using(intake.can_read(cases));
create function intake.case_json(item intake.cases) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',item.id,'kind',item.kind,'subject',item.subject,'description',item.description,'contact',item.contact,'status',item.status,'version',item.version,
 'submittedAt',item.submitted_at,'ownerAccountId',item.owner_account_id,
 'canManage',intake.permission('CASE_MANAGE',item),'canReview',intake.permission('CASE_REVIEW',item) and (identity.is_system_admin() or identity.current_account_id()=item.secretary_account_id) and identity.current_account_id() is distinct from item.owner_account_id,
 'canAssign',intake.permission('CASE_MANAGE',item) and (identity.is_system_admin() or identity.current_account_id()=item.secretary_account_id),
 'eligibleOwners',case when intake.permission('CASE_MANAGE',item) and (identity.is_system_admin() or identity.current_account_id()=item.secretary_account_id) then
 (select coalesce(jsonb_agg(jsonb_build_object('accountId',a.id,'name',a.display_name) order by a.display_name,a.id),'[]'::jsonb) from identity.accounts a where a.status='ACTIVE' and a.deactivated_at is null
 and exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id where s.account_id=a.id and s.period_id=item.period_id and p.organization_id=item.organization_id and p.division_id=item.iod_division_id and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date))
 and not exists(select 1 from unnest(array['CASE_READ','CASE_MANAGE']) required(permission) where not exists(select 1 from identity.permission_grants g where g.account_id=a.id and g.permission=required.permission and g.organization_id=item.organization_id and g.period_id=item.period_id and (g.division_id is null or g.division_id=item.iod_division_id) and (g.object_id is null or g.object_id=item.id) and g.starts_at<=now() and g.revoked_at is null and (g.expires_at is null or g.expires_at>now())))) else '[]'::jsonb end,
 'events',(select coalesce(jsonb_agg(jsonb_build_object('action',e.action,'visibility',e.visibility,'note',e.note,'actorName',coalesce(a.display_name,'Pelapor'),'createdAt',e.created_at) order by e.version,e.created_at),'[]'::jsonb)
 from intake.case_events e left join identity.accounts a on a.id=e.actor_account_id where e.case_id=item.id));
$$;
revoke all on function intake.case_json(intake.cases) from public,anon,authenticated;
create function intake.rate_limit(fingerprint text,purpose text,maximum integer) returns void language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare n integer;window_bucket bigint:=floor(extract(epoch from now())/900);
begin
 if fingerprint is null or fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'Invalid request fingerprint' using errcode='22023';end if;
 insert into intake.rate_limits(fingerprint,purpose,window_start) values(fingerprint,purpose,window_bucket)
 on conflict on constraint rate_limits_pkey do update set count=rate_limits.count+1 returning count into n;
 if n>maximum then raise exception 'Rate limit exceeded' using errcode='P0003';end if;
end $$;
revoke all on function intake.rate_limit(text,text,integer) from public,anon,authenticated;
create function public.kpi_intake_ready(organization_code text default 'KPI_PPMI_MESIR') returns boolean language sql stable security definer set search_path='' as $$
 select count(*)=1 from intake.routing r join org.organizations o on o.id=r.organization_id join org.periods p on p.id=r.period_id
 join identity.accounts a on a.id=r.secretary_account_id join org.divisions d on d.id=r.iod_division_id and d.organization_id=r.organization_id
 where o.code=organization_code and r.enabled and p.status='ACTIVE' and current_date between p.starts_on and p.ends_on and a.status='ACTIVE' and a.deactivated_at is null
 and exists(select 1 from org.assignments s join org.positions pos on pos.id=s.position_id where s.account_id=a.id and s.period_id=p.id and pos.organization_id=o.id and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date))
 and not exists(select 1 from unnest(array['CASE_READ','CASE_MANAGE']) required(permission) where not exists(select 1 from identity.permission_grants g where g.account_id=a.id and g.organization_id=o.id and g.period_id=p.id and g.permission=required.permission and g.division_id is null and g.object_id is null and g.starts_at<=now() and g.revoked_at is null and (g.expires_at is null or g.expires_at>now())));
$$;
create function public.kpi_intake_submit(organization_code text,input jsonb,token_hash text,fingerprint text) returns jsonb language plpgsql security definer set search_path='' as $$
declare route intake.routing;item intake.cases;key uuid;
begin
 perform intake.rate_limit(fingerprint,'SUBMIT',5);
 if not public.kpi_intake_ready(organization_code) then raise exception 'Intake not ready' using errcode='55000';end if;
 select r.* into route from intake.routing r join org.organizations o on o.id=r.organization_id join org.periods p on p.id=r.period_id where o.code=organization_code and r.enabled and p.status='ACTIVE' and current_date between p.starts_on and p.ends_on;
 if input is null or input->>'kind' is null or input->>'kind' not in ('SARAN','PERTANYAAN','PENGADUAN') or coalesce(length(trim(input->>'subject')),0) not between 3 and 180
 or coalesce(length(trim(input->>'description')),0) not between 20 and 6000 or length(coalesce(input->>'contact',''))>254 or input->>'consent' is distinct from 'true'
 or coalesce(input->>'website','')<>'' or token_hash is null or token_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid intake' using errcode='22023';end if;
 key:=(input->>'idempotencyKey')::uuid;if key is null then raise exception 'Request key required' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(key::text,0));select * into item from intake.cases where request_key=key;
 if item.id is not null then
 if item.organization_id<>route.organization_id or item.period_id<>route.period_id or item.tracking_hash<>token_hash or item.kind<>input->>'kind' or item.subject<>trim(input->>'subject') or item.description<>trim(input->>'description') or item.contact<>coalesce(input->>'contact','') then raise exception 'Request key already used' using errcode='40001';end if;
 return jsonb_build_object('created',false,'submittedAt',item.submitted_at);end if;
 insert into intake.cases(organization_id,period_id,iod_division_id,secretary_account_id,kind,subject,description,contact,tracking_hash,request_key)
 values(route.organization_id,route.period_id,route.iod_division_id,route.secretary_account_id,input->>'kind',trim(input->>'subject'),trim(input->>'description'),coalesce(input->>'contact',''),token_hash,key) returning * into item;
 insert into intake.case_events(case_id,action,visibility,note,version) values(item.id,'RECEIVED','PUBLIC','Laporan telah diterima untuk pemeriksaan awal.',1);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('INTAKE_RECEIVED','intake','case',item.id,'SUCCESS',key::text,'{}');
 return jsonb_build_object('created',true,'submittedAt',item.submitted_at);
exception when invalid_text_representation then raise exception 'Invalid intake values' using errcode='22023';
end $$;
create function public.kpi_intake_track(token_hash text,fingerprint text) returns jsonb language plpgsql security definer set search_path='' as $$
declare item intake.cases;
begin
 perform intake.rate_limit(fingerprint,'TRACK',30);
 select * into item from intake.cases where tracking_hash=token_hash;
 if item.id is null then return null;end if;
 return jsonb_build_object('status',item.status,'submittedAt',item.submitted_at,'latestUpdate',coalesce((select note from intake.case_events where case_id=item.id and visibility='PUBLIC' order by version desc,created_at desc limit 1),'Laporan diterima.'));
end $$;
create function public.kpi_cases_list(organization_code text,period_code text) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;
begin
 if identity.current_account_id() is null then raise exception 'Access denied' using errcode='42501';end if;
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 return(select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'kind',t.kind,'subject',t.subject,'status',t.status,'version',t.version,'submittedAt',t.submitted_at,'ownerAccountId',t.owner_account_id) order by t.updated_at desc,t.id),'[]'::jsonb)
 from(select * from intake.cases c where c.organization_id=oid and c.period_id=pid and intake.can_read(c) order by c.updated_at desc,c.id limit 100)t);
end $$;
create function public.kpi_case_detail(case_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item intake.cases;
begin select * into item from intake.cases where id=case_id;if item.id is null or not intake.can_read(item) then raise exception 'Access denied' using errcode='42501';end if;return intake.case_json(item);end $$;
create function public.kpi_case_action(case_id uuid,expected_version integer,command text,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare item intake.cases;actor uuid:=identity.current_account_id();target uuid;review boolean;
begin
 select * into item from intake.cases where id=case_id for update;
 if item.id is null or not intake.can_read(item) then raise exception 'Access denied' using errcode='42501';end if;
 if expected_version is null or expected_version<>item.version then raise exception 'Case changed; reload first' using errcode='40001';end if;
 if coalesce(length(trim(input->>'note')),0) not between 3 and 2000 then raise exception 'Action note required' using errcode='22023';end if;
 review:=intake.permission('CASE_REVIEW',item) and (identity.is_system_admin() or actor=item.secretary_account_id);
 if command in ('APPROVE_CLOSE','REQUEST_REVISION','REOPEN') then
 if not review or actor=item.owner_account_id then raise exception 'Independent case reviewer required' using errcode='42501';end if;
 else if not intake.permission('CASE_MANAGE',item) then raise exception 'Access denied' using errcode='42501';end if;end if;
 if command='ASSIGN' then
 if actor<>item.secretary_account_id and not identity.is_system_admin() then raise exception 'Secretariat assignment required' using errcode='42501';end if;
 if item.status not in ('RECEIVED','TRIAGED','IN_PROGRESS') then raise exception 'Invalid assignment transition' using errcode='22023';end if;
 target:=(input->>'ownerAccountId')::uuid;
 if not exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id join identity.accounts a on a.id=s.account_id where s.account_id=target and s.period_id=item.period_id
 and p.organization_id=item.organization_id and p.division_id=item.iod_division_id and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date) and a.status='ACTIVE' and a.deactivated_at is null)
 or exists(select 1 from unnest(array['CASE_READ','CASE_MANAGE']) required(permission) where not exists(select 1 from identity.permission_grants g where g.account_id=target and g.permission=required.permission and g.organization_id=item.organization_id and g.period_id=item.period_id
 and (g.division_id is null or g.division_id=item.iod_division_id) and (g.object_id is null or g.object_id=item.id) and g.starts_at<=now() and g.revoked_at is null and (g.expires_at is null or g.expires_at>now()))) then raise exception 'Eligible IOD officer required' using errcode='42501';end if;
 if item.owner_account_id is not null then update intake.case_personnel set active=false where case_personnel.case_id=item.id and account_id=item.owner_account_id;end if;
 insert into intake.case_personnel(case_id,account_id,active) values(item.id,target,true) on conflict on constraint case_personnel_pkey do update set active=true;
 item.owner_account_id:=target;item.status:='TRIAGED';
 elsif command='START' then if item.status<>'TRIAGED' or actor<>item.owner_account_id then raise exception 'Assigned officer required' using errcode='42501';end if;item.status:='IN_PROGRESS';
 elsif command='REQUEST_CLOSE' then if item.status<>'IN_PROGRESS' or actor<>item.owner_account_id then raise exception 'Assigned officer required' using errcode='42501';end if;item.status:='IN_REVIEW';
 elsif command='APPROVE_CLOSE' then if item.status<>'IN_REVIEW' then raise exception 'Case not in review' using errcode='22023';end if;item.status:='CLOSED';
 elsif command='REQUEST_REVISION' then if item.status<>'IN_REVIEW' then raise exception 'Case not in review' using errcode='22023';end if;item.status:='IN_PROGRESS';
 elsif command='REOPEN' then if item.status<>'CLOSED' then raise exception 'Case not closed' using errcode='22023';end if;item.status:='IN_PROGRESS';
 elsif command in ('ADD_NOTE','PUBLIC_UPDATE') then if item.status='CLOSED' then raise exception 'Case closed' using errcode='22023';end if;
 else raise exception 'Unknown case action' using errcode='22023';end if;
 update intake.cases set status=item.status,owner_account_id=item.owner_account_id,version=version+1,updated_at=now() where id=item.id returning * into item;
 insert into intake.case_events(case_id,actor_account_id,action,visibility,note,version) values(item.id,actor,command,case when command='PUBLIC_UPDATE' then 'PUBLIC' else 'INTERNAL' end,trim(input->>'note'),item.version);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('CASE_'||command,'intake','case',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'version',item.version));
 return intake.case_json(item);
exception when invalid_text_representation then raise exception 'Invalid case values' using errcode='22023';
end $$;
revoke all on function public.kpi_intake_ready(text),public.kpi_intake_submit(text,jsonb,text,text),public.kpi_intake_track(text,text),public.kpi_cases_list(text,text),public.kpi_case_detail(uuid),public.kpi_case_action(uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.kpi_intake_ready(text),public.kpi_intake_submit(text,jsonb,text,text),public.kpi_intake_track(text,text) to service_role;
grant execute on function public.kpi_cases_list(text,text),public.kpi_case_detail(uuid),public.kpi_case_action(uuid,integer,text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
