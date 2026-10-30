begin;
create table identity.super_administrators (
 account_id uuid references identity.accounts(id), organization_id uuid references org.organizations(id),
 approved_reference text not null check(length(trim(approved_reference))>=3),
 starts_at timestamptz not null default now(), expires_at timestamptz, revoked_at timestamptz,
 primary key(account_id,organization_id), check(expires_at is null or expires_at>starts_at)
);
alter table identity.super_administrators enable row level security;
revoke all on identity.super_administrators from public,anon,authenticated;
create function identity.is_super_admin(oid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select identity.is_system_admin() and exists(select 1 from identity.super_administrators s
 where s.account_id=identity.current_account_id() and s.organization_id=oid and s.starts_at<=now()
 and (s.expires_at is null or s.expires_at>now()) and s.revoked_at is null);
$$;
revoke all on function identity.is_super_admin(uuid) from public,anon,authenticated;
create or replace function identity.has_permission_standard(wanted text,target_org uuid,target_period uuid,target_division uuid default null,target_object uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
 select (identity.is_system_admin() and wanted=any(array['SYSTEM_CONFIGURATION_READ','IDENTITY_READ','IDENTITY_MANAGE'])
 and exists(select 1 from org.periods p where p.id=target_period and p.organization_id=target_org and p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on)
 and (target_division is null or exists(select 1 from org.divisions where id=target_division and organization_id=target_org)))
 or exists(select 1 from identity.permission_grants g join governance.access_decisions d on d.id=g.decision_id where g.account_id=identity.current_account_id() and g.permission=wanted and g.organization_id=target_org and g.period_id=target_period
 and (g.division_id is null or g.division_id=target_division) and (g.object_id is null or g.object_id=target_object) and g.starts_at<=now() and g.revoked_at is null and g.expires_at>now() and governance.grant_valid(g)
 and identity.is_active_member(target_org,target_period,g.division_id) and not governance.has_conflict(g.account_id,target_org,target_period,target_object)
 and (target_object is null or governance.classification_rank(d.classification)>=coalesce((select governance.classification_rank(r.classification) from governance.information_resources r where r.id=target_object and r.organization_id=target_org and r.period_id=target_period),1)));
$$;
create or replace function identity.access_context_standard() returns jsonb language sql stable security definer set search_path='' as $$
 select case when base.value is null then null else base.value||jsonb_build_object('policyVersion','002/SOP/KPI/X/2026:1.1','systemAdmin',identity.is_system_admin(),
 'managedScopes',case when identity.is_system_admin() then (select coalesce(jsonb_agg(jsonb_build_object('organizationCode',o.code,'periodCode',p.code,'divisionCode',null)),'[]'::jsonb) from org.organizations o join org.periods p on p.organization_id=o.id where p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on) else '[]'::jsonb end,
 'grants',(select coalesce(jsonb_agg(jsonb_build_object('permission',g.permission,'organizationCode',o.code,'periodCode',p.code,'divisionCode',d.code,'objectId',g.object_id,'expiresAt',g.expires_at)),'[]'::jsonb)
 from identity.permission_grants g join org.organizations o on o.id=g.organization_id join org.periods p on p.id=g.period_id left join org.divisions d on d.id=g.division_id
 where g.account_id=identity.current_account_id() and identity.has_permission(g.permission,g.organization_id,g.period_id,g.division_id,g.object_id))) end
 from(select public.kpi_access_context_base() value) base;
$$;
create function governance.record_readable_standard(item governance.workflow_records,actor uuid) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((actor=item.creator_account_id or (item.kind='OFFBOARD' and actor in ((item.payload->>'subjectAccountId')::uuid,(item.payload->>'successorAccountId')::uuid))
 or (actor in (item.handler_account_id,item.reviewer_account_id) and governance.authorized(actor,case when item.kind='INCIDENT' and actor=item.reviewer_account_id then 'SOP_INCIDENT_APPROVE' when item.kind='INCIDENT' and coalesce((item.payload->>'personnelConcern')::boolean,false) then 'SOP_BPI_REVIEW' when item.kind='INCIDENT' then 'SOP_INCIDENT_HANDLE' else 'SOP_OFFBOARD_VERIFY' end,item.organization_id,item.period_id,item.division_id,item.classification,item.id))
 or (item.kind='ACCESS' and exists(select 1 from governance.access_authorities a where a.account_id=actor and a.organization_id=item.organization_id and a.period_id=item.period_id
 and (a.division_id is null or a.division_id=item.division_id) and item.classification=any(a.classifications) and a.permissions&&(array(select jsonb_array_elements_text(item.payload->'permissions')))
 and a.starts_at<=now() and a.expires_at>now() and a.revoked_at is null and not governance.has_conflict(actor,item.organization_id,item.period_id,(item.payload->>'objectId')::uuid)))
 or (item.kind='CLASSIFICATION' and governance.authorized(actor,case item.payload->>'mode' when 'HOLD' then 'INFORMATION_HOLD' when 'RELEASE' then 'INFORMATION_HOLD_RELEASE' else 'INFORMATION_CLASSIFY' end,item.organization_id,item.period_id,item.division_id,item.classification,(item.payload->>'objectId')::uuid))),false);
$$;
create or replace function management.can_read_standard(r management.records) returns boolean language sql stable security definer set search_path='' as $$
 select identity.has_permission(management.read_permission(r.kind),r.organization_id,r.period_id,r.division_id,r.id)
 and (r.kind<>'AI_DRAFT' or (r.creator_account_id=identity.current_account_id() and not exists(select 1 from jsonb_array_elements_text(coalesce(r.payload->'sources','[]'::jsonb))s where not exists(select 1 from content.managed_items c where c.id=s::uuid and c.kind='KNOWLEDGE' and c.organization_id=r.organization_id and c.period_id=r.period_id and c.status<>'ARCHIVED' and content.can_read(c.kind,r.organization_id,r.period_id,c.division_id,c.id)))));
$$;

revoke all on function identity.has_permission_standard(text,uuid,uuid,uuid,uuid),identity.access_context_standard(),governance.record_readable_standard(governance.workflow_records,uuid),management.can_read_standard(management.records) from public,anon,authenticated,service_role;
create or replace function identity.has_permission(wanted text,target_org uuid,target_period uuid,target_division uuid default null,target_object uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
 select identity.has_permission_standard(wanted,target_org,target_period,target_division,target_object)
 or (identity.is_super_admin(target_org) and wanted=any(array['SYSTEM_CONFIGURATION_READ','IDENTITY_READ','IDENTITY_MANAGE','WORKSPACE_READ','TASK_READ','TASK_CREATE','TASK_SUBMIT','TASK_REVIEW','MEETING_READ','MEETING_MANAGE','FINANCE_READ','FINANCE_MANAGE','FINANCE_APPROVE_FINAL','EVALUATION_READ','EVALUATION_WRITE','KNOWLEDGE_READ','KNOWLEDGE_WRITE','KNOWLEDGE_REVIEW','HANDOVER_READ','HANDOVER_ACCEPT','AI_READ','AI_ACTION_CONFIRM','CONTENT_DRAFT_WRITE','CONTENT_REVIEW','CONTENT_PUBLISH','ASSET_UPLOAD','ASSET_READ','ASSET_DOWNLOAD','ASPIRATION_TRIAGE','CASE_READ','CASE_MANAGE','CASE_REVIEW','NOTIFICATION_READ','NOTIFICATION_TEMPLATE_REVIEW'])
 and exists(select 1 from org.periods p where p.id=target_period and p.organization_id=target_org
 and (wanted like '%\_READ' escape '\' or (p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on)))
 and (target_division is null or exists(select 1 from org.divisions d where d.id=target_division and d.organization_id=target_org))
 and not governance.has_conflict(identity.current_account_id(),target_org,target_period,target_object));
$$;
create or replace function public.kpi_access_context() returns jsonb language sql stable security definer set search_path='' as $$
 select case when b.value is null then null else b.value || jsonb_build_object(
 'superAdmin',exists(select 1 from org.organizations o where identity.is_super_admin(o.id)),
 'superAdminScopes',(select coalesce(jsonb_agg(jsonb_build_object('organizationCode',o.code,'periodCode',p.code,'divisionCode',null,
 'operational',p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on)),'[]'::jsonb)
 from org.organizations o join org.periods p on p.organization_id=o.id where identity.is_super_admin(o.id))) end
 from (select identity.access_context_standard() value) b;
$$;
create or replace function governance.record_readable(item governance.workflow_records,actor uuid) returns boolean language sql stable security definer set search_path='' as $$
 select governance.record_readable_standard(item,actor) or (actor=identity.current_account_id() and identity.has_permission('IDENTITY_READ',item.organization_id,item.period_id,item.division_id,item.id) and identity.is_super_admin(item.organization_id));
$$;
create or replace function management.can_read(r management.records) returns boolean language sql stable security definer set search_path='' as $$
 select management.can_read_standard(r) or (identity.is_super_admin(r.organization_id) and identity.has_permission(management.read_permission(r.kind),r.organization_id,r.period_id,r.division_id,r.id));
$$;
notify pgrst,'reload schema';
commit;
