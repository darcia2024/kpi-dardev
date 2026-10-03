begin;
create table identity.system_administrators(
  account_id uuid primary key references identity.accounts(id),
  approved_at timestamptz not null default now(),
  approved_reason text not null check(length(trim(approved_reason))>=3),
  revoked_at timestamptz
);
alter table identity.system_administrators enable row level security;
revoke all on identity.system_administrators from public,anon,authenticated;

create function identity.is_system_admin() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from identity.system_administrators s
    join identity.account_roles ar on ar.account_id=s.account_id join identity.roles r on r.id=ar.role_id
    where s.account_id=identity.current_account_id() and s.revoked_at is null and r.code='ADMIN_SISTEM'
      and ar.starts_at<=now() and (ar.ends_at is null or ar.ends_at>now()));
$$;
revoke all on function identity.is_system_admin() from public,anon;
grant execute on function identity.is_system_admin() to authenticated;

alter function public.kpi_access_context() rename to kpi_access_context_base;
revoke all on function public.kpi_access_context_base() from public,anon,authenticated,service_role;
create function public.kpi_access_context() returns jsonb language sql stable security definer set search_path='' as $$
  select case when base.value is null then null else base.value || jsonb_build_object(
    'systemAdmin',identity.is_system_admin(),
    'managedScopes',case when identity.is_system_admin() then (select coalesce(jsonb_agg(jsonb_build_object(
      'organizationCode',o.code,'periodCode',p.code,'divisionCode',null)),'[]'::jsonb)
      from org.organizations o join org.periods p on p.organization_id=o.id
      where p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on) else '[]'::jsonb end) end
    from (select public.kpi_access_context_base() as value) base;
$$;
revoke all on function public.kpi_access_context() from public,anon;
grant execute on function public.kpi_access_context() to authenticated,service_role;

create or replace function identity.has_permission(wanted text,target_org uuid,target_period uuid,target_division uuid default null,target_object uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
  select (identity.is_system_admin()
    and wanted=any(array['SYSTEM_CONFIGURATION_READ','IDENTITY_READ','IDENTITY_MANAGE','WORKSPACE_READ',
      'TASK_READ','TASK_CREATE','TASK_SUBMIT','TASK_REVIEW','MEETING_READ','MEETING_MANAGE',
      'FINANCE_READ','FINANCE_MANAGE','FINANCE_APPROVE_FINAL','EVALUATION_READ','EVALUATION_WRITE',
      'KNOWLEDGE_READ','KNOWLEDGE_WRITE','KNOWLEDGE_REVIEW','HANDOVER_READ','HANDOVER_ACCEPT',
      'AI_READ','AI_ACTION_CONFIRM','CONTENT_DRAFT_WRITE','CONTENT_REVIEW','CONTENT_PUBLISH',
      'ASSET_UPLOAD','ASSET_DOWNLOAD','ASPIRATION_TRIAGE','NOTIFICATION_READ','NOTIFICATION_TEMPLATE_REVIEW'])
    and exists(select 1 from org.periods p where p.id=target_period and p.organization_id=target_org
      and p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on)
    and (target_division is null or exists(select 1 from org.divisions d where d.id=target_division and d.organization_id=target_org)))
    or exists(select 1 from identity.permission_grants g
    where g.account_id=identity.current_account_id() and g.permission=wanted and g.organization_id=target_org
      and g.period_id=target_period and (g.division_id is null or g.division_id=target_division)
      and (g.object_id is null or g.object_id=target_object) and g.starts_at<=now() and g.revoked_at is null
      and (g.expires_at is null or g.expires_at>now()) and identity.is_active_member(target_org,target_period,target_division));
$$;

create function public.kpi_admin_directory() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
  if not identity.is_system_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  return jsonb_build_object('organizations',(select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'code',o.code,'name',o.name) order by o.name),'[]'::jsonb) from org.organizations o),
    'periods',(select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'organizationId',p.organization_id,'code',p.code,'startsOn',p.starts_on,'endsOn',p.ends_on,'status',p.status) order by p.starts_on desc),'[]'::jsonb) from org.periods p));
end $$;

create function public.kpi_admin_setup(organization_code text,organization_name text,period_code text,start_date date,end_date date)
returns jsonb language plpgsql security definer set search_path='' as $$
declare org_id uuid; period_id uuid; existing org.periods; actor uuid:=identity.current_account_id();
begin
  if not identity.is_system_admin() then raise exception 'Access denied' using errcode='42501'; end if;
  if organization_code is null or organization_code !~ '^[A-Z][A-Z0-9_]{1,63}$' or organization_name is null
    or length(trim(organization_name)) not between 3 and 180 or period_code is null or period_code !~ '^[A-Z0-9][A-Z0-9_/-]{1,63}$'
    or start_date is null or end_date is null or end_date<start_date or end_date<current_date then raise exception 'Invalid official setup values' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(organization_code || ':' || period_code,0));
  select id into org_id from org.organizations where code=organization_code;
  if org_id is null then insert into org.organizations(code,name) values(organization_code,trim(organization_name)) returning id into org_id;
  elsif not exists(select 1 from org.organizations where id=org_id and name=trim(organization_name)) then raise exception 'Organization name differs; review existing data' using errcode='40001'; end if;
  select * into existing from org.periods where organization_id=org_id and code=period_code;
  if existing.id is not null then
    if existing.starts_on<>start_date or existing.ends_on<>end_date then raise exception 'Period already exists with different dates' using errcode='40001'; end if;
    return public.kpi_admin_directory();
  end if;
  insert into org.periods(organization_id,code,starts_on,ends_on,status)
    values(org_id,period_code,start_date,end_date,case when start_date<=current_date then 'ACTIVE' else 'PLANNED' end) returning id into period_id;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
    values('ORGANIZATION_PERIOD_CREATED','org','period',period_id,'SUCCESS','hosted:' || gen_random_uuid(),
      jsonb_build_object('actorAccountId',actor,'organizationId',org_id));
  return public.kpi_admin_directory();
