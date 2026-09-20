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
