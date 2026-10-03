begin;
create schema if not exists management;
revoke all on schema management from public,anon,authenticated;
create table management.records(
 id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('BUDGET','FINANCE','EVALUATION','HANDOVER','AI_DRAFT','RECOVERY_CHECK')),
 organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),division_id uuid references org.divisions(id),
 creator_account_id uuid not null references identity.accounts(id),subject_account_id uuid references identity.accounts(id),reviewer_account_id uuid references identity.accounts(id),
 title text not null check(length(trim(title)) between 3 and 180),status text not null default 'DRAFT',version integer not null default 1,
 payload jsonb not null,request_key uuid not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(creator_account_id,request_key)
);
create table management.events(id uuid primary key default gen_random_uuid(),record_id uuid not null references management.records(id),version integer not null,action text not null,
 actor_account_id uuid not null references identity.accounts(id),note text not null,created_at timestamptz not null default now(),unique(record_id,version));
alter table management.records enable row level security;
alter table management.events enable row level security;
revoke all on management.records,management.events from public,anon,authenticated;
create index management_scope on management.records(organization_id,period_id,kind,updated_at desc);
create function management.read_permission(kind text) returns text language sql immutable set search_path='' as $$
 select case kind when 'BUDGET' then 'FINANCE_READ' when 'FINANCE' then 'FINANCE_READ' when 'EVALUATION' then 'EVALUATION_READ' when 'HANDOVER' then 'HANDOVER_READ' when 'AI_DRAFT' then 'AI_READ' when 'RECOVERY_CHECK' then 'SYSTEM_CONFIGURATION_READ' end;
$$;
create function management.write_permission(kind text) returns text language sql immutable set search_path='' as $$
 select case kind when 'BUDGET' then 'FINANCE_MANAGE' when 'FINANCE' then 'FINANCE_MANAGE' when 'EVALUATION' then 'EVALUATION_WRITE' when 'HANDOVER' then 'HANDOVER_ACCEPT' when 'AI_DRAFT' then 'AI_ACTION_CONFIRM' when 'RECOVERY_CHECK' then 'SYSTEM_CONFIGURATION_READ' end;
$$;
create function management.can_read(r management.records) returns boolean language sql stable security definer set search_path='' as $$
 select identity.has_permission(management.read_permission(r.kind),r.organization_id,r.period_id,r.division_id,r.id)
 and (r.kind<>'AI_DRAFT' or r.creator_account_id=identity.current_account_id());
$$;
create function management.record_json(r management.records) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',r.id,'kind',r.kind,'organizationCode',(select code from org.organizations where id=r.organization_id),'periodCode',(select code from org.periods where id=r.period_id),
 'divisionCode',(select code from org.divisions where id=r.division_id),'title',r.title,'status',r.status,'version',r.version,'creatorAccountId',r.creator_account_id,'subjectAccountId',r.subject_account_id,
 'reviewerAccountId',r.reviewer_account_id,'payload',r.payload-'submission','updatedAt',r.updated_at,
 'events',(select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'action',e.action,'note',e.note,'actorAccountId',e.actor_account_id,'at',e.created_at,'version',e.version) order by e.version),'[]'::jsonb) from management.events e where e.record_id=r.id));
$$;
create function management.money(input jsonb) returns bigint language plpgsql immutable set search_path='' as $$
declare value bigint;
begin
 if input->>'amountMinor' is null or input->>'amountMinor' !~ '^[0-9]{1,12}$' or input->>'currency' is null or input->>'currency' not in ('IDR','EGP','USD') then raise exception 'Invalid amount or currency' using errcode='22023';end if;
 value:=(input->>'amountMinor')::bigint;if value<1 then raise exception 'Amount must be positive' using errcode='22023';end if;return value;
end $$;
create function management.member(account uuid,oid uuid,pid uuid,did uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id join identity.accounts a on a.id=s.account_id where a.id=account and a.status='ACTIVE' and a.deactivated_at is null
 and s.period_id=pid and p.organization_id=oid and (did is null or p.division_id=did) and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date));
