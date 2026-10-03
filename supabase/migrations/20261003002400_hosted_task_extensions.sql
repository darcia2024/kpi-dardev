begin;
alter table work.tasks add column parent_task_id uuid references work.tasks(id);
create index tasks_parent on work.tasks(parent_task_id);
create table work.task_dependencies (
 task_id uuid not null references work.tasks(id), prerequisite_id uuid not null references work.tasks(id),
 primary key(task_id,prerequisite_id), check(task_id<>prerequisite_id)
);
create table work.task_templates (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references org.organizations(id),
 period_id uuid not null references org.periods(id), division_id uuid references org.divisions(id),
 title text not null, description text not null, created_by_account_id uuid not null references identity.accounts(id),
 source_task_id uuid not null references work.tasks(id), created_at timestamptz not null default now()
);
alter table work.task_dependencies enable row level security;
alter table work.task_templates enable row level security;
revoke all on work.task_dependencies,work.task_templates from public,anon,authenticated;

create function work.task_owner_eligible(item work.tasks,account uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from org.assignments s join org.positions pos on pos.id=s.position_id
 join identity.accounts a on a.id=s.account_id where s.account_id=account and s.period_id=item.period_id
 and pos.organization_id=item.organization_id and (item.division_id is null or pos.division_id=item.division_id)
 and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date) and a.status='ACTIVE' and a.deactivated_at is null)
 and exists(select 1 from identity.permission_grants g where g.account_id=account and g.organization_id=item.organization_id
 and (g.period_id is null or g.period_id=item.period_id) and (g.division_id is null or g.division_id=item.division_id)
 and (g.object_id is null or g.object_id=item.id) and g.permission='TASK_READ' and governance.grant_valid(g) and exists(select 1 from governance.access_decisions d where d.id=g.decision_id and governance.classification_rank(d.classification)>=coalesce((select governance.classification_rank(r.classification) from governance.information_resources r where r.id=item.id),1)))
 and exists(select 1 from identity.permission_grants g where g.account_id=account and g.organization_id=item.organization_id
 and (g.period_id is null or g.period_id=item.period_id) and (g.division_id is null or g.division_id=item.division_id)
 and (g.object_id is null or g.object_id=item.id) and g.permission='TASK_SUBMIT' and governance.grant_valid(g) and exists(select 1 from governance.access_decisions d where d.id=g.decision_id and governance.classification_rank(d.classification)>=coalesce((select governance.classification_rank(r.classification) from governance.information_resources r where r.id=item.id),1)));
$$;

create function public.kpi_task_extensions(task_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare item work.tasks;
begin
 select * into item from work.tasks where id=task_id;
 if item.id is null or not identity.has_permission('TASK_READ',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 return jsonb_build_object('parentTaskId',case when exists(select 1 from work.tasks p where p.id=item.parent_task_id and identity.has_permission('TASK_READ',p.organization_id,p.period_id,p.division_id,p.id)) then item.parent_task_id end,
 'subtasks',(select coalesce(jsonb_agg(work.task_json(t) order by t.created_at),'[]'::jsonb) from work.tasks t where t.parent_task_id=item.id and identity.has_permission('TASK_READ',t.organization_id,t.period_id,t.division_id,t.id)),
 'dependencies',(select coalesce(jsonb_agg(work.task_json(t) order by t.title),'[]'::jsonb) from work.task_dependencies d join work.tasks t on t.id=d.prerequisite_id where d.task_id=item.id and identity.has_permission('TASK_READ',t.organization_id,t.period_id,t.division_id,t.id)),
 'blocked',exists(select 1 from work.task_dependencies d join work.tasks t on t.id=d.prerequisite_id where d.task_id=item.id and t.status<>'DONE') or exists(select 1 from work.tasks t where t.parent_task_id=item.id and t.status not in ('DONE','CANCELLED')));
end $$;

create function public.kpi_task_people(task_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare item work.tasks;
begin
 select * into item from work.tasks where id=task_id;
 if item.id is null or not identity.has_permission('TASK_READ',item.organization_id,item.period_id,item.division_id,item.id)
 or not identity.has_permission('TASK_CREATE',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('accountId',a.id,'name',a.display_name) order by a.display_name),'[]'::jsonb) from identity.accounts a where work.task_owner_eligible(item,a.id));
end $$;

create function public.kpi_task_templates(organization_code text,period_code text,division_code text default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('TASK_CREATE',oid,pid,did) or not identity.has_permission('TASK_READ',oid,pid,did) then raise exception 'Access denied' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'title',t.title,'description',t.description) order by t.created_at desc),'[]'::jsonb)
 from work.task_templates t where t.organization_id=oid and t.period_id=pid and (division_code is null or t.division_id=did)
 and exists(select 1 from work.tasks s where s.id=t.source_task_id and identity.has_permission('TASK_READ',s.organization_id,s.period_id,s.division_id,s.id)));
