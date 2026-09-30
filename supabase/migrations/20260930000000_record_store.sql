-- Production record store for portal modules.
--
-- Every module keeps its records as JSON documents keyed by (organization, namespace, id)
-- with an optimistic revision number. All writes of one request go through
-- public.kpi_commit_records, which applies them atomically and appends an
-- immutable history row per change.
--
-- Browser clients never touch these tables: RLS is enabled without policies and
-- all privileges are revoked from anon/authenticated. Only the server, using the
-- service role, may execute the kpi_* functions below.

create table if not exists platform.records (
  organization_id uuid not null references org.organizations(id),
  namespace text not null,
  id text not null,
  revision integer not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  primary key (organization_id, namespace, id),
  constraint records_namespace_format check (namespace ~ '^[a-z][a-z0-9-]{1,63}$'),
  constraint records_id_length check (length(id) between 1 and 200),
  constraint records_revision_positive check (revision > 0)
);

create table if not exists platform.record_revisions (
  sequence bigint generated always as identity primary key,
  organization_id uuid not null references org.organizations(id),
  namespace text not null,
  record_id text not null,
  revision integer not null,
  payload jsonb not null,
  actor_id uuid,
  recorded_at timestamptz not null default now(),
  constraint record_revisions_unique unique (organization_id, namespace, record_id, revision)
);

create index if not exists record_revisions_lookup
  on platform.record_revisions (organization_id, namespace, record_id);

alter table platform.records enable row level security;
alter table platform.record_revisions enable row level security;

revoke all on platform.records, platform.record_revisions from public;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on platform.records, platform.record_revisions from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on platform.records, platform.record_revisions from authenticated';
  end if;
end
$$;

-- History is append-only: no update, delete or truncate.
create or replace function platform.reject_record_history_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'RECORD_HISTORY_IMMUTABLE';
end
$$;

drop trigger if exists record_revisions_no_update on platform.record_revisions;
create trigger record_revisions_no_update
  before update or delete on platform.record_revisions
  for each row execute function platform.reject_record_history_change();

drop trigger if exists record_revisions_no_truncate on platform.record_revisions;
create trigger record_revisions_no_truncate
  before truncate on platform.record_revisions
  for each statement execute function platform.reject_record_history_change();

-- Load every record of an organization, except namespaces listed in p_skip
-- (large append-only logs) unless they are explicitly requested in p_include.
-- Returns one JSON array instead of a row set: the Supabase API caps row sets
-- (1000 rows by default), which would silently truncate a large organization.
create or replace function public.kpi_load_records(
  p_organization_id uuid,
  p_skip text[] default '{}',
  p_include text[] default '{}'
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object('namespace', r.namespace, 'id', r.id, 'revision', r.revision, 'payload', r.payload)
      order by r.namespace, r.id
    ),
    '[]'::jsonb
  )
  from platform.records r
  where r.organization_id = p_organization_id
    and (not (r.namespace = any (coalesce(p_skip, '{}'))) or r.namespace = any (coalesce(p_include, '{}')))
$$;

-- Apply a request's changes atomically. p_changes is a JSON array of
-- {"namespace", "id", "expectedRevision", "payload"}. expectedRevision 0 means
-- the record must not exist yet. Any mismatch aborts the whole change set.
create or replace function public.kpi_commit_records(
  p_organization_id uuid,
  p_actor_id uuid,
  p_changes jsonb
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_change jsonb;
  v_namespace text;
  v_id text;
  v_expected integer;
  v_payload jsonb;
  v_rows integer;
  v_count integer := 0;
begin
  if p_organization_id is null or p_changes is null or jsonb_typeof(p_changes) <> 'array' then
    raise exception 'INVALID_CHANGESET';
  end if;

  for v_change in select value from jsonb_array_elements(p_changes) loop
    v_namespace := v_change ->> 'namespace';
    v_id := v_change ->> 'id';
    v_payload := v_change -> 'payload';
    if jsonb_typeof(v_change -> 'expectedRevision') <> 'number' then
      raise exception 'INVALID_CHANGESET';
    end if;
    v_expected := (v_change ->> 'expectedRevision')::integer;

    if v_namespace is null or v_id is null or v_payload is null or v_expected < 0 then
      raise exception 'INVALID_CHANGESET';
    end if;

    if v_expected = 0 then
      insert into platform.records (organization_id, namespace, id, revision, payload, updated_by)
      values (p_organization_id, v_namespace, v_id, 1, v_payload, p_actor_id)
      on conflict (organization_id, namespace, id) do nothing;
    else
      update platform.records
      set revision = v_expected + 1, payload = v_payload, updated_at = now(), updated_by = p_actor_id
      where organization_id = p_organization_id
        and namespace = v_namespace
        and id = v_id
        and revision = v_expected;
    end if;

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      raise exception 'RECORD_CONFLICT';
    end if;

    insert into platform.record_revisions (organization_id, namespace, record_id, revision, payload, actor_id)
    values (p_organization_id, v_namespace, v_id, v_expected + 1, v_payload, p_actor_id);

    v_count := v_count + 1;
  end loop;

  return v_count;
end
$$;

-- Organization and period lookups without exposing the org schema to the API.
create or replace function public.kpi_get_organization(p_code text)
returns table (id uuid, code text, name text)
language sql
stable
security definer
set search_path = ''
as $$
  select o.id, o.code, o.name
  from org.organizations o
  where o.code = upper(trim(p_code))
$$;

create or replace function public.kpi_list_periods(p_organization_id uuid)
returns table (id uuid, organization_id uuid, code text, starts_on date, ends_on date, status text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.organization_id, p.code, p.starts_on, p.ends_on, p.status
  from org.periods p
  where p.organization_id = p_organization_id
  order by p.starts_on desc
$$;

revoke all on function public.kpi_load_records(uuid, text[], text[]) from public;
revoke all on function public.kpi_commit_records(uuid, uuid, jsonb) from public;
revoke all on function public.kpi_get_organization(text) from public;
revoke all on function public.kpi_list_periods(uuid) from public;

do $$
declare
  v_role text;
begin
  foreach v_role in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = v_role) then
      execute format('revoke all on function public.kpi_load_records(uuid, text[], text[]) from %I', v_role);
      execute format('revoke all on function public.kpi_commit_records(uuid, uuid, jsonb) from %I', v_role);
      execute format('revoke all on function public.kpi_get_organization(text) from %I', v_role);
      execute format('revoke all on function public.kpi_list_periods(uuid) from %I', v_role);
    end if;
  end loop;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.kpi_load_records(uuid, text[], text[]) to service_role;
    grant execute on function public.kpi_commit_records(uuid, uuid, jsonb) to service_role;
    grant execute on function public.kpi_get_organization(text) to service_role;
    grant execute on function public.kpi_list_periods(uuid) to service_role;
  end if;
end
$$;
