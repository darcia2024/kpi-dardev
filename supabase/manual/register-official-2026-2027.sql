begin;
do $$
declare oid uuid; pid uuid; actor uuid;
begin
 select a.id into actor from identity.accounts a join identity.system_administrators s on s.account_id=a.id
 where a.auth_user_id='093b761f-d1c7-433c-8153-0f271e85664c' and a.email='kpippmimesirofficial@gmail.com'
 and a.status='ACTIVE' and a.deactivated_at is null and s.revoked_at is null;
 if actor is null then raise exception 'Approved administrator required'; end if;
 insert into org.organizations(code,name) values('KPI_PPMI_MESIR','KPI PPMI Mesir') on conflict(code) do nothing;
 select id into oid from org.organizations where code='KPI_PPMI_MESIR';
 select id into pid from org.periods where organization_id=oid and code='2026_2027';
 if pid is not null then
  if not exists(select 1 from org.periods where id=pid and starts_on=date '2026-10-17' and ends_on=date '2027-10-17') then raise exception 'Official period dates differ'; end if;
 else
  insert into org.periods(organization_id,code,starts_on,ends_on,status)
  values(oid,'2026_2027',date '2026-10-17',date '2027-10-17','PLANNED') returning id into pid;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
  values('OFFICIAL_PERIOD_PLANNED','org','period',pid,'SUCCESS','manual:'||gen_random_uuid(),
   jsonb_build_object('actorAccountId',actor,'source','Owner confirmed dates; no current active period'));
 end if;
end $$;
select o.code as organization,p.code as period,p.starts_on,p.ends_on,p.status
from org.organizations o join org.periods p on p.organization_id=o.id where o.code='KPI_PPMI_MESIR';
commit;
