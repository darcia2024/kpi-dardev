begin;

grant usage on schema org to service_role;
grant select on org.organizations, org.periods to service_role;

notify pgrst, 'reload schema';

commit;
