begin;
create table intake.form_templates(id uuid primary key default gen_random_uuid(),organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),kind text not null check(kind in ('SARAN','PERTANYAAN','PENGADUAN')),title text not null,instructions text not null,fields jsonb not null,decision_reference text not null,created_by uuid not null references identity.accounts(id),approved_by uuid references identity.accounts(id),status text not null default 'DRAFT' check(status in ('DRAFT','APPROVED','WITHDRAWN')),version integer not null default 1,updated_at timestamptz not null default now());
create unique index approved_intake_template on intake.form_templates(organization_id,period_id,kind) where status='APPROVED';
alter table intake.form_templates enable row level security;revoke all on intake.form_templates from public,anon,authenticated;
create function public.kpi_intake_configuration(organization_code text,period_code text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare oid uuid;pid uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if oid is null or pid is null or not identity.is_system_admin() then raise exception 'Technical administrator required' using errcode='42501';end if;
 return jsonb_build_object('routing',(select jsonb_build_object('secretaryAccountId',secretary_account_id,'iodDivisionId',iod_division_id,'enabled',enabled,'updatedAt',updated_at) from intake.routing where organization_id=oid and period_id=pid),
 'ready',public.kpi_intake_ready(organization_code),'templates',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'kind',kind,'title',title,'instructions',instructions,'fields',fields,'reference',decision_reference,'status',status,'version',version,'createdBy',created_by) order by updated_at desc),'[]'::jsonb) from intake.form_templates where organization_id=oid and period_id=pid));