$$;
create function management.check_evidence(asset uuid,oid uuid,pid uuid) returns void language plpgsql stable security definer set search_path='' as $$
begin
 if asset is null or not exists(select 1 from files.managed_assets a where a.id=asset and a.organization_id=oid and a.period_id=pid and a.status='AVAILABLE' and identity.has_permission('ASSET_READ',oid,pid,a.division_id,a.id)) then raise exception 'Readable verified evidence required' using errcode='42501';end if;
end $$;
create function public.kpi_management_list(record_kind text,organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;
begin
 if identity.current_account_id() is null or management.read_permission(record_kind) is null then raise exception 'Access denied' using errcode='42501';end if;
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or (not identity.has_permission(management.read_permission(record_kind),oid,pid,did) and not exists(select 1 from management.records r where r.organization_id=oid and r.period_id=pid and r.kind=record_kind and management.can_read(r))) then raise exception 'Access denied' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(management.record_json(r) order by r.updated_at desc),'[]'::jsonb) from (select * from management.records t where t.kind=record_kind and t.organization_id=oid and t.period_id=pid and (division_code is null or t.division_id=did) and management.can_read(t) order by t.updated_at desc limit 100)r);
end $$;
create function public.kpi_management_people(organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or not (identity.has_permission('EVALUATION_WRITE',oid,pid,did) or identity.has_permission('HANDOVER_ACCEPT',oid,pid,did)) then raise exception 'Access denied' using errcode='42501';end if;
 return(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'name',a.display_name)),'[]'::jsonb) from identity.accounts a where management.member(a.id,oid,pid,did));
end $$;
create function public.kpi_management_create(record_kind text,organization_code text,period_code text,division_code text,input jsonb,request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;actor uuid:=identity.current_account_id();r management.records;b management.records;data jsonb;subject uuid;amount bigint;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if actor is null or management.read_permission(record_kind) is null or oid is null or (division_code is not null and did is null) or not identity.has_permission(management.read_permission(record_kind),oid,pid,did) or not identity.has_permission(management.write_permission(record_kind),oid,pid,did) then raise exception 'Access denied' using errcode='42501';end if;
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
 insert into management.records(kind,organization_id,period_id,division_id,creator_account_id,subject_account_id,title,payload,request_key) values(record_kind,oid,pid,did,actor,subject,governance.text_value(input,'title',3,180),data,request_key) returning * into r;
 insert into governance.information_resources(id,organization_id,period_id,kind,classification) values(r.id,oid,pid,record_kind,'TERBATAS');
 insert into management.events(record_id,version,action,actor_account_id,note) values(r.id,1,'CREATED',actor,'Catatan dibuat');
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('MANAGEMENT_CREATED','management',record_kind,r.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor));
 return management.record_json(r);
