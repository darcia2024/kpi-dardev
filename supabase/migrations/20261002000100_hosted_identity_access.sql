begin;

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
commit;
