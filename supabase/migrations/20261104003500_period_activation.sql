begin;
do $$ begin
 if exists(select 1 from org.periods where status in ('ACTIVE','CLOSING') group by organization_id having count(*)>1) then
  raise exception 'Ada organisasi dengan lebih dari satu periode berjalan. Tutup salah satunya sebelum menjalankan migration ini.';
 end if;
end $$;
create unique index periods_one_running on org.periods(organization_id) where status in ('ACTIVE','CLOSING');

-- Saving a period only records the plan. Running it needs an official decision (kpi_admin_period_action).
create or replace function public.kpi_admin_setup(organization_code text,organization_name text,period_code text,start_date date,end_date date)
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
    return public.kpi_admin_directory()||jsonb_build_object('unchanged',true);
  end if;
  insert into org.periods(organization_id,code,starts_on,ends_on,status) values(org_id,period_code,start_date,end_date,'PLANNED') returning id into period_id;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
    values('ORGANIZATION_PERIOD_CREATED','org','period',period_id,'SUCCESS','hosted:' || gen_random_uuid(),
      jsonb_build_object('actorAccountId',actor,'organizationId',org_id));
  return public.kpi_admin_directory();
end $$;

create function public.kpi_admin_period_action(period_id uuid,command text,reference text) returns jsonb language plpgsql security definer set search_path='' as $$
declare target org.periods; actor uuid:=identity.current_account_id();
begin
 select * into target from org.periods where id=period_id for update;
 if target.id is null or not identity.is_super_admin(target.organization_id) then raise exception 'Access denied' using errcode='42501'; end if;
 if reference is null or length(trim(reference)) not between 5 and 500 then raise exception 'Official decision reference required' using errcode='22023'; end if;
 if command='ACTIVATE' then
  if target.status<>'PLANNED' or current_date not between target.starts_on and target.ends_on then raise exception 'Period must be planned and within its dates' using errcode='22023'; end if;
  -- Sample data must be gone first: contoh-hapus.sql removes it, and it would otherwise mix with official work.
  if exists(select 1 from org.periods p where p.organization_id=target.organization_id and (p.code='CONTOH' or (p.status in ('ACTIVE','CLOSING') and p.id<>target.id))) then raise exception 'Another period is running or sample data is still installed' using errcode='40001'; end if;
  update org.periods set status='ACTIVE' where id=target.id;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('OFFICIAL_PERIOD_ACTIVATED','org','period',target.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'decisionReference',trim(reference)));
 elsif command='CLOSE' then
  if target.status not in ('ACTIVE','CLOSING') then raise exception 'Period is not running' using errcode='22023'; end if;
  update org.periods set status='CLOSED' where id=target.id;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('OFFICIAL_PERIOD_CLOSED','org','period',target.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'decisionReference',trim(reference)));
 else raise exception 'Unknown period action' using errcode='22023'; end if;
 return public.kpi_admin_directory();
exception when unique_violation then raise exception 'Another period is running' using errcode='40001';
end $$;
revoke all on function public.kpi_admin_period_action(uuid,text,text) from public,anon,authenticated;
grant execute on function public.kpi_admin_period_action(uuid,text,text) to authenticated;

-- RPCs already derive both ids from one join; this keeps direct writes from mixing organizations too.
create function org.require_period_in_organization() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from org.periods where id=new.period_id and organization_id=new.organization_id) then raise exception 'Period does not belong to organization' using errcode='23514'; end if;
 return new;
end $$;
revoke all on function org.require_period_in_organization() from public,anon,authenticated;
create trigger period_in_organization before insert or update of organization_id,period_id on work.meetings for each row execute function org.require_period_in_organization();
create trigger period_in_organization before insert or update of organization_id,period_id on files.managed_assets for each row execute function org.require_period_in_organization();
create trigger period_in_organization before insert or update of organization_id,period_id on governance.access_decisions for each row execute function org.require_period_in_organization();
create trigger period_in_organization before insert or update of organization_id,period_id on governance.workflow_records for each row execute function org.require_period_in_organization();
notify pgrst,'reload schema';
commit;