exception when invalid_text_representation or datetime_field_overflow then raise exception 'Invalid management input' using errcode='22023';end $$;
create function public.kpi_management_action(record_id uuid,expected_version integer,record_action text,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare r management.records;b management.records;actor uuid:=identity.current_account_id();data jsonb;note text;entry jsonb;items jsonb;used bigint;
begin
 select * into r from management.records where id=record_id for update;
 if r.id is null or not management.can_read(r) then raise exception 'Access denied' using errcode='42501';end if;
 if expected_version is null or r.version<>expected_version then raise exception 'Record changed; refresh first' using errcode='40001';end if;
 if input is null or octet_length(input::text)>16000 or input::text ~* '(21st_sk_|sk-proj-|eyJhbGciOi)' then raise exception 'Invalid input' using errcode='22023';end if;
 note:=governance.text_value(input,'note');data:=r.payload;
 if r.status in ('CLOSED','ARCHIVED','REJECTED','COMMITTED') then raise exception 'Record finalized' using errcode='22023';end if;
 if record_action='SAVE' then
  if actor<>r.creator_account_id or r.status not in ('DRAFT','REVISION') or not identity.has_permission(management.write_permission(r.kind),r.organization_id,r.period_id,r.division_id,r.id) then raise exception 'Draft owner required' using errcode='42501';end if;
  r.title:=governance.text_value(input,'title',3,180);data:=data||jsonb_build_object('description',governance.text_value(input,'description',3,4000));
  if r.kind in ('BUDGET','FINANCE') then
   used:=management.money(input);
   if input->>'currency'<>data->>'currency' then raise exception 'Currency is fixed' using errcode='22023';end if;
   data:=data||jsonb_build_object('amountMinor',used);
  elsif r.kind='EVALUATION' then
   if input->>'score' is null or input->>'score' !~ '^[0-9]{1,3}$' or (input->>'score')::integer not between 0 and 100 then raise exception 'Invalid score' using errcode='22023';end if;
   data:=data||jsonb_build_object('score',(input->>'score')::integer,'criteriaReference',governance.text_value(input,'criteriaReference',3,500));
  end if;
  if r.kind='AI_DRAFT' then
   if length(data->>'description')<10 then raise exception 'Draft description too short' using errcode='22023';end if;
   perform public.kpi_ai_sources((select code from org.organizations where id=r.organization_id),(select code from org.periods where id=r.period_id),(select code from org.divisions where id=r.division_id),array(select value::uuid from jsonb_array_elements_text(data->'sources')));
   data:=data||jsonb_build_object('previewExpiresAt',now()+interval '30 minutes','sourceVersions',(select coalesce(jsonb_object_agg(c.id::text,c.version),'{}'::jsonb) from content.managed_items c where (data->'sources')?c.id::text));
  end if;
 elsif record_action='SUBMIT' then
  if actor<>r.creator_account_id or r.status not in ('DRAFT','REVISION') or not identity.has_permission(management.write_permission(r.kind),r.organization_id,r.period_id,r.division_id,r.id) or r.kind='AI_DRAFT' then raise exception 'Submission denied' using errcode='42501';end if;
  if r.kind in ('FINANCE','EVALUATION') then perform management.check_evidence((input->>'evidenceAssetId')::uuid,r.organization_id,r.period_id);data:=data||jsonb_build_object('evidenceAssetId',input->>'evidenceAssetId');end if;
  if r.kind='HANDOVER' and jsonb_array_length(data->'items')=0 then raise exception 'Handover items required' using errcode='22023';end if;
  r.status:='IN_REVIEW';
 elsif record_action in ('REQUEST_REVISION','REJECT') then
  if actor=r.creator_account_id or r.status not in ('IN_REVIEW','CHECKED','APPEALED') or not identity.has_permission(case when r.kind in ('BUDGET','FINANCE') then 'FINANCE_APPROVE_FINAL' else management.write_permission(r.kind) end,r.organization_id,r.period_id,r.division_id,r.id) or (r.kind='HANDOVER' and actor<>r.subject_account_id) or (r.kind='EVALUATION' and actor=r.subject_account_id) then raise exception 'Independent reviewer required' using errcode='42501';end if;
  r.status:=case when record_action='REJECT' then 'REJECTED' else 'REVISION' end;r.reviewer_account_id:=actor;
 elsif r.kind='FINANCE' then
  if record_action='CHECK' then
   if r.status<>'IN_REVIEW' or actor=r.creator_account_id or not identity.has_permission('FINANCE_MANAGE',r.organization_id,r.period_id,r.division_id,r.id) then raise exception 'Independent finance checker required' using errcode='42501';end if;
   perform management.check_evidence((data->>'evidenceAssetId')::uuid,r.organization_id,r.period_id);data:=data||jsonb_build_object('checkedBy',actor);r.status:='CHECKED';
  elsif record_action='APPROVE' then
   if r.status<>'CHECKED' or actor in (r.creator_account_id,(data->>'checkedBy')::uuid) or not identity.has_permission('FINANCE_APPROVE_FINAL',r.organization_id,r.period_id,r.division_id,r.id) then raise exception 'Independent final approver required' using errcode='42501';end if;
   select * into b from management.records where id=(data->>'budgetId')::uuid for update;
   if b.id is null or b.status<>'APPROVED' or not management.can_read(b) then raise exception 'Approved budget required' using errcode='42501';end if;
   select coalesce(sum((t.payload->>'amountMinor')::bigint),0) into used from management.records t where t.kind='FINANCE' and t.id<>r.id and t.payload->>'budgetId'=b.id::text and t.status in ('APPROVED','PAID','RECONCILED');
   if used+(data->>'amountMinor')::bigint>(b.payload->>'amountMinor')::bigint then raise exception 'Budget exceeded' using errcode='22023';end if;
   perform management.check_evidence((data->>'evidenceAssetId')::uuid,r.organization_id,r.period_id);r.status:='APPROVED';r.reviewer_account_id:=actor;
  elsif record_action='RECORD_PAYMENT' then
   if r.status<>'APPROVED' or not identity.has_permission('FINANCE_MANAGE',r.organization_id,r.period_id,r.division_id,r.id) then raise exception 'Approved transaction required' using errcode='42501';end if;
   perform management.check_evidence((input->>'evidenceAssetId')::uuid,r.organization_id,r.period_id);data:=data||jsonb_build_object('paymentReference',governance.text_value(input,'reference',3,500),'paymentEvidenceAssetId',input->>'evidenceAssetId','paymentRecordedBy',actor,'paymentRecordedAt',now());r.status:='PAID';
  elsif record_action='RECONCILE' then
   if r.status<>'PAID' or actor=(data->>'paymentRecordedBy')::uuid or not identity.has_permission('FINANCE_APPROVE_FINAL',r.organization_id,r.period_id,r.division_id,r.id) then raise exception 'Independent reconciliation required' using errcode='42501';end if;
   perform management.check_evidence((data->>'paymentEvidenceAssetId')::uuid,r.organization_id,r.period_id);r.status:='RECONCILED';
  else raise exception 'Invalid finance action' using errcode='22023';end if;
 elsif r.kind in ('BUDGET','EVALUATION','RECOVERY_CHECK') and record_action='APPROVE' then
  if r.status not in ('IN_REVIEW','APPEALED') or actor=r.creator_account_id or (r.kind='EVALUATION' and actor=r.subject_account_id) or not identity.has_permission(case when r.kind='BUDGET' then 'FINANCE_APPROVE_FINAL' else management.write_permission(r.kind) end,r.organization_id,r.period_id,r.division_id,r.id) then raise exception 'Independent approval required' using errcode='42501';end if;
  if r.kind='EVALUATION' then perform management.check_evidence((data->>'evidenceAssetId')::uuid,r.organization_id,r.period_id);end if;
  r.status:='APPROVED';r.reviewer_account_id:=actor;
 elsif r.kind='EVALUATION' and record_action='APPEAL' then
  if r.status<>'APPROVED' or actor<>r.subject_account_id or data->>'appealAt' is not null then raise exception 'Subject appeal denied' using errcode='42501';end if;
  data:=data||jsonb_build_object('appealAt',now(),'appealReason',note);r.status:='APPEALED';
 elsif r.kind='HANDOVER' then
  if record_action='ADD_ITEM' then
   if actor<>r.creator_account_id or r.status not in ('DRAFT','REVISION') or not identity.has_permission('HANDOVER_ACCEPT',r.organization_id,r.period_id,r.division_id,r.id) then raise exception 'Outgoing owner required' using errcode='42501';end if;
   perform management.check_evidence((input->>'assetId')::uuid,r.organization_id,r.period_id);
   if exists(select 1 from jsonb_array_elements(data->'items') e where e->>'assetId'=input->>'assetId') then raise exception 'Document already included' using errcode='22023';end if;
   entry:=jsonb_build_object('id',gen_random_uuid(),'title',governance.text_value(input,'title',3,180),'assetId',input->>'assetId','required',true,'acceptedAt',null);data:=jsonb_set(data,'{items}',(data->'items')||jsonb_build_array(entry));
  elsif record_action='ACCEPT_ITEM' then
   if actor<>r.subject_account_id or r.status<>'IN_REVIEW' or not identity.has_permission('HANDOVER_ACCEPT',r.organization_id,r.period_id,r.division_id,r.id) then raise exception 'Successor acceptance required' using errcode='42501';end if;
   select value into entry from jsonb_array_elements(data->'items') where value->>'id'=input->>'itemId';if entry is null or entry->>'acceptedAt' is not null then raise exception 'Pending item required' using errcode='22023';end if;
   perform management.check_evidence((entry->>'assetId')::uuid,r.organization_id,r.period_id);
   select jsonb_agg(case when e->>'id'=input->>'itemId' then e||jsonb_build_object('acceptedAt',now(),'acceptedBy',actor,'note',note) else e end) into items from jsonb_array_elements(data->'items')e;data:=jsonb_set(data,'{items}',items);
  elsif record_action='CLOSE' then
   if actor<>r.subject_account_id or r.status<>'IN_REVIEW' or not identity.has_permission('HANDOVER_ACCEPT',r.organization_id,r.period_id,r.division_id,r.id) or exists(select 1 from jsonb_array_elements(data->'items')e where e->>'acceptedAt' is null) then raise exception 'Successor and accepted items required' using errcode='42501';end if;
   for entry in select value from jsonb_array_elements(data->'items') loop perform management.check_evidence((entry->>'assetId')::uuid,r.organization_id,r.period_id);end loop;r.status:='CLOSED';r.reviewer_account_id:=actor;
  else raise exception 'Invalid handover action' using errcode='22023';end if;
 else raise exception 'Invalid action' using errcode='22023';end if;
 r.version:=r.version+1;update management.records set title=r.title,status=r.status,version=r.version,payload=data,reviewer_account_id=r.reviewer_account_id,updated_at=now() where id=r.id returning * into r;
 insert into management.events(record_id,version,action,actor_account_id,note) values(r.id,r.version,record_action,actor,note);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('MANAGEMENT_'||record_action,'management',r.kind,r.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'version',r.version));
 return management.record_json(r);
