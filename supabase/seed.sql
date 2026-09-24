-- TEST fixtures only. These identifiers and accounts are synthetic and must
-- never be used as production organizational data.
insert into org.organizations (id, code, name)
values ('00000000-0000-4000-8000-000000000001', 'KPI_TEST', 'KPI PPMI Mesir TEST')
on conflict (id) do update set code = excluded.code, name = excluded.name;

insert into org.periods (id, organization_id, code, starts_on, ends_on, status)
values ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', '2026_2027_TEST', date '2026-01-01', date '2027-12-31', 'PLANNED')
on conflict (id) do update set code = excluded.code, starts_on = excluded.starts_on, ends_on = excluded.ends_on, status = excluded.status;

insert into identity.accounts (id, email, display_name, status)
values
  ('00000000-0000-4000-8000-000000000101', 'admin.test@kpi.local', 'Admin Sistem TEST', 'ACTIVE'),
  ('00000000-0000-4000-8000-000000000102', 'pengurus.test@kpi.local', 'Pengurus TEST', 'ACTIVE')
on conflict (id) do update set email = excluded.email, display_name = excluded.display_name, status = excluded.status;

insert into identity.roles (id, code, name, is_system_role)
values
  ('00000000-0000-4000-8000-000000000201', 'ADMIN_SISTEM', 'Admin Sistem TEST', true),
  ('00000000-0000-4000-8000-000000000202', 'PENGURUS', 'Pengurus TEST', false)
on conflict (id) do update set code = excluded.code, name = excluded.name, is_system_role = excluded.is_system_role;

insert into identity.account_roles (account_id, role_id, starts_at)
values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000201', timestamptz '2026-01-01 00:00:00+00'),
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000202', timestamptz '2026-01-01 00:00:00+00'),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000202', timestamptz '2026-01-01 00:00:00+00')
on conflict do nothing;

insert into org.positions (id, organization_id, code, name)
values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', 'ADMIN_TEST', 'Admin Sistem TEST'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000001', 'PENGURUS_TEST', 'Pengurus TEST')
on conflict (id) do update set code = excluded.code, name = excluded.name;

insert into org.assignments (id, account_id, position_id, period_id, starts_on, ends_on)
values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000002', date '2026-01-01', date '2027-12-31'),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000002', date '2026-01-01', date '2027-12-31')
on conflict (id) do update set starts_on = excluded.starts_on, ends_on = excluded.ends_on;

insert into platform.configuration_values (key, value, status)
values
  ('environment.classification', '"TEST_ONLY"'::jsonb, 'TEST_ONLY'),
  ('organization.timezone', '"Africa/Cairo"'::jsonb, 'TEST_ONLY')
on conflict (key) do nothing;
