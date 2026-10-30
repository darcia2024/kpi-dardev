begin;
do $$
declare account uuid; organization uuid;
begin
 select a.id into strict account from identity.accounts a join auth.users u on u.id=a.auth_user_id
 join identity.system_administrators s on s.account_id=a.id
 where a.email='kpippmimesirofficial@gmail.com' and lower(u.email)=a.email
 and u.email_confirmed_at is not null and a.status='ACTIVE' and a.deactivated_at is null and s.revoked_at is null;
 select id into strict organization from org.organizations where code='KPI_PPMI_MESIR';
 insert into identity.super_administrators(account_id,organization_id,approved_reference)
 values(account,organization,'Persetujuan pengguna 6 dan 30 Oktober 2026: seluruh modul dan data KPI termasuk kasus/keuangan rahasia; sampai dicabut')
 on conflict(account_id,organization_id) do update set starts_at=now(),expires_at=null,revoked_at=null,approved_reference=excluded.approved_reference;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
 values('SUPER_ADMIN_ACTIVATED','identity','account',account,'SUCCESS','manual:'||gen_random_uuid(),jsonb_build_object('organizationId',organization,'approval','Persetujuan pengguna 6 dan 30 Oktober 2026','scope','KPI seluruh modul/data','untilRevoked',true));
end $$;
commit;
select a.email,o.code,s.revoked_at is null as super_admin_registered from identity.super_administrators s
join identity.accounts a on a.id=s.account_id join org.organizations o on o.id=s.organization_id
where a.email='kpippmimesirofficial@gmail.com' and o.code='KPI_PPMI_MESIR';