end $$;

create function public.kpi_task_extend(task_id uuid,expected_version integer,command text,input jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare item work.tasks;other work.tasks;actor uuid:=identity.current_account_id();owner uuid;child work.tasks;deadline timestamptz;key uuid;class text;
begin
 -- One scope lock serializes graph edits and completion, preventing concurrent cycles.
 select * into item from work.tasks where id=task_id;
 if item.id is null or not identity.has_permission('TASK_READ',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('task-graph:'||item.period_id::text,0));
 select * into item from work.tasks where id=task_id for update;
 if expected_version is null or item.version<>expected_version then raise exception 'Task changed' using errcode='40001';end if;
 if input->>'note' is null or length(trim(input->>'note')) not between 3 and 2000 then raise exception 'Note required' using errcode='22023';end if;
 if command='COMMENT' then
  if item.status='CANCELLED' then raise exception 'Task closed' using errcode='22023';end if;
 else
  if not identity.has_permission('TASK_CREATE',item.organization_id,item.period_id,item.division_id,item.id) or item.status not in ('OPEN','IN_PROGRESS','REVISION') then raise exception 'Editing denied or task finalized' using errcode='42501';end if;
 end if;
 if command='DELEGATE' then
  owner:=(input->>'ownerAccountId')::uuid;
  if owner is null or owner=item.owner_account_id or not work.task_owner_eligible(item,owner) then raise exception 'Recipient must have current assignment and task access' using errcode='42501';end if;
  update work.tasks set owner_account_id=owner where id=item.id;
 elsif command='DEADLINE' then
  deadline:=nullif(input->>'dueAt','')::timestamptz;
  if deadline is not null and deadline<=now() then raise exception 'Future deadline required' using errcode='22023';end if;
  update work.tasks set due_at=deadline where id=item.id;
 elsif command='SUBTASK' then
  if exists(select 1 from governance.information_resources where id=item.id and classification in ('TERBATAS','RAHASIA')) then raise exception 'Restricted subtasks require separate object decisions' using errcode='42501';end if;
  if input->>'title' is null or length(trim(input->>'title')) not between 3 and 180 or length(coalesce(input->>'description',''))>4000 then raise exception 'Invalid subtask' using errcode='22023';end if;
  key:=(input->>'requestKey')::uuid;owner:=coalesce((input->>'ownerAccountId')::uuid,actor);
  if key is null or not work.task_owner_eligible(item,owner) then raise exception 'Invalid recipient or key' using errcode='42501';end if;
  select * into child from work.tasks where created_by_account_id=actor and idempotency_key=key;
  if child.id is not null then raise exception 'Request key already used; reload' using errcode='40001';end if;
  insert into work.tasks(organization_id,period_id,division_id,title,description,owner_account_id,created_by_account_id,idempotency_key,parent_task_id)
  values(item.organization_id,item.period_id,item.division_id,trim(input->>'title'),trim(coalesce(input->>'description','')),owner,actor,key,item.id) returning * into child;
  select classification into class from governance.information_resources where id=item.id;
  insert into governance.information_resources(id,organization_id,period_id,kind,classification) values(child.id,item.organization_id,item.period_id,'TASK',coalesce(class,'INTERNAL'));
  insert into work.task_events(task_id,actor_account_id,action,note,version) values(child.id,actor,'CREATE','Subtugas dibuat.',1);
 elsif command in ('DEPENDENCY_ADD','DEPENDENCY_REMOVE') then
  select * into other from work.tasks where id=(input->>'prerequisiteId')::uuid;
  if other.id is null or other.organization_id<>item.organization_id or other.period_id<>item.period_id or other.division_id is distinct from item.division_id
  or not identity.has_permission('TASK_READ',other.organization_id,other.period_id,other.division_id,other.id) then raise exception 'Dependency access denied' using errcode='42501';end if;
  if command='DEPENDENCY_ADD' then
   if other.id=item.id or other.status='CANCELLED' then raise exception 'Invalid dependency' using errcode='22023';end if;
   if exists(with recursive paths(id) as (select other.id union select edges.target from paths p join (select d.task_id as source,d.prerequisite_id as target from work.task_dependencies d union all select parent_task_id,id from work.tasks where parent_task_id is not null) edges on edges.source=p.id) select 1 from paths where id=item.id)
   or exists(with recursive parents(id) as (select item.parent_task_id union select t.parent_task_id from work.tasks t join parents p on t.id=p.id where t.parent_task_id is not null) select 1 from parents where id=other.id) then raise exception 'Dependency cycle' using errcode='22023';end if;
   insert into work.task_dependencies values(item.id,other.id) on conflict do nothing;
  else delete from work.task_dependencies d where d.task_id=item.id and d.prerequisite_id=other.id;end if;
 elsif command='TEMPLATE' then
  if exists(select 1 from governance.information_resources where id=item.id and classification in ('TERBATAS','RAHASIA')) then raise exception 'Restricted task cannot become reusable template' using errcode='42501';end if;
  if not exists(select 1 from work.task_templates where source_task_id=item.id and title=item.title and description=item.description) then
   insert into work.task_templates(organization_id,period_id,division_id,title,description,created_by_account_id,source_task_id) values(item.organization_id,item.period_id,item.division_id,item.title,item.description,actor,item.id);
  end if;
 elsif command<>'COMMENT' then raise exception 'Invalid command' using errcode='22023';end if;
 update work.tasks set version=version+1,updated_at=now() where id=item.id returning * into item;
 insert into work.task_events(task_id,actor_account_id,action,note,version) values(item.id,actor,command,trim(input->>'note'),item.version);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('TASK_'||command,'work','task',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'version',item.version));
 return work.task_json(item);
