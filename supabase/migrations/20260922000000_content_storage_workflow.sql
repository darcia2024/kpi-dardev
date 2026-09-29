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
