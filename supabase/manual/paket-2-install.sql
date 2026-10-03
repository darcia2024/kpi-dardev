-- Package 2 installation. Run once after the platform foundation migration.
BEGIN;
create schema if not exists identity;
revoke all on schema identity from public;

create table if not exists identity.accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text not null,
  status text not null check (status in ('INVITED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  created_at timestamptz not null default now(),
  deactivated_at timestamptz,
  constraint accounts_email_lowercase check (email = lower(email))
);

create table if not exists identity.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  is_system_role boolean not null default false,
  created_at timestamptz not null default now(),
  constraint roles_code_format check (code ~ '^[A-Z][A-Z0-9_]{1,63}$')
);

create table if not exists identity.account_roles (
  account_id uuid not null references identity.accounts(id),
  role_id uuid not null references identity.roles(id),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  granted_by_account_id uuid references identity.accounts(id),
  primary key (account_id, role_id, starts_at),
  constraint account_roles_date_range check (ends_at is null or ends_at > starts_at)
);

create table if not exists org.positions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references org.organizations(id),
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, code)
);

create table if not exists org.assignments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references identity.accounts(id),
  position_id uuid not null references org.positions(id),
  period_id uuid not null references org.periods(id),
  starts_on date not null,
  ends_on date,
  created_at timestamptz not null default now(),
  constraint assignments_date_range check (ends_on is null or ends_on >= starts_on)
);

alter table identity.accounts enable row level security;
alter table identity.roles enable row level security;
alter table identity.account_roles enable row level security;
alter table org.positions enable row level security;
alter table org.assignments enable row level security;

revoke all on all tables in schema identity from public;
alter default privileges in schema identity revoke all on tables from public;

create table if not exists org.divisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references org.organizations(id),
  code text not null,
  name text not null,
  created_at timestamptz not null default now(),
  constraint divisions_code_format check (code ~ '^[A-Z][A-Z0-9_]{1,39}$'),
  constraint divisions_code_per_organization unique (organization_id, code),
  constraint divisions_id_organization unique (id, organization_id)
);

alter table org.positions add column if not exists division_id uuid references org.divisions(id);
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='positions_division_same_organization' AND conrelid='org.positions'::regclass) THEN alter table org.positions add constraint positions_division_same_organization
  foreign key (division_id, organization_id) references org.divisions(id, organization_id); END IF; END $$;
create index if not exists positions_division_id_idx on org.positions (division_id);
alter table org.divisions enable row level security;
revoke all on org.divisions from public;



alter table identity.accounts add column auth_user_id uuid unique references auth.users(id) on delete set null;
create index assignments_account_period_idx on org.assignments(account_id, period_id);

create table identity.permission_grants (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references identity.accounts(id),
  organization_id uuid not null references org.organizations(id),
  period_id uuid not null references org.periods(id),
  division_id uuid references org.divisions(id),
  object_id uuid,
  permission text not null check (permission in (
    'SYSTEM_CONFIGURATION_READ','IDENTITY_READ','IDENTITY_MANAGE','WORKSPACE_READ',
    'TASK_READ','TASK_CREATE','TASK_SUBMIT','TASK_REVIEW','MEETING_READ','MEETING_MANAGE',
    'FINANCE_READ','FINANCE_MANAGE','FINANCE_APPROVE_FINAL','EVALUATION_READ','EVALUATION_WRITE',
    'KNOWLEDGE_READ','KNOWLEDGE_WRITE','KNOWLEDGE_REVIEW','HANDOVER_READ','HANDOVER_ACCEPT',
    'AI_READ','AI_ACTION_CONFIRM','CONTENT_DRAFT_WRITE','CONTENT_REVIEW','CONTENT_PUBLISH',
    'ASSET_UPLOAD','ASSET_DOWNLOAD','ASPIRATION_TRIAGE','NOTIFICATION_READ','NOTIFICATION_TEMPLATE_REVIEW'
  )),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  granted_by_account_id uuid references identity.accounts(id),
  reason text not null check (length(trim(reason)) >= 3),
  check (expires_at is null or expires_at > starts_at)
);
create index permission_grants_account_idx on identity.permission_grants(account_id, organization_id, period_id);
alter table identity.permission_grants enable row level security;

create function identity.validate_scope_links() returns trigger
language plpgsql set search_path = '' as $$
declare scope_org uuid;
begin
  select organization_id into scope_org from org.periods where id = new.period_id;
  if tg_table_name = 'assignments' then
    if not exists(select 1 from org.positions where id = new.position_id and organization_id = scope_org) then
      raise exception 'Assignment organization mismatch';
    end if;
  else
    if new.organization_id <> scope_org or (new.division_id is not null and not exists(
      select 1 from org.divisions where id = new.division_id and organization_id = scope_org
    )) then raise exception 'Permission organization mismatch'; end if;
  end if;
  return new;
