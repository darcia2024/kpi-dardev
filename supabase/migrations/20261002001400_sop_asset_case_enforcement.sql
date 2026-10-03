begin;
do $$ declare item record; begin
 for item in select conname,pg_get_constraintdef(oid) definition from pg_constraint where conrelid='identity.permission_grants'::regclass and contype='c' loop
 if item.definition like '%ASSET_DOWNLOAD%' then
 execute format('alter table identity.permission_grants drop constraint %I',item.conname);
 execute format('alter table identity.permission_grants add constraint %I %s',item.conname,replace(item.definition,'''ASSET_DOWNLOAD''','''ASSET_READ'', ''ASSET_DOWNLOAD'''));
 end if;end loop;
end $$;
drop policy asset_read on files.managed_assets;
create policy asset_read on files.managed_assets for select to authenticated using(identity.has_permission('ASSET_READ',organization_id,period_id,division_id,id));
create or replace function public.kpi_assets_list(organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('ASSET_READ',oid,pid,did) then raise exception 'Access denied' using errcode='42501';end if;
 return(select coalesce(jsonb_agg(files.asset_json(t) order by t.created_at desc,t.id),'[]'::jsonb) from (select * from files.managed_assets a where a.organization_id=oid and a.period_id=pid
 and (division_code is null or a.division_id=did) and identity.has_permission('ASSET_READ',oid,pid,a.division_id,a.id) order by a.created_at desc,a.id limit 100) t);
end $$;
create or replace function public.kpi_asset_register(organization_code text,period_code text,input jsonb,division_code text default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;actor uuid:=identity.current_account_id();key uuid;item files.managed_assets;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('ASSET_UPLOAD',oid,pid,did) or not identity.has_permission('ASSET_READ',oid,pid,did) then raise exception 'Access denied' using errcode='42501';end if;
 if coalesce(length(input->>'name'),0) not between 1 and 150 or input->>'name' ~ '[\\/\r\n]' or coalesce((input->>'sizeBytes')::int,0) not between 1 and 4000000
 or input->>'sha256' is null or input->>'sha256' !~ '^[a-f0-9]{64}$' or input->>'mimeType' is null or input->>'mimeType' not in ('application/pdf','image/jpeg','image/png','text/plain') then raise exception 'Invalid asset metadata' using errcode='22023';end if;
 key:=(input->>'idempotencyKey')::uuid;if key is null then raise exception 'Request key required' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||key::text,0));
 select * into item from files.managed_assets where owner_account_id=actor and request_key=key;
 if item.id is not null then
 if item.organization_id<>oid or item.period_id<>pid or item.division_id is distinct from did or item.original_name<>input->>'name' or item.mime_type<>input->>'mimeType' or item.size_bytes<>(input->>'sizeBytes')::int or item.sha256<>input->>'sha256' then raise exception 'Request key already used' using errcode='40001';end if;
 else
 insert into files.managed_assets(organization_id,period_id,division_id,owner_account_id,original_name,mime_type,size_bytes,sha256,request_key,object_path)
 values(oid,pid,did,actor,input->>'name',input->>'mimeType',(input->>'sizeBytes')::int,input->>'sha256',key,oid::text||'/'||pid::text||'/'||actor::text||'/'||gen_random_uuid()::text) returning * into item;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('ASSET_REGISTERED','files','asset',item.id,'SUCCESS',key::text,jsonb_build_object('actorAccountId',actor));
 end if;
 return files.asset_json(item)||jsonb_build_object('objectPath',item.object_path,'sha256',item.sha256);
