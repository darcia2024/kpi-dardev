begin;
create schema if not exists governance;
revoke all on schema governance from public,anon,authenticated;
create function governance.classification_rank(value text) returns integer language sql immutable set search_path='' as $$
 select case value when 'TERBUKA' then 0 when 'INTERNAL' then 1 when 'TERBATAS' then 2 when 'RAHASIA' then 3 else 4 end;
$$;
create table governance.access_authorities(
 id uuid primary key default gen_random_uuid(),account_id uuid not null references identity.accounts(id),organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),division_id uuid references org.divisions(id),
 classifications text[] not null check(cardinality(classifications)>0 and classifications<@array['INTERNAL','TERBATAS','RAHASIA']),
 permissions text[] not null check(cardinality(permissions)>0),mandate_reference text not null check(length(trim(mandate_reference)) between 3 and 500),
 starts_at timestamptz not null,expires_at timestamptz not null,revoked_at timestamptz,check(expires_at>starts_at)
);
create table governance.access_decisions(
 id uuid primary key default gen_random_uuid(),authority_id uuid not null references governance.access_authorities(id),recipient_account_id uuid not null references identity.accounts(id),
 organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),division_id uuid references org.divisions(id),object_id uuid,
 permission text not null,classification text not null check(classification in ('INTERNAL','TERBATAS','RAHASIA')),
 form_reference text not null check(length(trim(form_reference)) between 3 and 150),mandate_reference text not null check(length(trim(mandate_reference)) between 3 and 500),
 purpose text not null check(length(trim(purpose)) between 3 and 2000),information_scope text not null check(length(trim(information_scope)) between 3 and 2000),
 decision_reference text not null check(length(trim(decision_reference)) between 3 and 500),approved_by_account_id uuid not null references identity.accounts(id),approved_at timestamptz not null default now(),
 starts_at timestamptz not null,expires_at timestamptz not null,review_due_at timestamptz not null,
 implemented_by_account_id uuid references identity.accounts(id),implemented_at timestamptz,revoked_at timestamptz,suspended_at timestamptz,
 check(expires_at>starts_at),check(classification<>'RAHASIA' or object_id is not null)
);
create table governance.conflicts(
 id uuid primary key default gen_random_uuid(),account_id uuid not null references identity.accounts(id),organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),object_id uuid,
 reference text not null check(length(trim(reference)) between 3 and 500),starts_at timestamptz not null default now(),ends_at timestamptz,revoked_at timestamptz
);
create table governance.information_resources(
 id uuid primary key,organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),kind text not null,
 classification text not null default 'RAHASIA' check(classification in ('TERBUKA','INTERNAL','TERBATAS','RAHASIA')),
 hold_reference text,classification_reference text
);
alter table identity.permission_grants add column decision_id uuid references governance.access_decisions(id);
create unique index grants_decision_unique on identity.permission_grants(decision_id) where decision_id is not null;
alter table governance.access_authorities enable row level security;
alter table governance.access_decisions enable row level security;
alter table governance.conflicts enable row level security;
alter table governance.information_resources enable row level security;
revoke all on governance.access_authorities,governance.access_decisions,governance.conflicts,governance.information_resources from public,anon,authenticated;
create function governance.has_conflict(actor uuid,oid uuid,pid uuid,entity uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from governance.conflicts c where c.account_id=actor and c.organization_id=oid and c.period_id=pid and (c.object_id is null or c.object_id=entity) and c.starts_at<=now() and c.revoked_at is null and (c.ends_at is null or c.ends_at>now()));
$$;
create function governance.grant_valid(g identity.permission_grants) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from governance.access_decisions d join governance.access_authorities a on a.id=d.authority_id
 where d.id=g.decision_id and d.recipient_account_id=g.account_id and d.organization_id=g.organization_id and d.period_id=g.period_id and d.division_id is not distinct from g.division_id
 and d.object_id is not distinct from g.object_id and d.permission=g.permission and d.implemented_at is not null and d.revoked_at is null and d.suspended_at is null
 and d.starts_at<=now() and d.expires_at>now() and g.starts_at>=d.starts_at and g.expires_at is not null and g.expires_at<=d.expires_at
 and d.approved_by_account_id<>d.recipient_account_id and not governance.has_conflict(d.approved_by_account_id,d.organization_id,d.period_id,d.object_id)
 and a.account_id=d.approved_by_account_id and a.organization_id=d.organization_id and a.period_id=d.period_id and (a.division_id is null or a.division_id=d.division_id)
 and d.classification=any(a.classifications) and d.permission=any(a.permissions) and a.revoked_at is null and a.starts_at<=d.approved_at and a.expires_at>=d.expires_at
 and not governance.has_conflict(g.account_id,g.organization_id,g.period_id,g.object_id));