end $$;
create trigger assignments_validate_scope before insert or update on org.assignments
for each row execute function identity.validate_scope_links();
create trigger grants_validate_scope before insert or update on identity.permission_grants
for each row execute function identity.validate_scope_links();

create function identity.current_account_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select a.id from identity.accounts a join auth.users u on u.id = a.auth_user_id
  where u.id = auth.uid() and a.status = 'ACTIVE' and a.deactivated_at is null
    and u.email_confirmed_at is not null and lower(u.email) = a.email
    and u.raw_app_meta_data->>'kpi_access' = 'true'
    and u.raw_app_meta_data->>'kpi_role' in ('ADMIN_SISTEM','PENGURUS')
    and exists(select 1 from identity.account_roles ar where ar.account_id = a.id
      and ar.starts_at <= now() and (ar.ends_at is null or ar.ends_at > now()))
$$;

create function identity.is_active_member(target_org uuid, target_period uuid, target_division uuid default null) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from org.assignments a join org.positions p on p.id = a.position_id
    join org.periods t on t.id = a.period_id
    where a.account_id = identity.current_account_id()
      and p.organization_id = target_org and t.organization_id = target_org
      and t.id = target_period and t.status in ('ACTIVE','CLOSING')
      and current_date between t.starts_on and t.ends_on
      and a.starts_on <= current_date and (a.ends_on is null or a.ends_on >= current_date)
      and (target_division is null or p.division_id = target_division)
  )
$$;

create function public.kpi_access_context() returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'accountId', a.id, 'authUserId', a.auth_user_id, 'email', a.email, 'name', a.display_name,
    'roles', coalesce((select jsonb_agg(r.code order by r.code) from identity.account_roles ar
      join identity.roles r on r.id = ar.role_id where ar.account_id = a.id
      and ar.starts_at <= now() and (ar.ends_at is null or ar.ends_at > now())), '[]'::jsonb),
    'memberships', coalesce((select jsonb_agg(jsonb_build_object(
      'organizationCode', o.code, 'periodCode', t.code, 'divisionCode', d.code, 'position', p.name
    )) from org.assignments s join org.positions p on p.id = s.position_id
      join org.organizations o on o.id = p.organization_id join org.periods t on t.id = s.period_id
      left join org.divisions d on d.id = p.division_id
      where s.account_id = a.id and t.organization_id = o.id
        and t.status in ('ACTIVE','CLOSING') and current_date between t.starts_on and t.ends_on
        and s.starts_on <= current_date and (s.ends_on is null or s.ends_on >= current_date)), '[]'::jsonb),
    'grants', coalesce((select jsonb_agg(jsonb_build_object(
      'permission', g.permission, 'organizationCode', o.code, 'periodCode', t.code,
      'divisionCode', d.code, 'objectId', g.object_id, 'expiresAt', g.expires_at
    )) from identity.permission_grants g join org.organizations o on o.id = g.organization_id
      join org.periods t on t.id = g.period_id left join org.divisions d on d.id = g.division_id
      where g.account_id = a.id and g.revoked_at is null and g.starts_at <= now()
        and (g.expires_at is null or g.expires_at > now())
        and identity.is_active_member(g.organization_id, g.period_id, g.division_id)), '[]'::jsonb)
  ) from identity.accounts a where a.id = identity.current_account_id()
$$;

revoke all on function public.kpi_access_context() from public, anon;
grant execute on function public.kpi_access_context() to authenticated;
grant execute on function public.kpi_access_context() to service_role;
revoke all on all functions in schema identity from public, anon;
grant execute on function identity.current_account_id(), identity.is_active_member(uuid,uuid,uuid) to authenticated;

grant usage on schema identity, org to authenticated;
grant select on identity.accounts, identity.account_roles, identity.roles, identity.permission_grants,
  org.organizations, org.periods, org.positions, org.assignments, org.divisions to authenticated;

create policy accounts_self_read on identity.accounts for select to authenticated
using (id = identity.current_account_id());
create policy account_roles_self_read on identity.account_roles for select to authenticated
using (account_id = identity.current_account_id() and starts_at <= now() and (ends_at is null or ends_at > now()));
create policy roles_self_read on identity.roles for select to authenticated
using (exists(select 1 from identity.account_roles ar where ar.role_id = identity.roles.id));
create policy grants_self_read on identity.permission_grants for select to authenticated
using (account_id = identity.current_account_id() and revoked_at is null and starts_at <= now()
  and (expires_at is null or expires_at > now()) and identity.is_active_member(organization_id,period_id,division_id));