exception when invalid_text_representation then raise exception 'Invalid asset values' using errcode='22023';
end $$;
create or replace function public.kpi_asset_download(asset_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare item files.managed_assets;
begin
 select * into item from files.managed_assets where id=asset_id;
 if item.id is null or not identity.has_permission('ASSET_DOWNLOAD',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 if item.status<>'AVAILABLE' then raise exception 'Asset not cleared for download' using errcode='22023';end if;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('ASSET_DOWNLOAD_AUTHORIZED','files','asset',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',identity.current_account_id()));
 return files.asset_json(item)||jsonb_build_object('objectPath',item.object_path);
end $$;
create or replace function intake.case_json(item intake.cases) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',item.id,'kind',item.kind,'subject',item.subject,'description',item.description,'contact',item.contact,'status',item.status,'version',item.version,
 'submittedAt',item.submitted_at,'ownerAccountId',item.owner_account_id,
 'canManage',intake.permission('CASE_MANAGE',item),'canReview',intake.permission('CASE_REVIEW',item) and (identity.current_account_id()=item.secretary_account_id) and identity.current_account_id() is distinct from item.owner_account_id,
 'canAssign',intake.permission('CASE_MANAGE',item) and (identity.current_account_id()=item.secretary_account_id),
 'eligibleOwners',case when intake.permission('CASE_MANAGE',item) and (identity.current_account_id()=item.secretary_account_id) then
 (select coalesce(jsonb_agg(jsonb_build_object('accountId',a.id,'name',a.display_name) order by a.display_name,a.id),'[]'::jsonb) from identity.accounts a where a.status='ACTIVE' and a.deactivated_at is null
 and exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id where s.account_id=a.id and s.period_id=item.period_id and p.organization_id=item.organization_id and p.division_id=item.iod_division_id and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date))
 and not exists(select 1 from unnest(array['CASE_READ','CASE_MANAGE']) required(permission) where not exists(select 1 from identity.permission_grants g where g.account_id=a.id and g.permission=required.permission and g.organization_id=item.organization_id and g.period_id=item.period_id and (g.division_id is null or g.division_id=item.iod_division_id) and (g.object_id is null or g.object_id=item.id) and g.starts_at<=now() and g.revoked_at is null and g.expires_at>now() and governance.grant_valid(g) and g.object_id=item.id and exists(select 1 from governance.access_decisions d where d.id=g.decision_id and d.classification='RAHASIA')))) else '[]'::jsonb end,
 'events',(select coalesce(jsonb_agg(jsonb_build_object('action',e.action,'visibility',e.visibility,'note',e.note,'actorName',coalesce(a.display_name,'Pelapor'),'createdAt',e.created_at) order by e.version,e.created_at),'[]'::jsonb)
 from intake.case_events e left join identity.accounts a on a.id=e.actor_account_id where e.case_id=item.id));
$$;
create or replace function public.kpi_case_action(case_id uuid,expected_version integer,command text,input jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare item intake.cases;actor uuid:=identity.current_account_id();target uuid;review boolean;
begin
 select * into item from intake.cases where id=case_id for update;
 if item.id is null or not intake.can_read(item) then raise exception 'Access denied' using errcode='42501';end if;
 if expected_version is null or expected_version<>item.version then raise exception 'Case changed; reload first' using errcode='40001';end if;
 if coalesce(length(trim(input->>'note')),0) not between 3 and 2000 then raise exception 'Action note required' using errcode='22023';end if;
 review:=intake.permission('CASE_REVIEW',item) and (actor=item.secretary_account_id);
 if command in ('APPROVE_CLOSE','REQUEST_REVISION','REOPEN') then
 if not review or actor=item.owner_account_id then raise exception 'Independent case reviewer required' using errcode='42501';end if;
 else if not intake.permission('CASE_MANAGE',item) then raise exception 'Access denied' using errcode='42501';end if;end if;
 if command='ASSIGN' then
 if actor<>item.secretary_account_id then raise exception 'Secretariat assignment required' using errcode='42501';end if;
 if item.status not in ('RECEIVED','TRIAGED','IN_PROGRESS') then raise exception 'Invalid assignment transition' using errcode='22023';end if;
 target:=(input->>'ownerAccountId')::uuid;
 if not exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id join identity.accounts a on a.id=s.account_id where s.account_id=target and s.period_id=item.period_id
 and p.organization_id=item.organization_id and p.division_id=item.iod_division_id and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date) and a.status='ACTIVE' and a.deactivated_at is null)
 or exists(select 1 from unnest(array['CASE_READ','CASE_MANAGE']) required(permission) where not exists(select 1 from identity.permission_grants g where g.account_id=target and g.permission=required.permission and g.organization_id=item.organization_id and g.period_id=item.period_id
 and (g.division_id is null or g.division_id=item.iod_division_id) and (g.object_id is null or g.object_id=item.id) and g.starts_at<=now() and g.revoked_at is null and g.expires_at>now() and governance.grant_valid(g) and g.object_id=item.id and exists(select 1 from governance.access_decisions d where d.id=g.decision_id and d.classification='RAHASIA'))) then raise exception 'Eligible IOD officer required' using errcode='42501';end if;
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
create or replace function public.kpi_operations_schema_ready() returns boolean language sql stable security definer set search_path='' as $$
 select to_regclass('governance.access_decisions') is not null
 and to_regprocedure('public.kpi_access_register()') is not null
 and not has_function_privilege('authenticated','public.kpi_manage_grant(text,uuid,uuid,uuid,text,text,uuid,uuid,timestamptz,uuid)','EXECUTE')
 and to_regclass('work.meetings') is not null
 and to_regclass('content.managed_items') is not null
 and to_regclass('files.managed_assets') is not null
 and to_regclass('notifications.inbox') is not null
 and to_regclass('intake.cases') is not null
 and to_regprocedure('public.kpi_meeting_action(uuid,integer,text,jsonb)') is not null
 and to_regprocedure('public.kpi_content_action(uuid,integer,text,jsonb)') is not null
 and to_regprocedure('public.kpi_case_action(uuid,integer,text,jsonb)') is not null
 and to_regprocedure('public.kpi_publications_list(text,text,text)') is not null
 and to_regprocedure('notifications.case_event()') is not null
 and exists(select 1 from storage.buckets where id='kpi-private' and not public);
