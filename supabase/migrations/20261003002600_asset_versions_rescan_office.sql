begin;
alter table files.managed_assets add column root_asset_id uuid references files.managed_assets(id);
alter table files.managed_assets add column revision integer not null default 1;
create unique index asset_revision on files.managed_assets(coalesce(root_asset_id,id),revision);
create or replace function files.asset_json(item files.managed_assets) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',item.id,'name',item.original_name,'mimeType',item.mime_type,'sizeBytes',item.size_bytes,'status',item.status,'createdAt',item.created_at,'ownerAccountId',item.owner_account_id,'rootAssetId',coalesce(item.root_asset_id,item.id),'revision',item.revision);
$$;
create or replace function public.kpi_asset_register(organization_code text,period_code text,input jsonb,division_code text default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;actor uuid:=identity.current_account_id();key uuid;item files.managed_assets;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('ASSET_UPLOAD',oid,pid,did) or not identity.has_permission('ASSET_READ',oid,pid,did) then raise exception 'Access denied' using errcode='42501';end if;
 if coalesce(length(input->>'name'),0) not between 1 and 150 or input->>'name' ~ '[\\/\r\n]' or coalesce((input->>'sizeBytes')::int,0) not between 1 and 4000000
 or input->>'sha256' is null or input->>'sha256' !~ '^[a-f0-9]{64}$' or input->>'mimeType' is null or input->>'mimeType' not in ('application/pdf','image/jpeg','image/png','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation') then raise exception 'Invalid asset metadata' using errcode='22023';end if;
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

alter function public.kpi_asset_register(text,text,jsonb,text) rename to kpi_asset_register_before_versions;
revoke all on function public.kpi_asset_register_before_versions(text,text,jsonb,text) from public,anon,authenticated;
create function public.kpi_asset_register(organization_code text,period_code text,input jsonb,division_code text default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare previous files.managed_assets;item files.managed_assets;result jsonb;root uuid;revision_number integer;previous_id uuid:=nullif(input->>'previousAssetId','')::uuid;
begin
 if previous_id is not null then
  select * into previous from files.managed_assets where id=previous_id;
  if previous.id is null or not identity.has_permission('ASSET_READ',previous.organization_id,previous.period_id,previous.division_id,previous.id) or not identity.has_permission('ASSET_UPLOAD',previous.organization_id,previous.period_id,previous.division_id,previous.id) then raise exception 'Version access denied' using errcode='42501';end if;
  if exists(select 1 from governance.information_resources where id=previous.id and hold_reference is not null) then raise exception 'Evidence hold: create a separate document' using errcode='42501';end if;
  root:=coalesce(previous.root_asset_id,previous.id);perform pg_advisory_xact_lock(hashtextextended('asset-version:'||root::text,0));
 end if;
 result:=public.kpi_asset_register_before_versions(organization_code,period_code,input,division_code);
 select * into item from files.managed_assets where id=(result->>'id')::uuid for update;
 if previous_id is null then
  if item.root_asset_id is not null then raise exception 'Request key conflict' using errcode='40001';end if;
 else
  if item.organization_id<>previous.organization_id or item.period_id<>previous.period_id or item.division_id is distinct from previous.division_id or item.id=previous.id then raise exception 'Version scope mismatch' using errcode='22023';end if;
  if item.root_asset_id is null then
   select coalesce(max(a.revision),1)+1 into revision_number from files.managed_assets a where coalesce(a.root_asset_id,a.id)=root;
   update files.managed_assets set root_asset_id=root,revision=revision_number where id=item.id returning * into item;
   insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('ASSET_VERSION_REGISTERED','files','asset',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',identity.current_account_id(),'revision',revision_number));
  elsif item.root_asset_id<>root then raise exception 'Request key conflict' using errcode='40001';end if;
 end if;
 return files.asset_json(item)||jsonb_build_object('objectPath',item.object_path,'sha256',item.sha256);
end $$;
create function public.kpi_asset_versions(asset_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item files.managed_assets;
begin
 select * into item from files.managed_assets where id=asset_id;
 if item.id is null or not identity.has_permission('ASSET_READ',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(files.asset_json(a) order by a.revision desc),'[]'::jsonb) from files.managed_assets a where coalesce(a.root_asset_id,a.id)=coalesce(item.root_asset_id,item.id) and identity.has_permission('ASSET_READ',a.organization_id,a.period_id,a.division_id,a.id));
end $$;
create function public.kpi_asset_scan_request(asset_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare item files.managed_assets;
begin
 select * into item from files.managed_assets where id=asset_id;
 if item.id is null or not identity.has_permission('ASSET_READ',item.organization_id,item.period_id,item.division_id,item.id) or not identity.has_permission('ASSET_UPLOAD',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 if item.status<>'PENDING_SCAN' then raise exception 'Pending scan required' using errcode='22023';end if;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('ASSET_RESCAN_REQUESTED','files','asset',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',identity.current_account_id()));
 return files.asset_json(item)||jsonb_build_object('objectPath',item.object_path,'sha256',item.sha256);
end $$;
revoke all on function public.kpi_asset_register(text,text,jsonb,text),public.kpi_asset_versions(uuid),public.kpi_asset_scan_request(uuid) from public,anon,authenticated;
grant execute on function public.kpi_asset_register(text,text,jsonb,text),public.kpi_asset_versions(uuid),public.kpi_asset_scan_request(uuid) to authenticated;
update storage.buckets set allowed_mime_types=array['application/pdf','image/jpeg','image/png','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.openxmlformats-officedocument.presentationml.presentation'] where id='kpi-private';
notify pgrst,'reload schema';
commit;
