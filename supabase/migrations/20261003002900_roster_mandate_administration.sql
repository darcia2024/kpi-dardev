begin;
alter table org.assignments add column decision_reference text;
alter table org.assignments add column version integer not null default 1;
create table governance.mandate_submissions (
 id uuid primary key default gen_random_uuid(),organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),division_id uuid references org.divisions(id),
 account_id uuid not null references identity.accounts(id),permissions text[] not null,classifications text[] not null,mandate_reference text not null,starts_at timestamptz not null,expires_at timestamptz not null,
 created_by uuid not null references identity.accounts(id),approved_by uuid references identity.accounts(id),status text not null default 'PENDING' check(status in ('PENDING','APPROVED','REJECTED','REVOKED')),authority_id uuid references governance.access_authorities(id),version integer not null default 1,note text not null,updated_at timestamptz not null default now()
);
alter table governance.mandate_submissions enable row level security;revoke all on governance.mandate_submissions from public,anon,authenticated;
create function public.kpi_roster_directory(organization_code text,period_code text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare oid uuid;pid uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if oid is null or pid is null or not identity.is_system_admin() then raise exception 'Technical administrator required' using errcode='42501';end if;
 return jsonb_build_object('accounts',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',display_name,'email',email,'status',status) order by display_name),'[]'::jsonb) from identity.accounts),
 'divisions',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'code',code,'name',name) order by code),'[]'::jsonb) from org.divisions where organization_id=oid),
 'positions',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'code',code,'name',name,'divisionId',division_id) order by code),'[]'::jsonb) from org.positions where organization_id=oid),
 'assignments',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'accountId',account_id,'positionId',position_id,'startsOn',starts_on,'endsOn',ends_on,'decisionReference',decision_reference,'version',version)),'[]'::jsonb) from org.assignments where period_id=pid),
 'mandates',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'accountId',account_id,'divisionId',division_id,'permissions',permissions,'classifications',classifications,'reference',mandate_reference,'startsAt',starts_at,'expiresAt',expires_at,'status',status,'version',version,'note',note) order by updated_at desc),'[]'::jsonb) from governance.mandate_submissions where organization_id=oid and period_id=pid));
