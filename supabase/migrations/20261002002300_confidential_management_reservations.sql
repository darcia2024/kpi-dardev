begin;
create table management.reservations(id uuid primary key references governance.information_resources(id),kind text not null check(kind in ('EVALUATION','AI_DRAFT')),organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),division_id uuid references org.divisions(id),creator_account_id uuid not null references identity.accounts(id),expires_at timestamptz not null default now()+interval '7 days');
alter table management.reservations enable row level security;
revoke all on management.reservations from public,anon,authenticated;
create function public.kpi_management_reserve(record_kind text,organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;actor uuid:=identity.current_account_id();slot management.reservations;reserved_id uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if actor is null or record_kind is null or record_kind not in ('EVALUATION','AI_DRAFT') or oid is null or (division_code is not null and did is null) or not identity.has_permission(management.read_permission(record_kind),oid,pid,did) or not identity.has_permission(management.write_permission(record_kind),oid,pid,did) then raise exception 'Reservation denied' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('reservation:'||actor::text||record_kind||oid::text||pid::text||coalesce(did::text,''),0));
 select * into slot from management.reservations s where s.creator_account_id=actor and s.kind=record_kind and s.organization_id=oid and s.period_id=pid and s.division_id is not distinct from did and s.expires_at>now() and not exists(select 1 from management.records r where r.id=s.id) order by s.expires_at desc limit 1;
 if slot.id is null then
  reserved_id:=gen_random_uuid();insert into governance.information_resources(id,organization_id,period_id,kind,classification) values(reserved_id,oid,pid,record_kind,'RAHASIA');
  insert into management.reservations(id,kind,organization_id,period_id,division_id,creator_account_id) values(reserved_id,record_kind,oid,pid,did,actor) returning * into slot;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('CONFIDENTIAL_RECORD_RESERVED','management',record_kind,slot.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor));
 end if;
 return jsonb_build_object('id',slot.id,'classification','RAHASIA','expiresAt',slot.expires_at);
end $$;
revoke all on function public.kpi_management_reserve(text,text,text,text) from public,anon,authenticated;
grant execute on function public.kpi_management_reserve(text,text,text,text) to authenticated;
create or replace function public.kpi_management_create(record_kind text,organization_code text,period_code text,division_code text,input jsonb,request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;actor uuid:=identity.current_account_id();r management.records;b management.records;data jsonb;subject uuid;amount bigint;reserved_id uuid;slot management.reservations;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 reserved_id:=case when record_kind in ('EVALUATION','AI_DRAFT') then (input->>'reservedId')::uuid else null end;
 if actor is null or management.read_permission(record_kind) is null or oid is null or (division_code is not null and did is null) or not identity.has_permission(management.read_permission(record_kind),oid,pid,did,reserved_id) or not identity.has_permission(management.write_permission(record_kind),oid,pid,did,reserved_id) then raise exception 'Access denied' using errcode='42501';end if;
 if record_kind in ('EVALUATION','AI_DRAFT') then
  select * into slot from management.reservations where id=reserved_id for update;
  if slot.id is null or slot.creator_account_id<>actor or slot.kind<>record_kind or slot.organization_id<>oid or slot.period_id<>pid or slot.division_id is distinct from did or (slot.expires_at<=now() and not exists(select 1 from management.records where id=slot.id)) then raise exception 'Approved confidential record reservation required' using errcode='42501';end if;
 end if;
 if input is null or octet_length(input::text)>16000 or request_key is null or input::text ~* '(21st_sk_|sk-proj-|eyJhbGciOi)' then raise exception 'Invalid input' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||request_key::text,0));select * into r from management.records t where t.creator_account_id=actor and t.request_key=request_key;
 if r.id is not null then if r.kind<>record_kind or r.organization_id<>oid or r.period_id<>pid or r.division_id is distinct from did or r.payload->'submission' is distinct from input then raise exception 'Request key already used' using errcode='40001';end if;return management.record_json(r);end if;
 data:=jsonb_build_object('description',governance.text_value(input,'description',3,4000),'submission',input);
 if record_kind in ('BUDGET','FINANCE') then
  amount:=management.money(input);data:=data||jsonb_build_object('amountMinor',amount,'currency',input->>'currency');
  if record_kind='FINANCE' then
   select * into b from management.records where id=(input->>'budgetId')::uuid and kind='BUDGET' for update;
   if b.id is null or b.status<>'APPROVED' or b.organization_id<>oid or b.period_id<>pid or b.division_id is distinct from did or b.payload->>'currency'<>input->>'currency' or not management.can_read(b) then raise exception 'Approved budget in same scope required' using errcode='42501';end if;
   data:=data||jsonb_build_object('budgetId',b.id);
  end if;
 elsif record_kind in ('EVALUATION','HANDOVER') then
  subject:=(input->>'subjectAccountId')::uuid;if subject is null or not management.member(subject,oid,pid,did) then raise exception 'Assigned subject required' using errcode='22023';end if;
  if record_kind='EVALUATION' then
   if input->>'score' is null or input->>'score' !~ '^[0-9]{1,3}$' or (input->>'score')::integer not between 0 and 100 then raise exception 'Score 0 to 100 required' using errcode='22023';end if;
   data:=data||jsonb_build_object('score',(input->>'score')::integer,'criteriaReference',governance.text_value(input,'criteriaReference',3,500));
  else
   if subject=actor then raise exception 'Independent successor required' using errcode='22023';end if;
   data:=data||jsonb_build_object('items','[]'::jsonb,'ongoingConfidentiality',true);
  end if;
 elsif record_kind='AI_DRAFT' then
  if length(data->>'description')<10 then raise exception 'Draft description too short' using errcode='22023';end if;
  if input->>'target' is null or input->>'target' not in ('TASK','KNOWLEDGE') or jsonb_typeof(coalesce(input->'sources','[]'::jsonb))<>'array' or jsonb_array_length(coalesce(input->'sources','[]'::jsonb))>5 then raise exception 'Invalid AI draft' using errcode='22023';end if;
  perform public.kpi_ai_sources(organization_code,period_code,division_code,array(select value::uuid from jsonb_array_elements_text(coalesce(input->'sources','[]'::jsonb))));
  data:=data||jsonb_build_object('target',input->>'target','sources',coalesce(input->'sources','[]'::jsonb),'sourceVersions',(select coalesce(jsonb_object_agg(c.id::text,c.version),'{}'::jsonb) from content.managed_items c where (coalesce(input->'sources','[]'::jsonb))?c.id::text),'previewExpiresAt',now()+interval '30 minutes','origin','USER_REVIEWED_DRAFT');
 elsif record_kind='RECOVERY_CHECK' then data:=data||jsonb_build_object('backupReference',governance.text_value(input,'backupReference',3,500),'restorationReference',governance.text_value(input,'restorationReference',3,500));
 else raise exception 'Invalid record kind' using errcode='22023';end if;
 insert into management.records(id,kind,organization_id,period_id,division_id,creator_account_id,subject_account_id,title,payload,request_key) values(coalesce(reserved_id,gen_random_uuid()),record_kind,oid,pid,did,actor,subject,governance.text_value(input,'title',3,180),data,request_key) returning * into r;
 insert into governance.information_resources(id,organization_id,period_id,kind,classification) values(r.id,oid,pid,record_kind,'TERBATAS') on conflict(id) do nothing;
 insert into management.events(record_id,version,action,actor_account_id,note) values(r.id,1,'CREATED',actor,'Catatan dibuat');
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('MANAGEMENT_CREATED','management',record_kind,r.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor));
 return management.record_json(r);