$$;
create or replace function identity.has_permission(wanted text,target_org uuid,target_period uuid,target_division uuid default null,target_object uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
 select (identity.is_system_admin() and wanted=any(array['SYSTEM_CONFIGURATION_READ','IDENTITY_READ','IDENTITY_MANAGE'])
 and (target_division is null or exists(select 1 from org.divisions where id=target_division and organization_id=target_org))
 and exists(select 1 from org.periods p where p.id=target_period and p.organization_id=target_org and p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on))
 or exists(select 1 from identity.permission_grants g join governance.access_decisions d on d.id=g.decision_id
 where g.account_id=identity.current_account_id() and g.permission=wanted and g.organization_id=target_org and g.period_id=target_period
 and (g.division_id is null or g.division_id=target_division) and (g.object_id is null or g.object_id=target_object)
 and g.starts_at<=now() and g.revoked_at is null and (g.expires_at is not null and g.expires_at>now()) and governance.grant_valid(g)
 and identity.is_active_member(target_org,target_period,g.division_id)
 and not governance.has_conflict(g.account_id,target_org,target_period,target_object)
 and (target_object is null or governance.classification_rank(d.classification)>=coalesce((select governance.classification_rank(r.classification) from governance.information_resources r where r.id=target_object and r.organization_id=target_org and r.period_id=target_period),1)));
$$;
create function public.kpi_record_access_decision(input jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();authority governance.access_authorities;recipient uuid;oid uuid;pid uuid;did uuid;entity uuid;class text;permission text;starts timestamptz;expiry timestamptz;result uuid;
begin
 select * into authority from governance.access_authorities where id=(input->>'authorityId')::uuid for share;
 recipient:=(input->>'recipientAccountId')::uuid;oid:=(input->>'organizationId')::uuid;pid:=(input->>'periodId')::uuid;did:=(input->>'divisionId')::uuid;entity:=(input->>'objectId')::uuid;
 class:=input->>'classification';permission:=input->>'permission';starts:=(input->>'startsAt')::timestamptz;expiry:=(input->>'expiresAt')::timestamptz;
 if actor is null or authority.id is null or authority.account_id<>actor or authority.revoked_at is not null or authority.starts_at>now() or authority.expires_at<=now()
 or recipient is null or recipient=actor or authority.organization_id<>oid or authority.period_id<>pid or (authority.division_id is not null and authority.division_id is distinct from did)
 or class is null or not class=any(authority.classifications) or permission is null or not permission=any(authority.permissions)
 or starts is null or expiry is null or expiry<=greatest(starts,now()) or expiry>authority.expires_at or governance.has_conflict(actor,oid,pid,entity)
 or not exists(select 1 from identity.accounts where id=recipient and status='ACTIVE' and deactivated_at is null)
 or not exists(select 1 from org.periods where id=pid and organization_id=oid)
 or (did is not null and not exists(select 1 from org.divisions where id=did and organization_id=oid)) then raise exception 'Authorized independent access decision required' using errcode='42501';end if;
 if class='RAHASIA' and entity is null then raise exception 'Secret access requires an identified information object' using errcode='22023';end if;
 if entity is not null and not exists(select 1 from governance.information_resources r where r.id=entity and r.organization_id=oid and r.period_id=pid and governance.classification_rank(class)>=governance.classification_rank(r.classification)) then raise exception 'Information scope or classification invalid' using errcode='22023';end if;
 insert into governance.access_decisions(authority_id,recipient_account_id,organization_id,period_id,division_id,object_id,permission,classification,form_reference,mandate_reference,purpose,information_scope,decision_reference,approved_by_account_id,starts_at,expires_at,review_due_at)
 values(authority.id,recipient,oid,pid,did,entity,permission,class,trim(input->>'formReference'),trim(input->>'mandateReference'),trim(input->>'purpose'),trim(input->>'informationScope'),trim(input->>'decisionReference'),actor,starts,expiry,least(expiry,now()+interval '3 months')) returning id into result;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('SOP_ACCESS_DECISION_RECORDED','governance','access_decision',result,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'recipientAccountId',recipient,'sop','002/SOP/KPI/X/2026 v1.1'));
 return result;
exception when invalid_text_representation or datetime_field_overflow or not_null_violation or check_violation then raise exception 'Invalid access decision input' using errcode='22023';
end $$;
create function public.kpi_apply_access_decision(decision_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();item governance.access_decisions;authority governance.access_authorities;result uuid;
begin
 select * into item from governance.access_decisions where id=decision_id for update;
 if actor is null or not identity.is_system_admin() or item.id is null or item.recipient_account_id=actor or item.revoked_at is not null or item.suspended_at is not null or item.expires_at<=now() then raise exception 'Technical implementation not authorized' using errcode='42501';end if;
 select * into authority from governance.access_authorities where id=item.authority_id for share;
 if authority.id is null or authority.revoked_at is not null or authority.expires_at<item.expires_at or governance.has_conflict(item.approved_by_account_id,item.organization_id,item.period_id,item.object_id)
 or not exists(select 1 from identity.accounts where id=item.recipient_account_id and status='ACTIVE' and deactivated_at is null)
 or governance.has_conflict(actor,item.organization_id,item.period_id,item.object_id)
 or not exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id where s.account_id=item.recipient_account_id and s.period_id=item.period_id and p.organization_id=item.organization_id and (item.division_id is null or p.division_id=item.division_id) and s.starts_on<=item.starts_at::date and (s.ends_on is null or s.ends_on>=item.expires_at::date)) then raise exception 'Approved mandate or assignment missing' using errcode='42501';end if;
 select id into result from identity.permission_grants where identity.permission_grants.decision_id=item.id;
 if result is not null then
 if exists(select 1 from identity.permission_grants where id=result and revoked_at is not null) then raise exception 'Revoked access requires a new decision' using errcode='42501';end if;
 return result;end if;
 update governance.access_decisions set implemented_by_account_id=actor,implemented_at=now() where id=item.id;
 insert into identity.permission_grants(account_id,organization_id,period_id,division_id,object_id,permission,starts_at,expires_at,granted_by_account_id,reason,decision_id)
 values(item.recipient_account_id,item.organization_id,item.period_id,item.division_id,item.object_id,item.permission,item.starts_at,item.expires_at,actor,item.purpose,item.id) returning id into result;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('SOP_ACCESS_IMPLEMENTED','governance','permission_grant',result,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'decisionId',item.id));
 return result;