end $$;
create function public.kpi_intake_configure(organization_code text,period_code text,command text,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;actor uuid:=identity.current_account_id();secretary uuid;did uuid;template intake.form_templates;field jsonb;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if oid is null or pid is null or not identity.is_system_admin() then raise exception 'Technical administrator required' using errcode='42501';end if;
 if coalesce(length(trim(input->>'note')),0) not between 3 and 2000 then raise exception 'Action note required' using errcode='22023';end if;
 if command='ROUTING' then
  secretary:=(input->>'secretaryAccountId')::uuid;did:=(input->>'iodDivisionId')::uuid;
  if secretary is null or not exists(select 1 from identity.accounts where id=secretary and status='ACTIVE') or did is null or not exists(select 1 from org.divisions where id=did and organization_id=oid) then raise exception 'Activated secretary and IOD division required' using errcode='22023';end if;
  if coalesce((input->>'enabled')::boolean,false) and not governance.authorized(actor,'ASPIRATION_TRIAGE',oid,pid,null,'RAHASIA') then raise exception 'Official intake authority required to open service' using errcode='42501';end if;
  insert into intake.routing values(oid,pid,secretary,did,coalesce((input->>'enabled')::boolean,false),now(),actor) on conflict(organization_id,period_id) do update set secretary_account_id=excluded.secretary_account_id,iod_division_id=excluded.iod_division_id,enabled=excluded.enabled,updated_at=now(),updated_by=actor;
  if coalesce((input->>'enabled')::boolean,false) and not public.kpi_intake_ready(organization_code) then raise exception 'Active period, secretary assignment and access decisions required' using errcode='22023';end if;
 elsif command='TEMPLATE_CREATE' then
  if input->>'kind' is null or input->>'kind' not in ('SARAN','PERTANYAAN','PENGADUAN') or coalesce(length(trim(input->>'title')),0) not between 3 and 180 or coalesce(length(trim(input->>'instructions')),0) not between 3 and 2000 or coalesce(length(trim(input->>'reference')),0)<3 or jsonb_typeof(input->'fields') is distinct from 'array' or jsonb_array_length(input->'fields')>6 then raise exception 'Invalid template' using errcode='22023';end if;
  for field in select * from jsonb_array_elements(input->'fields') loop
   if field->>'key' is null or field->>'key' !~ '^[a-z][a-z0-9_]{1,30}$' or coalesce(length(trim(field->>'label')),0) not between 3 and 180 or jsonb_typeof(field->'required') is distinct from 'boolean' then raise exception 'Invalid form field' using errcode='22023';end if;
  end loop;
  if (select count(distinct x->>'key') from jsonb_array_elements(input->'fields') x)<>jsonb_array_length(input->'fields') then raise exception 'Duplicate question key' using errcode='22023';end if;
  insert into intake.form_templates(organization_id,period_id,kind,title,instructions,fields,decision_reference,created_by) values(oid,pid,input->>'kind',trim(input->>'title'),trim(input->>'instructions'),input->'fields',trim(input->>'reference'),actor);
 elsif command in ('TEMPLATE_APPROVE','TEMPLATE_WITHDRAW') then
  select * into template from intake.form_templates where id=(input->>'id')::uuid and organization_id=oid and period_id=pid for update;
  if template.id is null or template.version is distinct from (input->>'expectedVersion')::integer then raise exception 'Template changed' using errcode='40001';end if;
  if not governance.authorized(actor,'ASPIRATION_TRIAGE',oid,pid,null,'INTERNAL') or (command='TEMPLATE_APPROVE' and actor=template.created_by) then raise exception 'Independent intake authority required' using errcode='42501';end if;
  if command='TEMPLATE_APPROVE' then
   if template.status<>'DRAFT' then raise exception 'Draft required' using errcode='22023';end if;
   update intake.form_templates set status='WITHDRAWN',version=version+1,updated_at=now() where organization_id=oid and period_id=pid and kind=template.kind and status='APPROVED';
   update intake.form_templates set status='APPROVED',approved_by=actor,version=version+1,updated_at=now() where id=template.id;
  else update intake.form_templates set status='WITHDRAWN',version=version+1,updated_at=now() where id=template.id;end if;
 else raise exception 'Invalid intake configuration command' using errcode='22023';end if;
 insert into audit.audit_events(action,module,entity_type,result,request_id,metadata) values('INTAKE_'||command,'intake','configuration','SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'organizationId',oid,'periodId',pid));
 return public.kpi_intake_configuration(organization_code,period_code);
end $$;
create function public.kpi_public_intake_template(organization_code text,form_kind text) returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.kpi_intake_ready(organization_code) then return null;end if;
 return (select jsonb_build_object('id',t.id,'version',t.version,'title',t.title,'instructions',t.instructions,'fields',t.fields) from intake.form_templates t join intake.routing r on r.organization_id=t.organization_id and r.period_id=t.period_id join org.organizations o on o.id=t.organization_id join org.periods p on p.id=t.period_id where o.code=organization_code and r.enabled and p.status='ACTIVE' and current_date between p.starts_on and p.ends_on and t.kind=form_kind and t.status='APPROVED');
end $$;
alter function public.kpi_intake_submit(text,jsonb,text,text) rename to kpi_intake_submit_before_templates;
revoke all on function public.kpi_intake_submit_before_templates(text,jsonb,text,text) from public,anon,authenticated,service_role;
create function public.kpi_intake_submit(organization_code text,input jsonb,token_hash text,fingerprint text) returns jsonb language plpgsql security definer set search_path='' as $$
declare template jsonb;field jsonb;description text:=input->>'description';answers jsonb:=coalesce(input->'answers','{}'::jsonb);answer text;
begin
 template:=public.kpi_public_intake_template(organization_code,input->>'kind');
 if template is not null then
  if (input->>'templateId') is distinct from template->>'id' or (input->>'templateVersion')::integer is distinct from (template->>'version')::integer then raise exception 'Form template changed; reload' using errcode='40001';end if;
  if jsonb_typeof(answers) is distinct from 'object' then raise exception 'Invalid answers' using errcode='22023';end if;
  if exists(select 1 from jsonb_object_keys(answers) k where not exists(select 1 from jsonb_array_elements(template->'fields') f where f->>'key'=k)) then raise exception 'Unknown form question' using errcode='22023';end if;
  for field in select * from jsonb_array_elements(template->'fields') loop
   answer:=trim(coalesce(answers->>(field->>'key'),''));if length(answer)>300 or ((field->>'required')::boolean and length(answer)<1) then raise exception 'Required form answer missing or too long' using errcode='22023';end if;
   if length(answer)>0 then description:=description||E'\n\n'||(field->>'label')||E'\n'||answer;end if;
  end loop;
 elsif input->>'templateId' is not null or answers<>'{}'::jsonb then raise exception 'Form template unavailable' using errcode='40001';end if;
 if description is null or length(description)>6000 then raise exception 'Description too long' using errcode='22023';end if;
 return public.kpi_intake_submit_before_templates(organization_code,jsonb_set(input,'{description}',to_jsonb(description)),token_hash,fingerprint);
end $$;
revoke all on function public.kpi_intake_configuration(text,text),public.kpi_intake_configure(text,text,text,jsonb),public.kpi_public_intake_template(text,text),public.kpi_intake_submit(text,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.kpi_intake_configuration(text,text),public.kpi_intake_configure(text,text,text,jsonb) to authenticated;
grant execute on function public.kpi_public_intake_template(text,text),public.kpi_intake_submit(text,jsonb,text,text) to service_role;
alter function public.kpi_operations_schema_ready() rename to kpi_operations_schema_ready_before_group_two;
revoke all on function public.kpi_operations_schema_ready_before_group_two() from public,anon,authenticated,service_role;
create function public.kpi_operations_schema_ready() returns boolean language sql stable security definer set search_path='' as $$
 select public.kpi_operations_schema_ready_before_group_two() and to_regprocedure('public.kpi_task_extend(uuid,integer,text,jsonb)') is not null and to_regprocedure('public.kpi_module_attachment_action(text,uuid,integer,text,uuid,text)') is not null and to_regprocedure('public.kpi_asset_versions(uuid)') is not null and to_regprocedure('public.kpi_publish_due()') is not null and to_regprocedure('public.kpi_delivery_validate(uuid,uuid)') is not null and to_regprocedure('public.kpi_roster_action(text,text,text,jsonb)') is not null and to_regprocedure('public.kpi_public_intake_template(text,text)') is not null;
$$;
revoke all on function public.kpi_operations_schema_ready() from public,anon,authenticated;
grant execute on function public.kpi_operations_schema_ready() to anon,authenticated,service_role;
notify pgrst,'reload schema';
commit;
