begin;
create table files.module_attachments (
 id uuid primary key default gen_random_uuid(),module text not null check(module in ('MEETING','CONTENT','CASE')),
 entity_id uuid not null,asset_id uuid not null references files.managed_assets(id),
 created_by_account_id uuid not null references identity.accounts(id),created_at timestamptz not null default now(),
 removed_at timestamptz,removed_by_account_id uuid references identity.accounts(id)
);
create unique index module_active_asset on files.module_attachments(module,entity_id,asset_id) where removed_at is null;
alter table files.module_attachments enable row level security;
revoke all on files.module_attachments from public,anon,authenticated;
create function files.module_context(module text,entity uuid,write_access boolean default false) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare m work.meetings;c content.managed_items;k intake.cases;oid uuid;pid uuid;did uuid;version integer;editable boolean;allowed boolean;
begin
 if module='MEETING' then
  select * into m from work.meetings where id=entity;oid:=m.organization_id;pid:=m.period_id;did:=m.division_id;version:=m.version;editable:=m.status in ('DRAFT','REVISION');
  allowed:=identity.has_permission('MEETING_READ',oid,pid,did,entity) and (not write_access or identity.has_permission('MEETING_MANAGE',oid,pid,did,entity));
 elsif module='CONTENT' then
  select * into c from content.managed_items where id=entity;oid:=c.organization_id;pid:=c.period_id;did:=c.division_id;version:=c.version;editable:=c.status in ('DRAFT','REVISION');
  allowed:=content.can_read(c.kind,oid,pid,did,entity) and (not write_access or identity.has_permission(case when c.kind='KNOWLEDGE' then 'KNOWLEDGE_WRITE' else 'CONTENT_DRAFT_WRITE' end,oid,pid,did,entity));
 elsif module='CASE' then
  select * into k from intake.cases where id=entity;oid:=k.organization_id;pid:=k.period_id;did:=k.iod_division_id;version:=k.version;editable:=k.status in ('RECEIVED','TRIAGED','IN_PROGRESS');
  allowed:=intake.can_read(k) and (not write_access or intake.permission('CASE_MANAGE',k));
 end if;
 if oid is null or coalesce(allowed,false)=false or (write_access and not editable) then raise exception 'Access denied or finalized' using errcode='42501';end if;
 return jsonb_build_object('organizationId',oid,'periodId',pid,'divisionId',did,'version',version,'classification',coalesce((select classification from governance.information_resources where id=entity),'INTERNAL'));
end $$;
create function public.kpi_module_attachments(module text,entity_id uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;
begin
 ctx:=files.module_context(module,entity_id);
 return (select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'assetId',f.id,'name',f.original_name,'mimeType',f.mime_type,'createdAt',a.created_at) order by a.created_at),'[]'::jsonb)
 from files.module_attachments a join files.managed_assets f on f.id=a.asset_id where a.module=module and a.entity_id=entity_id and a.removed_at is null
 and f.status='AVAILABLE' and identity.has_permission('ASSET_READ',f.organization_id,f.period_id,f.division_id,f.id));
end $$;
create function public.kpi_module_attachment_action(module text,entity_id uuid,expected_version integer,command text,asset_id uuid,note text) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;f files.managed_assets;actor uuid:=identity.current_account_id();next_version integer;item content.managed_items;
begin
 if module='MEETING' then perform 1 from work.meetings where id=entity_id for update;
 elsif module='CONTENT' then perform 1 from content.managed_items where id=entity_id for update;
 elsif module='CASE' then perform 1 from intake.cases where id=entity_id for update;end if;
 ctx:=files.module_context(module,entity_id,true);
 if expected_version is null or (ctx->>'version')::integer<>expected_version then raise exception 'Record changed' using errcode='40001';end if;
 if length(trim(note)) not between 3 and 2000 or note is null or command not in ('ATTACH','REMOVE') or command is null then raise exception 'Invalid attachment input' using errcode='22023';end if;
 select * into f from files.managed_assets where id=asset_id;
 if f.id is null or f.status<>'AVAILABLE' or f.organization_id<>(ctx->>'organizationId')::uuid or f.period_id<>(ctx->>'periodId')::uuid
 or not identity.has_permission('ASSET_READ',f.organization_id,f.period_id,f.division_id,f.id) then raise exception 'Asset access denied' using errcode='42501';end if;
 if command='ATTACH' then
  if coalesce((select governance.classification_rank(classification) from governance.information_resources where id=f.id),4)>governance.classification_rank(ctx->>'classification') then raise exception 'Classify target at the appropriate level before attaching' using errcode='42501';end if;
  insert into files.module_attachments(module,entity_id,asset_id,created_by_account_id) values(module,entity_id,asset_id,actor) on conflict do nothing;
 else
  if exists(select 1 from governance.information_resources where id in (entity_id,asset_id) and hold_reference is not null) then raise exception 'Evidence hold prevents removal' using errcode='42501';end if;
  update files.module_attachments a set removed_at=now(),removed_by_account_id=actor where a.module=module and a.entity_id=entity_id and a.asset_id=asset_id and a.removed_at is null;
  if not found then raise exception 'Attachment not found' using errcode='22023';end if;
 end if;
 if module='MEETING' then
  update work.meetings set version=version+1,updated_at=now() where id=entity_id returning version into next_version;
  insert into work.meeting_events(meeting_id,actor_account_id,action,note,version) values(entity_id,actor,command||'_ASSET',trim(note),next_version);
 elsif module='CASE' then
  update intake.cases set version=version+1,updated_at=now() where id=entity_id returning version into next_version;
  insert into intake.case_events(case_id,actor_account_id,action,note,visibility,version) values(entity_id,actor,command||'_EVIDENCE',trim(note),'INTERNAL',next_version);
 else
  update content.managed_items set version=version+1,updated_at=now(),author_account_id=actor where id=entity_id returning * into item;next_version:=item.version;
  insert into content.managed_revisions(item_id,version,snapshot,actor_account_id,action,note) values(entity_id,next_version,jsonb_build_object('fields',jsonb_build_object('title',item.title,'summary',item.summary,'body',item.body,'source',item.source,'locale',item.locale,'slug',item.slug),'status',item.status,'attachments',(select coalesce(jsonb_agg(a.asset_id),'[]'::jsonb) from files.module_attachments a where a.module=module and a.entity_id=entity_id and a.removed_at is null)),actor,command||'_ASSET',trim(note));
 end if;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values(command||'_ASSET','files',module,entity_id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'assetId',asset_id,'version',next_version));
 return jsonb_build_object('version',next_version,'attachments',public.kpi_module_attachments(module,entity_id));
