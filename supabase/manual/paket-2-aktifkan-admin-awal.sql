-- Run as database owner after approving this account's technical portal access.
-- Official assignments and operational permissions are provisioned separately.
begin;
do $$
declare
  target_auth_id uuid := '093b761f-d1c7-433c-8153-0f271e85664c';
  target_email text := 'kpippmimesirofficial@gmail.com';
  target_account_id uuid;
  target_role_id uuid;
begin
  if not exists(select 1 from auth.users where id=target_auth_id
    and lower(email)=target_email and email_confirmed_at is not null) then
    raise exception 'The approved, verified Auth account was not found';
  end if;
  insert into identity.accounts(auth_user_id,email,display_name,status)
    values(target_auth_id,target_email,'Admin KPI PPMI Mesir','ACTIVE')
    on conflict(email) do update set auth_user_id=excluded.auth_user_id,
      display_name=excluded.display_name,status='ACTIVE',deactivated_at=null
    where identity.accounts.auth_user_id is null or identity.accounts.auth_user_id=excluded.auth_user_id
    returning id into target_account_id;
  if target_account_id is null then raise exception 'Account belongs to another Auth user'; end if;
  insert into identity.roles(code,name,is_system_role)
    values('ADMIN_SISTEM','Administrator sistem',true) on conflict(code) do nothing;
  select id into target_role_id from identity.roles where code='ADMIN_SISTEM';
  insert into identity.account_roles(account_id,role_id)
    select target_account_id,target_role_id where not exists(
      select 1 from identity.account_roles where account_id=target_account_id
      and role_id=target_role_id and starts_at<=now() and (ends_at is null or ends_at>now()));
  update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)
    || jsonb_build_object('kpi_access',true,'kpi_role','ADMIN_SISTEM') where id=target_auth_id;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
    values('ACCOUNT_ACTIVATED','identity','account',target_account_id,'SUCCESS',
      'manual:' || gen_random_uuid(),jsonb_build_object('authUserId',target_auth_id,
        'technicalRole','ADMIN_SISTEM','operationalPermissionsGranted',false));
end $$;
commit;
