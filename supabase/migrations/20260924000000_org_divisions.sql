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