end $$;
create function public.kpi_roster_action(organization_code text,period_code text,command text,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;period org.periods;actor uuid:=identity.current_account_id();did uuid;pos uuid;account uuid;item org.assignments;submission governance.mandate_submissions;parent governance.access_authorities;startdate date;enddate date;
begin
 select id into oid from org.organizations where code=organization_code;
 select * into period from org.periods where organization_id=oid and code=period_code;
 if oid is null or period.id is null or not identity.is_system_admin() then raise exception 'Technical administrator required' using errcode='42501';end if;
 if period.status='CLOSED' or input->>'note' is null or length(trim(input->>'note')) not between 3 and 2000 then raise exception 'Open period and note required' using errcode='22023';end if;
 if command in ('DIVISION','POSITION') then
  if input->>'code' is null or input->>'code' !~ '^[A-Z][A-Z0-9_]{1,39}$' or input->>'name' is null or length(trim(input->>'name')) not between 3 and 180 then raise exception 'Invalid unit' using errcode='22023';end if;
  if command='DIVISION' then
   insert into org.divisions(organization_id,code,name) values(oid,input->>'code',trim(input->>'name')) on conflict on constraint divisions_code_per_organization do update set name=excluded.name;
  else
   did:=nullif(input->>'divisionId','')::uuid;if did is not null and not exists(select 1 from org.divisions where id=did and organization_id=oid) then raise exception 'Division scope mismatch' using errcode='22023';end if;
   if exists(select 1 from org.positions p where p.organization_id=oid and p.code=input->>'code' and p.division_id is distinct from did and exists(select 1 from org.assignments a where a.position_id=p.id)) then raise exception 'Assigned position cannot move divisions' using errcode='40001';end if;
   insert into org.positions(organization_id,code,name,division_id) values(oid,input->>'code',trim(input->>'name'),did) on conflict(organization_id,code) do update set name=excluded.name,division_id=excluded.division_id;
  end if;
 elsif command='ASSIGN' then
  account:=(input->>'accountId')::uuid;pos:=(input->>'positionId')::uuid;startdate:=(input->>'startsOn')::date;enddate:=(input->>'endsOn')::date;
  if not exists(select 1 from identity.accounts where id=account and status='ACTIVE' and deactivated_at is null) or not exists(select 1 from org.positions where id=pos and organization_id=oid) then raise exception 'Activated account and scoped position required' using errcode='22023';end if;
  if startdate is null or enddate is null or startdate<period.starts_on or enddate>period.ends_on or enddate<startdate or coalesce(length(trim(input->>'decisionReference')),0)<3 then raise exception 'Assignment dates and official decision required' using errcode='22023';end if;
  perform pg_advisory_xact_lock(hashtextextended('assignment:'||account::text||period.id::text,0));
  select * into item from org.assignments where account_id=account and position_id=pos and period_id=period.id;
  if item.id is not null then
   if (input->>'expectedVersion')::integer is distinct from item.version then raise exception 'Assignment changed' using errcode='40001';end if;
   update org.assignments set starts_on=startdate,ends_on=enddate,decision_reference=trim(input->>'decisionReference'),version=version+1 where id=item.id;
  else
   insert into org.assignments(account_id,position_id,period_id,starts_on,ends_on,decision_reference) values(account,pos,period.id,startdate,enddate,trim(input->>'decisionReference'));
  end if;
 elsif command='END_ASSIGNMENT' then
  select * into item from org.assignments where id=(input->>'id')::uuid and period_id=period.id for update;
  if item.id is null or item.version is distinct from (input->>'expectedVersion')::integer then raise exception 'Assignment changed' using errcode='40001';end if;
  enddate:=(input->>'endsOn')::date;if enddate is null or enddate<item.starts_on or enddate>period.ends_on or coalesce(length(trim(input->>'decisionReference')),0)<3 then raise exception 'Invalid assignment end date' using errcode='22023';end if;
  update org.assignments set ends_on=enddate,version=version+1,decision_reference=trim(input->>'decisionReference') where id=item.id;
 elsif command='MANDATE_PROPOSE' then
  account:=(input->>'accountId')::uuid;did:=nullif(input->>'divisionId','')::uuid;
  if not exists(select 1 from identity.accounts where id=account and status='ACTIVE') or (did is not null and not exists(select 1 from org.divisions where id=did and organization_id=oid)) then raise exception 'Mandate scope mismatch' using errcode='22023';end if;
  if jsonb_typeof(input->'permissions') is distinct from 'array' or jsonb_typeof(input->'classifications') is distinct from 'array' or jsonb_array_length(input->'permissions')=0 or jsonb_array_length(input->'classifications')=0 or coalesce(length(trim(input->>'reference')),0)<3 or (input->>'expiresAt')::timestamptz<=(input->>'startsAt')::timestamptz or input->>'startsAt' is null or input->>'expiresAt' is null then raise exception 'Documented mandate details required' using errcode='22023';end if;
  if (input->>'startsAt')::timestamptz<period.starts_on::timestamptz or (input->>'expiresAt')::timestamptz>period.ends_on::timestamptz+interval '1 day' then raise exception 'Mandate dates exceed period' using errcode='22023';end if;
  if exists(select 1 from jsonb_array_elements_text(input->'classifications') v where v not in ('TERBUKA','INTERNAL','TERBATAS','RAHASIA')) then raise exception 'Invalid classification' using errcode='22023';end if;
  insert into governance.mandate_submissions(organization_id,period_id,division_id,account_id,permissions,classifications,mandate_reference,starts_at,expires_at,created_by,note) values(oid,period.id,did,account,array(select jsonb_array_elements_text(input->'permissions')),array(select jsonb_array_elements_text(input->'classifications')),trim(input->>'reference'),(input->>'startsAt')::timestamptz,(input->>'expiresAt')::timestamptz,actor,trim(input->>'note'));
 elsif command in ('MANDATE_APPROVE','MANDATE_REJECT','MANDATE_REVOKE') then
  select * into submission from governance.mandate_submissions where id=(input->>'id')::uuid and organization_id=oid and period_id=period.id for update;
  if submission.id is null or submission.version is distinct from (input->>'expectedVersion')::integer then raise exception 'Mandate changed' using errcode='40001';end if;
  if actor in (submission.created_by,submission.account_id) then raise exception 'Independent mandate reviewer required' using errcode='42501';end if;
  select * into parent from governance.access_authorities a where a.account_id=actor and a.organization_id=oid and a.period_id=period.id and (a.division_id is null or a.division_id=submission.division_id) and 'IDENTITY_MANAGE'=any(a.permissions) and submission.permissions<@a.permissions and submission.classifications<@a.classifications and a.starts_at<=now() and a.expires_at>=submission.expires_at and a.revoked_at is null and not governance.has_conflict(actor,oid,period.id,submission.id) limit 1;
  if parent.id is null then raise exception 'Documented mandate administration authority required' using errcode='42501';end if;
  if command='MANDATE_APPROVE' then
   if submission.status<>'PENDING' then raise exception 'Pending mandate required' using errcode='22023';end if;
   insert into governance.access_authorities(account_id,organization_id,period_id,division_id,classifications,permissions,mandate_reference,starts_at,expires_at) values(submission.account_id,oid,period.id,submission.division_id,submission.classifications,submission.permissions,submission.mandate_reference,submission.starts_at,submission.expires_at) returning id into submission.authority_id;
   update governance.mandate_submissions set status='APPROVED',approved_by=actor,authority_id=submission.authority_id,version=version+1,note=trim(input->>'note'),updated_at=now() where id=submission.id;
  elsif command='MANDATE_REJECT' then
   if submission.status<>'PENDING' then raise exception 'Pending mandate required' using errcode='22023';end if;
   update governance.mandate_submissions set status='REJECTED',approved_by=actor,version=version+1,note=trim(input->>'note'),updated_at=now() where id=submission.id;
  else
   if submission.status<>'APPROVED' then raise exception 'Approved mandate required' using errcode='22023';end if;
   update governance.access_authorities set revoked_at=now() where id=submission.authority_id;
   update governance.mandate_submissions set status='REVOKED',version=version+1,note=trim(input->>'note'),updated_at=now() where id=submission.id;
  end if;
 else raise exception 'Invalid administration command' using errcode='22023';end if;
 insert into audit.audit_events(action,module,entity_type,result,request_id,metadata) values('ROSTER_'||command,'identity','roster','SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'organizationId',oid,'periodId',period.id));
 return public.kpi_roster_directory(organization_code,period_code);
exception when invalid_text_representation or datetime_field_overflow then raise exception 'Invalid administration fields' using errcode='22023';
end $$;
revoke all on function public.kpi_roster_directory(text,text),public.kpi_roster_action(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.kpi_roster_directory(text,text),public.kpi_roster_action(text,text,text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