end $$;

create table work.meeting_followups(meeting_id uuid not null references work.meetings(id),task_id uuid not null references work.tasks(id),request_key uuid not null unique,created_by_account_id uuid not null references identity.accounts(id),created_at timestamptz not null default now());
alter table work.meeting_followups enable row level security;
revoke all on work.meeting_followups from public,anon,authenticated;
create function public.kpi_meeting_followups(meeting_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare ctx jsonb;
begin ctx:=files.module_context('MEETING',meeting_id);return (select coalesce(jsonb_agg(work.task_json(t) order by f.created_at),'[]'::jsonb) from work.meeting_followups f join work.tasks t on t.id=f.task_id where f.meeting_id=meeting_id and identity.has_permission('TASK_READ',t.organization_id,t.period_id,t.division_id,t.id));end $$;
create function public.kpi_meeting_followup_create(meeting_id uuid,expected_version integer,input jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare m work.meetings;actor uuid:=identity.current_account_id();key uuid;existing work.meeting_followups;task jsonb;orgcode text;periodcode text;divcode text;
begin
 select * into m from work.meetings where id=meeting_id for update;
 if m.id is null or not identity.has_permission('MEETING_READ',m.organization_id,m.period_id,m.division_id,m.id) or not identity.has_permission('MEETING_MANAGE',m.organization_id,m.period_id,m.division_id,m.id) then raise exception 'Access denied' using errcode='42501';end if;
 key:=(input->>'requestKey')::uuid;if key is null then raise exception 'Request key required' using errcode='22023';end if;
 select * into existing from work.meeting_followups where request_key=key;
 if existing.task_id is not null then
  if existing.meeting_id<>m.id or existing.created_by_account_id<>actor then raise exception 'Key conflict' using errcode='40001';end if;
  task:=public.kpi_task_detail(existing.task_id);
  if task->>'title' is distinct from trim(input->>'title') or task->>'description' is distinct from trim(input->>'description') or nullif(task->>'dueAt','')::timestamptz is distinct from nullif(input->>'dueAt','')::timestamptz then raise exception 'Key conflict' using errcode='40001';end if;
  return task;
 end if;
 if m.version<>expected_version or expected_version is null then raise exception 'Meeting changed' using errcode='40001';end if;
 if m.status<>'FINAL' then raise exception 'Approved minutes required' using errcode='22023';end if;
 if exists(select 1 from governance.information_resources where id=m.id and classification in ('TERBATAS','RAHASIA')) then raise exception 'Restricted followup requires separate object access' using errcode='42501';end if;
 if input->>'note' is null or length(trim(input->>'note')) not between 3 and 2000 then raise exception 'Note required' using errcode='22023';end if;
 select code into orgcode from org.organizations where id=m.organization_id;select code into periodcode from org.periods where id=m.period_id;select code into divcode from org.divisions where id=m.division_id;
 task:=public.kpi_task_create(orgcode,periodcode,input->>'title',input->>'description',actor,key,nullif(input->>'dueAt','')::timestamptz,divcode);
 insert into work.meeting_followups values(m.id,(task->>'id')::uuid,key,actor,now());
 update work.meetings set version=version+1,updated_at=now() where id=m.id returning * into m;
 insert into work.meeting_events(meeting_id,actor_account_id,action,note,version) values(m.id,actor,'CREATE_FOLLOWUP',trim(input->>'note'),m.version);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('MEETING_FOLLOWUP_CREATED','work','meeting',m.id,'SUCCESS',key::text,jsonb_build_object('actorAccountId',actor,'taskId',task->>'id'));
 return task;
end $$;
revoke all on function files.module_context(text,uuid,boolean),public.kpi_module_attachments(text,uuid),public.kpi_module_attachment_action(text,uuid,integer,text,uuid,text),public.kpi_meeting_followups(uuid),public.kpi_meeting_followup_create(uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.kpi_module_attachments(text,uuid),public.kpi_module_attachment_action(text,uuid,integer,text,uuid,text),public.kpi_meeting_followups(uuid),public.kpi_meeting_followup_create(uuid,integer,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