$$;
create or replace function public.kpi_intake_ready(organization_code text default 'KPI_PPMI_MESIR') returns boolean language sql stable security definer set search_path='' as $$
 select count(*)=1 from intake.routing r join org.organizations o on o.id=r.organization_id join org.periods p on p.id=r.period_id
 join identity.accounts a on a.id=r.secretary_account_id join org.divisions d on d.id=r.iod_division_id and d.organization_id=r.organization_id
 where o.code=organization_code and r.enabled and p.status='ACTIVE' and current_date between p.starts_on and p.ends_on and a.status='ACTIVE' and a.deactivated_at is null
 and exists(select 1 from org.assignments s join org.positions pos on pos.id=s.position_id where s.account_id=a.id and s.period_id=p.id and pos.organization_id=o.id and s.starts_on<=current_date and (s.ends_on is null or s.ends_on>=current_date))
 and not exists(select 1 from unnest(array['CASE_READ','CASE_MANAGE']) required(permission) where not exists(select 1 from identity.permission_grants g where g.account_id=a.id and g.organization_id=o.id and g.period_id=p.id and g.permission=required.permission and g.division_id is null and g.object_id is null and g.starts_at<=now() and g.revoked_at is null and g.expires_at>now() and governance.grant_valid(g)));
$$;
create table governance.approved_processors(
 id uuid primary key default gen_random_uuid(),purpose text not null check(purpose in ('FILE_SCAN','AI','TRANSCRIPTION')),endpoint text not null check(endpoint like 'https://%'),
 classifications text[] not null check(cardinality(classifications)>0 and classifications<@array['TERBUKA','INTERNAL','TERBATAS','RAHASIA']),
 decision_reference text not null check(length(trim(decision_reference))>=3),assessment_reference text not null check(length(trim(assessment_reference))>=3),
 approved_at timestamptz not null,expires_at timestamptz not null,revoked_at timestamptz,check(expires_at>approved_at)
);
alter table governance.approved_processors enable row level security;
revoke all on governance.approved_processors from public,anon,authenticated;
create function public.kpi_processor_approved(processor_purpose text,processor_endpoint text,information_classification text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from governance.approved_processors where purpose=processor_purpose and endpoint=processor_endpoint and information_classification=any(classifications) and approved_at<=now() and expires_at>now() and revoked_at is null);
$$;
revoke all on function public.kpi_processor_approved(text,text,text) from public,anon,authenticated;
grant execute on function public.kpi_processor_approved(text,text,text) to service_role;
create function governance.record_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
 values('SOP_'||tg_op,'governance',tg_table_name,new.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',identity.current_account_id(),'source','database_change'));
 return new;
end $$;
revoke all on function governance.record_change() from public,anon,authenticated;
create trigger access_authority_audit after insert or update on governance.access_authorities for each row execute function governance.record_change();
create trigger access_decision_audit after insert or update on governance.access_decisions for each row execute function governance.record_change();
create trigger conflict_audit after insert or update on governance.conflicts for each row execute function governance.record_change();
create trigger resource_audit after insert or update on governance.information_resources for each row execute function governance.record_change();
create trigger processor_audit after insert or update on governance.approved_processors for each row execute function governance.record_change();
notify pgrst,'reload schema';
commit;
