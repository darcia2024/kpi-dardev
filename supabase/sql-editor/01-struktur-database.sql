-- ===================================================================
-- LANGKAH 1 DARI 2: STRUKTUR DATABASE PRODUKSI KPI
-- Jalankan SEKALI di Supabase KPI: SQL Editor > New query > tempel semua > Run.
--
-- Isi: seluruh migrasi di supabase/migrations, berurutan, TANPA data TEST.
-- Dibuat otomatis dari file migrasi; jangan diedit manual. Sudah diuji di
-- Postgres (PGlite) lewat tests/record-store-sql.test.ts.
-- ===================================================================

-- -------------------------------------------------------------------
-- 20260921000000_platform.sql
-- -------------------------------------------------------------------
create extension if not exists pgcrypto;

create schema if not exists platform;
create schema if not exists org;
create schema if not exists audit;

revoke all on schema platform, org, audit from public;

create table if not exists org.organizations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now(),
  constraint organizations_code_format check (code ~ '^[A-Z][A-Z0-9_]{1,63}$')
);

create table if not exists org.periods (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references org.organizations(id),
  code text not null,
  starts_on date not null,
  ends_on date not null,
  status text not null check (status in ('PLANNED', 'ACTIVE', 'CLOSING', 'CLOSED')),
  created_at timestamptz not null default now(),
  constraint periods_date_range check (ends_on >= starts_on),
  constraint periods_code_per_organization unique (organization_id, code)
);

create table if not exists platform.configuration_values (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  status text not null check (status in ('TEST_ONLY', 'ACTIVE', 'NOT_SET')),
  updated_at timestamptz not null default now()
);

create table if not exists audit.audit_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  action text not null,
  module text not null,
  entity_type text not null,
  entity_id uuid,
  result text not null check (result in ('SUCCESS', 'FAILURE', 'DENIED')),
  request_id text not null,
  metadata jsonb not null default '{}'::jsonb
);

alter table org.organizations enable row level security;
alter table org.periods enable row level security;
alter table platform.configuration_values enable row level security;
alter table audit.audit_events enable row level security;

revoke all on all tables in schema platform, org, audit from public;
alter default privileges in schema platform revoke all on tables from public;
alter default privileges in schema org revoke all on tables from public;
alter default privileges in schema audit revoke all on tables from public;

-- -------------------------------------------------------------------
-- 20260921000100_identity.sql
-- -------------------------------------------------------------------
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

-- -------------------------------------------------------------------
-- 20260922000000_content_storage_workflow.sql
-- -------------------------------------------------------------------
-- Phase 7 foundation. Tables are deny-by-default: no RLS policies are added
-- until KPI approves its role, retention, and approval-authority decisions.
create schema if not exists content;
create schema if not exists files;
create schema if not exists workflow;
create schema if not exists intake;

revoke all on schema content, files, workflow, intake from public;

create table if not exists content.entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references org.organizations(id),
  kind text not null check (kind in ('ACTIVITY', 'NEWS', 'PAGE', 'PUBLICATION')),
  slug text not null,
  visibility text not null check (visibility in ('PUBLIC', 'INTERNAL')),
  current_version_id uuid,
  created_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (organization_id, kind, slug)
);

create table if not exists content.entry_versions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references content.entries(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  locale text not null check (locale in ('id', 'en')),
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  state text not null check (state in ('DRAFT', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
  author_account_id uuid references identity.accounts(id),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (entry_id, version_number, locale)
);

alter table content.entries drop constraint if exists entries_current_version_id_fkey;
alter table content.entries add constraint entries_current_version_id_fkey
  foreign key (current_version_id) references content.entry_versions(id) deferrable initially deferred;

create table if not exists files.assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references org.organizations(id),
  bucket_id text not null,
  object_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  classification text not null check (classification in ('PUBLIC', 'INTERNAL', 'RESTRICTED')),
  scan_status text not null check (scan_status in ('PENDING', 'AVAILABLE', 'QUARANTINED', 'REJECTED')),
  uploaded_by_account_id uuid references identity.accounts(id),
  created_at timestamptz not null default now(),
  unique (bucket_id, object_path)
);

create table if not exists workflow.approval_requests (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  requested_by_account_id uuid references identity.accounts(id),
  reviewer_account_id uuid references identity.accounts(id),
  state text not null check (state in ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decision_note text,
  constraint approval_request_no_self_review check (reviewer_account_id is null or requested_by_account_id is null or reviewer_account_id <> requested_by_account_id)
);

create unique index if not exists approval_requests_one_pending_entity
  on workflow.approval_requests (entity_type, entity_id) where state = 'PENDING';

create table if not exists intake.aspirations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references org.organizations(id),
  tracking_token_hash text not null unique,
  status text not null check (status in ('RECEIVED', 'TRIAGED', 'IN_PROGRESS', 'CLOSED')),
  classification text not null check (classification in ('INTERNAL', 'RESTRICTED')),
  submitted_at timestamptz not null default now(),
  triaged_by_account_id uuid references identity.accounts(id),
  triaged_at timestamptz,
  closed_at timestamptz
);

create table if not exists platform.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  idempotency_key text not null,
  actor_reference text,
  response_status integer,
  response_body jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (scope, idempotency_key)
);

alter table content.entries enable row level security;
alter table content.entry_versions enable row level security;
alter table files.assets enable row level security;
alter table workflow.approval_requests enable row level security;
alter table intake.aspirations enable row level security;
alter table platform.idempotency_keys enable row level security;

revoke all on all tables in schema content from public;
revoke all on all tables in schema files from public;
revoke all on all tables in schema workflow from public;
revoke all on all tables in schema intake from public;
revoke all on platform.idempotency_keys from public;

alter default privileges in schema content revoke all on tables from public;
alter default privileges in schema files revoke all on tables from public;
alter default privileges in schema workflow revoke all on tables from public;
alter default privileges in schema intake revoke all on tables from public;

-- -------------------------------------------------------------------
-- 20260924000000_org_divisions.sql
-- -------------------------------------------------------------------
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
alter table org.positions add constraint positions_division_same_organization
  foreign key (division_id, organization_id) references org.divisions(id, organization_id);
create index if not exists positions_division_id_idx on org.positions (division_id);
alter table org.divisions enable row level security;
revoke all on org.divisions from public;

-- -------------------------------------------------------------------
-- 20260930000000_record_store.sql
-- -------------------------------------------------------------------
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

-- Muat ulang cache API supaya fungsi kpi_* langsung bisa dipanggil server.
notify pgrst, 'reload schema';