end $$;
revoke all on function public.kpi_admin_directory(),public.kpi_admin_setup(text,text,text,date,date) from public,anon;
grant execute on function public.kpi_admin_directory(),public.kpi_admin_setup(text,text,text,date,date) to authenticated;

create or replace function public.kpi_task_create(organization_code text,period_code text,task_title text,
  task_description text,owner_id uuid,request_key uuid,deadline timestamptz default null,division_code text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare org_id uuid; period_id uuid; division_id uuid; actor uuid:=identity.current_account_id(); item work.tasks;
begin
  select o.id,p.id into org_id,period_id from org.organizations o join org.periods p on p.organization_id=o.id
    where o.code=organization_code and p.code=period_code;
  if division_code is not null then select d.id into division_id from org.divisions d where d.organization_id=org_id and d.code=division_code; end if;
  if org_id is null or (division_code is not null and division_id is null)
    or not identity.has_permission('TASK_CREATE',org_id,period_id,division_id)
    or not identity.has_permission('TASK_READ',org_id,period_id,division_id) then raise exception 'Access denied' using errcode='42501'; end if;
  if task_title is null or length(trim(task_title)) not between 3 and 180 or task_description is null
    or length(task_description)>4000 or request_key is null or (deadline is not null and deadline<=now()) then
    raise exception 'Invalid task input' using errcode='22023'; end if;
  if not (owner_id=actor and identity.is_system_admin()) and not exists(select 1 from org.assignments s join org.positions pos on pos.id=s.position_id
    join identity.accounts a on a.id=s.account_id where s.account_id=owner_id and s.period_id=period_id
      and pos.organization_id=org_id and (division_id is null or pos.division_id=division_id)
      and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date)
      and a.status='ACTIVE' and a.deactivated_at is null) then raise exception 'Access denied' using errcode='42501'; end if;
  -- Serialize repeat submissions per actor, including simultaneous retries.
  perform pg_advisory_xact_lock(hashtextextended(actor::text || request_key::text,0));
  select * into item from work.tasks t where t.created_by_account_id=actor and t.idempotency_key=request_key;
  if item.id is not null then
    if item.organization_id<>org_id or item.period_id<>period_id or item.division_id is distinct from division_id
      or item.title<>trim(task_title) or item.description<>trim(task_description) or item.owner_account_id<>owner_id
      or item.due_at is distinct from deadline then raise exception 'Request key already used' using errcode='40001'; end if;
    return work.task_json(item);
  end if;
  insert into work.tasks(organization_id,period_id,division_id,title,description,owner_account_id,created_by_account_id,due_at,idempotency_key)
    values(org_id,period_id,division_id,trim(task_title),trim(task_description),owner_id,actor,deadline,request_key) returning * into item;
  insert into work.task_events(task_id,actor_account_id,action,note,version) values(item.id,actor,'CREATE','Tugas dibuat.',item.version);
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
    values('TASK_CREATED','work','task',item.id,'SUCCESS',request_key::text,jsonb_build_object('actorAccountId',actor,'version',item.version));
  return work.task_json(item);
end $$;

-- Approved account: global module administration, active-period scope, audited setup.
insert into identity.system_administrators(account_id,approved_reason)
  select id,'Owner approved full module administration for KPI administrator' from identity.accounts
  where auth_user_id='093b761f-d1c7-433c-8153-0f271e85664c' and email='kpippmimesirofficial@gmail.com' and status='ACTIVE';
do $$ begin
  if not exists(select 1 from identity.system_administrators s join identity.accounts a on a.id=s.account_id
    where a.auth_user_id='093b761f-d1c7-433c-8153-0f271e85664c') then raise exception 'Approved administrator not found'; end if;
end $$;
insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
  select 'SYSTEM_ADMIN_APPROVED','identity','account',account_id,'SUCCESS','manual:' || gen_random_uuid(),
    jsonb_build_object('reason',approved_reason) from identity.system_administrators;

create function public.kpi_admin_ready() returns boolean language sql stable security definer set search_path='' as $$
  select to_regclass('identity.system_administrators') is not null;
$$;
revoke all on function public.kpi_admin_ready() from public,anon,authenticated;
grant execute on function public.kpi_admin_ready() to service_role;
notify pgrst,'reload schema';
commit;