exception when invalid_text_representation or datetime_field_overflow then raise exception 'Invalid management input' using errcode='22023';end $$;
revoke all on function management.read_permission(text),management.write_permission(text),management.can_read(management.records),management.record_json(management.records),management.money(jsonb),management.member(uuid,uuid,uuid,uuid),management.check_evidence(uuid,uuid,uuid),public.kpi_management_list(text,text,text,text),public.kpi_management_people(text,text,text),public.kpi_management_create(text,text,text,text,jsonb,uuid),public.kpi_management_action(uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.kpi_management_list(text,text,text,text),public.kpi_management_people(text,text,text),public.kpi_management_create(text,text,text,text,jsonb,uuid),public.kpi_management_action(uuid,integer,text,jsonb) to authenticated;
create function management.notify_event() returns trigger language plpgsql security definer set search_path='' as $$
declare r management.records;recipients uuid[];
begin
 select * into r from management.records where id=new.record_id;
 if r.kind='AI_DRAFT' then return new;end if;
 select coalesce(array_agg(g.account_id),'{}'::uuid[]) into recipients from identity.permission_grants g where g.organization_id=r.organization_id and g.period_id=r.period_id and g.permission=case when r.kind in ('BUDGET','FINANCE') then 'FINANCE_APPROVE_FINAL' else management.write_permission(r.kind) end and (g.division_id is null or g.division_id=r.division_id) and (g.object_id is null or g.object_id=r.id) and governance.grant_valid(g);
 perform notifications.enqueue(recipients||array[r.creator_account_id,r.subject_account_id,r.reviewer_account_id,new.actor_account_id],r.organization_id,r.period_id,r.division_id,r.id,management.read_permission(r.kind),'management:'||new.id,'Catatan diperbarui: '||r.title,case when r.kind in ('BUDGET','FINANCE') then '/portal/keuangan' when r.kind='EVALUATION' then '/portal/evaluasi' when r.kind='HANDOVER' then '/portal/handover' else '/portal/operasi' end);
 return new;
end $$;
revoke all on function management.notify_event() from public,anon,authenticated;
create trigger management_inbox after insert on management.events for each row execute function management.notify_event();
notify pgrst,'reload schema';
commit;
