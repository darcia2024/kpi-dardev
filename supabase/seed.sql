insert into org.organizations (code, name)
values ('KPI_TEST', 'KPI PPMI Mesir TEST')
on conflict (code) do nothing;

insert into org.periods (organization_id, code, starts_on, ends_on, status)
select id, '2026_2027_TEST', date '2026-01-01', date '2027-12-31', 'PLANNED'
from org.organizations
where code = 'KPI_TEST'
on conflict (organization_id, code) do nothing;

insert into platform.configuration_values (key, value, status)
values
  ('environment.classification', '"TEST_ONLY"'::jsonb, 'TEST_ONLY'),
  ('organization.timezone', '"Africa/Cairo"'::jsonb, 'TEST_ONLY')
on conflict (key) do nothing;
