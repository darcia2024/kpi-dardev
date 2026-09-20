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