exception when invalid_text_representation or datetime_field_overflow then raise exception 'Invalid management input' using errcode='22023';end $$;
create or replace function public.kpi_management_list(record_kind text,organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;
begin
 if identity.current_account_id() is null or management.read_permission(record_kind) is null then raise exception 'Access denied' using errcode='42501';end if;
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or (not identity.has_permission(management.read_permission(record_kind),oid,pid,did) and not exists(select 1 from management.records r where r.organization_id=oid and r.period_id=pid and r.kind=record_kind and management.can_read(r)) and not exists(select 1 from management.reservations s where s.organization_id=oid and s.period_id=pid and s.kind=record_kind and (did is null or s.division_id=did) and identity.has_permission(management.read_permission(s.kind),oid,pid,s.division_id,s.id))) then raise exception 'Access denied' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(management.record_json(r) order by r.updated_at desc),'[]'::jsonb) from (select * from management.records t where t.kind=record_kind and t.organization_id=oid and t.period_id=pid and (division_code is null or t.division_id=did) and management.can_read(t) order by t.updated_at desc limit 100)r);
end $$;
update governance.information_resources g set classification='RAHASIA',version=version+1 where g.id in (select id from management.records where kind in ('EVALUATION','AI_DRAFT')) and g.classification<>'RAHASIA';
create or replace function public.kpi_operations_schema_ready() returns boolean language sql stable security definer set search_path='' as $$
 select public.kpi_operations_schema_ready_before_management() and to_regclass('management.records') is not null and to_regclass('management.ai_usage') is not null and to_regclass('management.reservations') is not null
 and to_regprocedure('public.kpi_management_action(uuid,integer,text,jsonb)') is not null and to_regprocedure('public.kpi_ai_draft_commit(uuid,integer,text)') is not null
 and to_regprocedure('public.kpi_workspace_snapshot(text,text,text)') is not null and to_regprocedure('public.kpi_ai_proposal_create(text,text,text,jsonb,uuid)') is not null and to_regprocedure('public.kpi_management_reserve(text,text,text,text)') is not null;
$$;
notify pgrst,'reload schema';
commit;