end $$;
-- Legacy grant issuance lacks the F01 decision/register fields required by the active SOP.
revoke all on function public.kpi_manage_grant(text,uuid,uuid,uuid,text,text,uuid,uuid,timestamptz,uuid) from authenticated;
create or replace function public.kpi_access_context() returns jsonb language sql stable security definer set search_path='' as $$
 select case when base.value is null then null else base.value||jsonb_build_object('policyVersion','002/SOP/KPI/X/2026:1.1','systemAdmin',identity.is_system_admin(),
 'managedScopes',case when identity.is_system_admin() then (select coalesce(jsonb_agg(jsonb_build_object('organizationCode',o.code,'periodCode',p.code,'divisionCode',null)),'[]'::jsonb) from org.organizations o join org.periods p on p.organization_id=o.id where p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on) else '[]'::jsonb end,
 'grants',(select coalesce(jsonb_agg(jsonb_build_object('permission',g.permission,'organizationCode',o.code,'periodCode',p.code,'divisionCode',d.code,'objectId',g.object_id,'expiresAt',g.expires_at)),'[]'::jsonb)
 from identity.permission_grants g join org.organizations o on o.id=g.organization_id join org.periods p on p.id=g.period_id left join org.divisions d on d.id=g.division_id
 where g.account_id=identity.current_account_id() and identity.has_permission(g.permission,g.organization_id,g.period_id,g.division_id,g.object_id))) end
 from(select public.kpi_access_context_base() value) base;
