begin;
create schema if not exists files;
revoke all on schema files from public,anon,authenticated;
create table files.managed_assets (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),division_id uuid references org.divisions(id),
 owner_account_id uuid not null references identity.accounts(id),original_name text not null,mime_type text not null,size_bytes integer not null check(size_bytes between 1 and 4000000),
 sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),object_path text not null unique,request_key uuid not null,
 status text not null default 'UPLOADING' check(status in ('UPLOADING','PENDING_SCAN','AVAILABLE','REJECTED')),created_at timestamptz not null default now(),
 unique(owner_account_id,request_key)
);
alter table files.managed_assets enable row level security;
revoke all on files.managed_assets from public,anon,authenticated;
create policy asset_read on files.managed_assets for select to authenticated using(identity.has_permission('ASSET_DOWNLOAD',organization_id,period_id,division_id,id));
create function files.asset_json(item files.managed_assets) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',item.id,'name',item.original_name,'mimeType',item.mime_type,'sizeBytes',item.size_bytes,'status',item.status,'createdAt',item.created_at,'ownerAccountId',item.owner_account_id);
$$;
revoke all on function files.asset_json(files.managed_assets) from public,anon,authenticated;
create function public.kpi_assets_list(organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('ASSET_DOWNLOAD',oid,pid,did) then raise exception 'Access denied' using errcode='42501';end if;
 return(select coalesce(jsonb_agg(files.asset_json(t) order by t.created_at desc,t.id),'[]'::jsonb) from (select * from files.managed_assets a where a.organization_id=oid and a.period_id=pid
 and (division_code is null or a.division_id=did) and identity.has_permission('ASSET_DOWNLOAD',oid,pid,a.division_id,a.id) order by a.created_at desc,a.id limit 100) t);
end $$;
create function public.kpi_asset_register(organization_code text,period_code text,input jsonb,division_code text default null) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;actor uuid:=identity.current_account_id();key uuid;item files.managed_assets;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('ASSET_UPLOAD',oid,pid,did) or not identity.has_permission('ASSET_DOWNLOAD',oid,pid,did) then raise exception 'Access denied' using errcode='42501';end if;
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
create function public.kpi_asset_download(asset_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare item files.managed_assets;
begin
 select * into item from files.managed_assets where id=asset_id;
 if item.id is null or not identity.has_permission('ASSET_DOWNLOAD',item.organization_id,item.period_id,item.division_id,item.id) then raise exception 'Access denied' using errcode='42501';end if;
 if item.status<>'AVAILABLE' then raise exception 'Asset not cleared for download' using errcode='22023';end if;
 return files.asset_json(item)||jsonb_build_object('objectPath',item.object_path);
end $$;
create function public.kpi_asset_finish(asset_id uuid,content_hash text,scan_result text) returns jsonb language plpgsql security definer set search_path='' as $$
declare item files.managed_assets;
begin
 select * into item from files.managed_assets where id=asset_id for update;
 if item.id is null or item.sha256<>content_hash or scan_result is null or scan_result not in ('PENDING_SCAN','AVAILABLE','REJECTED') then raise exception 'Invalid asset completion' using errcode='22023';end if;
 if item.status='REJECTED' or (item.status='AVAILABLE' and scan_result<>'AVAILABLE') then raise exception 'Asset already finalized' using errcode='40001';end if;
 update files.managed_assets set status=scan_result where id=asset_id returning * into item;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('ASSET_'||scan_result,'files','asset',item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('sha256',content_hash));
 return files.asset_json(item);
end $$;
revoke all on function public.kpi_assets_list(text,text,text),public.kpi_asset_register(text,text,jsonb,text),public.kpi_asset_download(uuid),public.kpi_asset_finish(uuid,text,text) from public,anon,authenticated;
grant execute on function public.kpi_assets_list(text,text,text),public.kpi_asset_register(text,text,jsonb,text),public.kpi_asset_download(uuid) to authenticated;
grant execute on function public.kpi_asset_finish(uuid,text,text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('kpi-private','kpi-private',false,4000000,array['application/pdf','image/jpeg','image/png','text/plain'])
 on conflict(id) do update set public=false,file_size_limit=4000000,allowed_mime_types=excluded.allowed_mime_types;
notify pgrst,'reload schema';
commit;