create policy assignments_self_read on org.assignments for select to authenticated
using (account_id = identity.current_account_id() and starts_on <= current_date and (ends_on is null or ends_on >= current_date));
create policy organizations_member_read on org.organizations for select to authenticated
using (exists(select 1 from org.periods t where t.organization_id = org.organizations.id and identity.is_active_member(org.organizations.id,t.id)));
create policy periods_member_read on org.periods for select to authenticated
using (identity.is_active_member(organization_id,id));
create policy positions_member_read on org.positions for select to authenticated
using (exists(select 1 from org.assignments a where a.position_id = org.positions.id and identity.is_active_member(org.positions.organization_id,a.period_id)));
create policy divisions_member_read on org.divisions for select to authenticated
using (exists(select 1 from org.periods t where t.organization_id = org.divisions.organization_id
  and identity.is_active_member(org.divisions.organization_id,t.id,org.divisions.id)));

grant usage on schema identity to service_role;
grant select, insert, update on identity.accounts, identity.roles, identity.account_roles, identity.permission_grants to service_role;
grant select, insert, update on org.organizations, org.periods, org.positions, org.assignments, org.divisions to service_role;

notify pgrst, 'reload schema';



create function identity.has_permission(wanted text, target_org uuid, target_period uuid, target_division uuid default null, target_object uuid default null) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from identity.permission_grants g
    where g.account_id = identity.current_account_id() and g.permission = wanted
      and g.organization_id = target_org and g.period_id = target_period
      and (g.division_id is null or g.division_id = target_division)
      and (g.object_id is null or g.object_id = target_object)
      and g.starts_at <= now() and g.revoked_at is null and (g.expires_at is null or g.expires_at > now())
      and identity.is_active_member(target_org,target_period,target_division));
$$;
revoke all on function identity.has_permission(text,uuid,uuid,uuid,uuid) from public, anon;

create function public.kpi_manage_grant(
  action text, recipient uuid, target_org uuid, target_period uuid,
  wanted text, reason text, target_division uuid default null, target_object uuid default null,
  expiry timestamptz default null, grant_id uuid default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare actor uuid := identity.current_account_id(); result_id uuid; current_grant identity.permission_grants; actor_limit timestamptz;
begin
  if actor is null or actor = recipient or length(trim(reason)) < 3 or action not in ('GRANT','REVOKE') then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if action = 'REVOKE' then
    select * into current_grant from identity.permission_grants where id = grant_id for update;
    if current_grant.id is null or current_grant.account_id <> recipient then
      raise exception 'Access denied' using errcode = '42501';
    end if;
    target_org := current_grant.organization_id;
    target_period := current_grant.period_id;
    target_division := current_grant.division_id;
    target_object := current_grant.object_id;
  end if;
  if not identity.has_permission('IDENTITY_MANAGE',target_org,target_period,target_division,target_object) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if action = 'GRANT' then
    if wanted = 'IDENTITY_MANAGE' or not identity.has_permission(wanted,target_org,target_period,target_division,target_object)
      or (expiry is not null and expiry <= now())
      or not exists(select 1 from identity.accounts where id = recipient and status = 'ACTIVE' and deactivated_at is null)
      or not exists(select 1 from org.assignments s join org.positions p on p.id = s.position_id
        join org.periods t on t.id = s.period_id
        where s.account_id = recipient and p.organization_id = target_org and t.organization_id = target_org
          and t.id = target_period and t.status in ('ACTIVE','CLOSING')
          and current_date between t.starts_on and t.ends_on
          and s.starts_on <= current_date and (s.ends_on is null or s.ends_on >= current_date)
          and (target_division is null or p.division_id = target_division)) then
      raise exception 'Access denied' using errcode = '42501';
    end if;
    select min(g.expires_at) into actor_limit from identity.permission_grants g
      where g.account_id = actor and g.organization_id = target_org and g.period_id = target_period
        and g.permission in ('IDENTITY_MANAGE',wanted)
        and (g.division_id is null or g.division_id = target_division)
        and (g.object_id is null or g.object_id = target_object)
        and g.revoked_at is null and g.starts_at <= now() and (g.expires_at is null or g.expires_at > now());
    if actor_limit is not null and (expiry is null or expiry > actor_limit) then expiry := actor_limit; end if;
    insert into identity.permission_grants(account_id,organization_id,period_id,division_id,object_id,permission,expires_at,granted_by_account_id,reason)
      values(recipient,target_org,target_period,target_division,target_object,wanted,expiry,actor,trim(reason)) returning id into result_id;
  else
    update identity.permission_grants set revoked_at = coalesce(revoked_at,now()) where id = grant_id returning id into result_id;
  end if;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
    values('PERMISSION_' || action,'identity','permission_grant',result_id,'SUCCESS','hosted:' || gen_random_uuid(),
      jsonb_build_object('actorAccountId',actor,'recipientAccountId',recipient,'reason',trim(reason)));
  return result_id;
end $$;

revoke all on function public.kpi_manage_grant(text,uuid,uuid,uuid,text,text,uuid,uuid,timestamptz,uuid) from public, anon;
grant execute on function public.kpi_manage_grant(text,uuid,uuid,uuid,text,text,uuid,uuid,timestamptz,uuid) to authenticated;
notify pgrst, 'reload schema';

COMMIT;

