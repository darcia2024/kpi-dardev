begin;
create function public.kpi_workspace_snapshot(organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;actor uuid:=identity.current_account_id();
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('WORKSPACE_READ',oid,pid,did) then raise exception 'Access denied' using errcode='42501';end if;
 return jsonb_build_object('tasks',(select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'title',t.title,'status',t.status,'dueAt',t.due_at,'ownerAccountId',t.owner_account_id,'canReview',t.status='IN_REVIEW' and actor<>t.owner_account_id and actor<>t.created_by_account_id and identity.has_permission('TASK_REVIEW',oid,pid,t.division_id,t.id)) order by t.due_at nulls last),'[]'::jsonb) from work.tasks t where t.organization_id=oid and t.period_id=pid and (did is null or t.division_id=did) and t.status not in ('DONE','CANCELLED') and identity.has_permission('TASK_READ',oid,pid,t.division_id,t.id)),
 'meetings',(select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'title',m.title,'startsAt',m.starts_at,'status',m.status) order by m.starts_at),'[]'::jsonb) from work.meetings m where m.organization_id=oid and m.period_id=pid and (did is null or m.division_id=did) and m.status<>'ARCHIVED' and m.starts_at>=now()-interval '1 day' and identity.has_permission('MEETING_READ',oid,pid,m.division_id,m.id)),
 'reviews',(select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'kind',r.kind,'title',r.title,'status',r.status)),'[]'::jsonb) from management.records r where r.organization_id=oid and r.period_id=pid and (did is null or r.division_id=did) and r.status in ('IN_REVIEW','CHECKED','APPEALED') and management.can_read(r)),
 'notifications',public.kpi_notifications_list());
end $$;
create function public.kpi_operations_snapshot() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not identity.is_system_admin() then raise exception 'Technical administrator required' using errcode='42501';end if;
 return jsonb_build_object('databaseReady',public.kpi_operations_schema_ready(),'privateStorage',exists(select 1 from storage.buckets where id='kpi-private' and not public),
 'periods',(select coalesce(jsonb_agg(jsonb_build_object('organizationCode',o.code,'code',p.code,'status',p.status,'startsOn',p.starts_on,'endsOn',p.ends_on)),'[]'::jsonb) from org.periods p join org.organizations o on o.id=p.organization_id),
 'modules',jsonb_build_object('tasks',to_regprocedure('public.kpi_task_action(uuid,integer,text,text)') is not null,'meetings',to_regprocedure('public.kpi_meeting_action(uuid,integer,text,jsonb)') is not null,'documents',to_regclass('files.managed_assets') is not null,'content',to_regclass('content.managed_items') is not null,'cases',to_regclass('intake.cases') is not null,'governance',to_regclass('governance.workflow_records') is not null,'management',to_regclass('management.records') is not null,'workspace',to_regprocedure('public.kpi_workspace_snapshot(text,text,text)') is not null,'aiDrafts',to_regclass('management.records') is not null),
 'processors',(select coalesce(jsonb_agg(jsonb_build_object('purpose',purpose,'classifications',classifications,'expiresAt',expires_at)),'[]'::jsonb) from governance.approved_processors where revoked_at is null and approved_at<=now() and expires_at>now()),
 'audit',(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'action',a.action,'module',a.module,'entityType',a.entity_type,'entityId',a.entity_id,'result',a.result,'at',a.occurred_at) order by a.occurred_at desc),'[]'::jsonb) from (select * from audit.audit_events order by occurred_at desc limit 100)a));
end $$;
create function public.kpi_ai_sources(organization_code text,period_code text,division_code text,source_ids uuid[]) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or not identity.has_permission('AI_READ',oid,pid,did) or cardinality(source_ids)>5 then raise exception 'AI access denied' using errcode='42501';end if;
 if exists(select 1 from unnest(source_ids)s where not exists(select 1 from content.managed_items c where c.id=s and c.kind='KNOWLEDGE' and c.organization_id=oid and c.period_id=pid and (did is null or c.division_id=did) and c.status<>'ARCHIVED' and content.can_read(c.kind,oid,pid,c.division_id,c.id))) then raise exception 'Source access denied' using errcode='42501';end if;
 return(select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'title',c.title,'body',c.body,'source',c.source,'version',c.version)),'[]'::jsonb) from content.managed_items c where c.id=any(source_ids));
end $$;
revoke all on function public.kpi_workspace_snapshot(text,text,text),public.kpi_operations_snapshot(),public.kpi_ai_sources(text,text,text,uuid[]) from public,anon,authenticated;
grant execute on function public.kpi_workspace_snapshot(text,text,text),public.kpi_operations_snapshot(),public.kpi_ai_sources(text,text,text,uuid[]) to authenticated;
notify pgrst,'reload schema';
commit;
