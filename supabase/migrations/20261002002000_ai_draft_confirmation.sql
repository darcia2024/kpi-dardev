begin;
create or replace function management.can_read(r management.records) returns boolean language sql stable security definer set search_path='' as $$
 select identity.has_permission(management.read_permission(r.kind),r.organization_id,r.period_id,r.division_id,r.id)
 and (r.kind<>'AI_DRAFT' or (r.creator_account_id=identity.current_account_id() and not exists(select 1 from jsonb_array_elements_text(coalesce(r.payload->'sources','[]'::jsonb))s where not exists(select 1 from content.managed_items c where c.id=s::uuid and c.kind='KNOWLEDGE' and c.organization_id=r.organization_id and c.period_id=r.period_id and c.status<>'ARCHIVED' and content.can_read(c.kind,r.organization_id,r.period_id,c.division_id,c.id)))));
$$;
create function public.kpi_ai_draft_commit(record_id uuid,expected_version integer,confirmation_note text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r management.records;actor uuid:=identity.current_account_id();oid text;pid text;did text;result jsonb;note text;
begin
 select * into r from management.records where id=record_id for update;
 if r.id is null or r.kind<>'AI_DRAFT' or r.creator_account_id<>actor or not management.can_read(r) or not identity.has_permission('AI_ACTION_CONFIRM',r.organization_id,r.period_id,r.division_id,r.id) then raise exception 'AI confirmation denied' using errcode='42501';end if;
 if r.status='COMMITTED' then return management.record_json(r);end if;
 if r.version is distinct from expected_version then raise exception 'Draft changed; refresh first' using errcode='40001';end if;
 if r.status<>'DRAFT' or coalesce((r.payload->>'previewExpiresAt')::timestamptz,'-infinity'::timestamptz)<=now() then raise exception 'Preview expired; review again' using errcode='22023';end if;
 if exists(select 1 from jsonb_array_elements_text(coalesce(r.payload->'sources','[]'::jsonb))s join content.managed_items c on c.id=s::uuid where (r.payload->'sourceVersions'->>c.id::text)::integer is distinct from c.version) then raise exception 'Source version changed' using errcode='40001';end if;
 note:=governance.text_value(jsonb_build_object('note',confirmation_note),'note');
 select code into oid from org.organizations where id=r.organization_id;select code into pid from org.periods where id=r.period_id;select code into did from org.divisions where id=r.division_id;
 if r.payload->>'target'='TASK' then
  result:=public.kpi_task_create(oid,pid,r.title,r.payload->>'description',actor,r.id,null,did);
 elsif r.payload->>'target'='KNOWLEDGE' then
  result:=public.kpi_content_create(oid,pid,'KNOWLEDGE',jsonb_build_object('idempotencyKey',r.id,'fields',jsonb_build_object('title',r.title,'summary',left(r.payload->>'description',500),'body',r.payload->>'description','source','Draf pengguna '||r.id::text,'locale','id','slug','ai-draft-'||r.id::text)),did);
 else raise exception 'Invalid AI target' using errcode='22023';end if;
 update management.records set status='COMMITTED',version=version+1,payload=payload||jsonb_build_object('resultId',result->>'id','confirmedAt',now()),updated_at=now() where id=r.id returning * into r;
 insert into management.events(record_id,version,action,actor_account_id,note) values(r.id,r.version,'COMMIT',actor,note);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('AI_DRAFT_CONFIRMED','management','AI_DRAFT',r.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'resultId',result->>'id'));
 return management.record_json(r);
end $$;
revoke all on function public.kpi_ai_draft_commit(uuid,integer,text) from public,anon,authenticated;
grant execute on function public.kpi_ai_draft_commit(uuid,integer,text) to authenticated;
notify pgrst,'reload schema';
commit;
