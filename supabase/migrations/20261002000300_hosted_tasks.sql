begin;
create schema if not exists work;
revoke all on schema work from public, anon, authenticated;
create table work.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references org.organizations(id),
  period_id uuid not null references org.periods(id),
  division_id uuid references org.divisions(id),
  title text not null check(length(trim(title)) between 3 and 180),
  description text not null default '' check(length(description)<=4000),
  owner_account_id uuid not null references identity.accounts(id),
  created_by_account_id uuid not null references identity.accounts(id),
  status text not null default 'OPEN' check(status in ('OPEN','IN_PROGRESS','IN_REVIEW','REVISION','DONE','CANCELLED')),
  due_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  idempotency_key uuid not null,
  unique(created_by_account_id,idempotency_key)
);
create index tasks_scope_updated on work.tasks(organization_id,period_id,updated_at desc);
create table work.task_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references work.tasks(id),
  actor_account_id uuid not null references identity.accounts(id),
  action text not null,
  note text not null check(length(note)<=2000),
  version integer not null,
  created_at timestamptz not null default now()
);
alter table work.tasks enable row level security;
alter table work.task_events enable row level security;
revoke all on work.tasks,work.task_events from public,anon,authenticated;
create policy task_scope_read on work.tasks for select to authenticated using(
  identity.has_permission('TASK_READ',organization_id,period_id,division_id,id));
create policy task_event_read on work.task_events for select to authenticated using(exists(
  select 1 from work.tasks t where t.id=task_id and identity.has_permission('TASK_READ',t.organization_id,t.period_id,t.division_id,t.id)));

create function work.task_json(item work.tasks) returns jsonb
language sql stable security definer set search_path='' as $$
  select jsonb_build_object('id',item.id,'title',item.title,'description',item.description,
    'ownerAccountId',item.owner_account_id,'ownerName',(select display_name from identity.accounts where id=item.owner_account_id),
    'createdByAccountId',item.created_by_account_id,'status',item.status,'dueAt',item.due_at,
    'version',item.version,'createdAt',item.created_at,'updatedAt',item.updated_at,
    'divisionCode',(select code from org.divisions where id=item.division_id));
$$;
revoke all on function work.task_json(work.tasks) from public,anon,authenticated;

create function public.kpi_tasks_list(organization_code text,period_code text,division_code text default null)
returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare org_id uuid; period_id uuid; division_id uuid; result jsonb;
begin
  select o.id,p.id into org_id,period_id from org.organizations o join org.periods p on p.organization_id=o.id
    where o.code=organization_code and p.code=period_code;
  if division_code is not null then select d.id into division_id from org.divisions d where d.organization_id=org_id and d.code=division_code; end if;
  if org_id is null or (division_code is not null and division_id is null)
    or not identity.has_permission('TASK_READ',org_id,period_id,division_id) then raise exception 'Access denied' using errcode='42501'; end if;
  select coalesce(jsonb_agg(work.task_json(t) order by t.updated_at desc,t.id),'[]'::jsonb) into result
    from (select * from work.tasks t where t.organization_id=org_id and t.period_id=period_id
      and (division_code is null or t.division_id=division_id)
      and identity.has_permission('TASK_READ',t.organization_id,t.period_id,t.division_id,t.id)
      order by t.updated_at desc,t.id limit 200) t;
  return result;
end $$;

create function public.kpi_task_create(organization_code text,period_code text,task_title text,
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
  if not exists(select 1 from org.assignments s join org.positions pos on pos.id=s.position_id
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

create function public.kpi_task_action(task_id uuid,expected_version integer,task_action text,action_note text)
returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare item work.tasks; actor uuid:=identity.current_account_id(); next_status text;
begin
  select * into item from work.tasks t where t.id=task_id for update;
  if item.id is null or not identity.has_permission('TASK_READ',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501'; end if;
  if expected_version is null or item.version<>expected_version then raise exception 'Task changed; reload first' using errcode='40001'; end if;
  if action_note is null or length(trim(action_note)) not between 3 and 2000 then raise exception 'A note is required' using errcode='22023'; end if;
  if task_action in ('START','SUBMIT') then
    if actor<>item.owner_account_id or not identity.has_permission('TASK_SUBMIT',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501'; end if;
    next_status:=case when task_action='START' and item.status in ('OPEN','REVISION') then 'IN_PROGRESS'
      when task_action='SUBMIT' and item.status='IN_PROGRESS' then 'IN_REVIEW' end;
  elsif task_action in ('APPROVE','REQUEST_REVISION') then
    if actor=item.owner_account_id or actor=item.created_by_account_id or not identity.has_permission('TASK_REVIEW',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501'; end if;
    if item.status='IN_REVIEW' then next_status:=case when task_action='APPROVE' then 'DONE' else 'REVISION' end; end if;
  elsif task_action='CANCEL' then
    if not identity.has_permission('TASK_CREATE',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501'; end if;
    if item.status in ('OPEN','IN_PROGRESS','REVISION') then next_status:='CANCELLED'; end if;
  else raise exception 'Invalid action' using errcode='22023'; end if;
  if next_status is null then raise exception 'Invalid task transition' using errcode='22023'; end if;
  update work.tasks t set status=next_status,version=t.version+1,updated_at=now() where t.id=item.id returning * into item;
  insert into work.task_events(task_id,actor_account_id,action,note,version) values(item.id,actor,task_action,trim(action_note),item.version);
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
    values('TASK_' || task_action,'work','task',item.id,'SUCCESS','hosted:' || gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'version',item.version));
  return work.task_json(item);
end $$;

create function public.kpi_task_detail(task_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare item work.tasks;
begin
  select * into item from work.tasks t where t.id=task_id;
  if item.id is null or not identity.has_permission('TASK_READ',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501'; end if;
  return work.task_json(item) || jsonb_build_object('events',(select coalesce(jsonb_agg(jsonb_build_object(
    'id',e.id,'action',e.action,'note',e.note,'version',e.version,'createdAt',e.created_at,
    'actorName',(select display_name from identity.accounts where id=e.actor_account_id)) order by e.version),'[]'::jsonb)
    from work.task_events e where e.task_id=item.id));
end $$;

revoke all on function public.kpi_tasks_list(text,text,text),public.kpi_task_create(text,text,text,text,uuid,uuid,timestamptz,text),
  public.kpi_task_action(uuid,integer,text,text),public.kpi_task_detail(uuid) from public,anon;
grant execute on function public.kpi_tasks_list(text,text,text),public.kpi_task_create(text,text,text,text,uuid,uuid,timestamptz,text),
  public.kpi_task_action(uuid,integer,text,text),public.kpi_task_detail(uuid) to authenticated;
notify pgrst,'reload schema';
create function public.kpi_tasks_ready() returns boolean language sql stable security definer set search_path='' as $$
  select to_regclass('work.tasks') is not null and to_regclass('work.task_events') is not null;
$$;
revoke all on function public.kpi_tasks_ready() from public,anon,authenticated;
grant execute on function public.kpi_tasks_ready() to service_role;
commit;