$$;
create or replace function intake.permission(wanted text,item intake.cases) returns boolean language sql stable security definer set search_path='' as $$
 select identity.has_permission(wanted,item.organization_id,item.period_id,item.iod_division_id,item.id);
$$;
create or replace function intake.can_read(item intake.cases) returns boolean language sql stable security definer set search_path='' as $$
 select intake.permission('CASE_READ',item) and (identity.current_account_id()=item.secretary_account_id
 or exists(select 1 from intake.case_personnel where case_id=item.id and account_id=identity.current_account_id() and active)
 or exists(select 1 from identity.permission_grants g where g.account_id=identity.current_account_id() and g.permission='CASE_READ' and g.object_id=item.id and governance.grant_valid(g)));
$$;
insert into governance.information_resources(id,organization_id,period_id,kind,classification) select id,organization_id,period_id,'CASE','RAHASIA' from intake.cases;
insert into governance.information_resources(id,organization_id,period_id,kind,classification) select id,organization_id,period_id,'ASSET','RAHASIA' from files.managed_assets;
create function governance.case_resource() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into governance.information_resources(id,organization_id,period_id,kind,classification) values(new.id,new.organization_id,new.period_id,'CASE','RAHASIA');return new;end $$;
create trigger case_classification after insert on intake.cases for each row execute function governance.case_resource();
create function governance.asset_resource() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into governance.information_resources(id,organization_id,period_id,kind,classification) values(new.id,new.organization_id,new.period_id,'ASSET','RAHASIA');return new;end $$;
create trigger asset_classification after insert on files.managed_assets for each row execute function governance.asset_resource();
create function public.kpi_access_register() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();
begin
 if actor is null then raise exception 'Access denied' using errcode='42501';end if;
 return(select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'permission',d.permission,'classification',d.classification,'formReference',d.form_reference,'decisionReference',d.decision_reference,'mandateReference',d.mandate_reference,'informationScope',d.information_scope,'startsAt',d.starts_at,'expiresAt',d.expires_at,'reviewDueAt',d.review_due_at,'approvedAt',d.approved_at,'implementedAt',d.implemented_at,'status',case when d.revoked_at is not null then 'REVOKED' when d.suspended_at is not null then 'SUSPENDED' when d.expires_at<=now() then 'EXPIRED' when d.implemented_at is null then 'APPROVED' else 'IMPLEMENTED' end) order by d.approved_at desc),'[]'::jsonb)
 from governance.access_decisions d where d.recipient_account_id=actor or d.approved_by_account_id=actor or d.implemented_by_account_id=actor);
end $$;
revoke all on function governance.classification_rank(text),governance.has_conflict(uuid,uuid,uuid,uuid),governance.grant_valid(identity.permission_grants),governance.case_resource(),governance.asset_resource(),public.kpi_record_access_decision(jsonb),public.kpi_apply_access_decision(uuid),public.kpi_access_register() from public,anon,authenticated;
grant execute on function public.kpi_record_access_decision(jsonb),public.kpi_apply_access_decision(uuid),public.kpi_access_register() to authenticated;
insert into audit.audit_events(action,module,entity_type,result,request_id,metadata) values('SOP_POLICY_APPLIED','governance','policy','SUCCESS','migration:20261002001300',jsonb_build_object('document','002/SOP/KPI/X/2026','version','1.1','change','Technical administration separated from access to information'));
notify pgrst,'reload schema';
commit;