end $$;

alter function public.kpi_task_action(uuid,integer,text,text) rename to kpi_task_action_before_extensions;
revoke all on function public.kpi_task_action_before_extensions(uuid,integer,text,text) from public,anon,authenticated;
create function public.kpi_task_action(task_id uuid,expected_version integer,task_action text,action_note text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare item work.tasks;
begin
 select * into item from work.tasks where id=task_id;
 if item.id is null or not identity.has_permission('TASK_READ',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('task-graph:'||item.period_id::text,0));
 if task_action in ('SUBMIT','APPROVE') and ((public.kpi_task_extensions(task_id))->>'blocked')::boolean then raise exception 'Complete prerequisites and subtasks first' using errcode='22023';end if;
 return public.kpi_task_action_before_extensions(task_id,expected_version,task_action,action_note);
end $$;
revoke all on function work.task_owner_eligible(work.tasks,uuid),public.kpi_task_extensions(uuid),public.kpi_task_people(uuid),public.kpi_task_templates(text,text,text),public.kpi_task_extend(uuid,integer,text,jsonb),public.kpi_task_action(uuid,integer,text,text) from public,anon,authenticated;
grant execute on function public.kpi_task_extensions(uuid),public.kpi_task_people(uuid),public.kpi_task_templates(text,text,text),public.kpi_task_extend(uuid,integer,text,jsonb),public.kpi_task_action(uuid,integer,text,text) to authenticated;
notify pgrst,'reload schema';
commit;
