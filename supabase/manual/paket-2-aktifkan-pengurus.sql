-- Fill the four required values, then run as the database owner in SQL Editor.
-- This approves one existing, email-verified Auth user. It does not create a password.
begin;
do $$
declare
  target_auth_id uuid := null;
  official_name text := null;
  target_position_id uuid := null;
  target_period_id uuid := null;
  technical_role text := 'PENGURUS'; -- PENGURUS or ADMIN_SISTEM; no automatic business permissions.
  target_account_id uuid;
  target_role_id uuid;
  target_email text;
begin
  if target_auth_id is null or target_position_id is null or target_period_id is null
    or official_name is null or length(trim(official_name)) < 2
    or technical_role not in ('PENGURUS','ADMIN_SISTEM') then raise exception 'Fill the official account and assignment values first'; end if;
  select lower(email) into target_email from auth.users where id=target_auth_id and email_confirmed_at is not null;
  if target_email is null then raise exception 'Auth user must exist and verify email first'; end if;
  if not exists(select 1 from org.positions p join org.periods t on t.organization_id=p.organization_id
    where p.id=target_position_id and t.id=target_period_id and t.status in ('ACTIVE','CLOSING')
      and current_date between t.starts_on and t.ends_on) then raise exception 'Select a position in the correct active organization and period'; end if;
  insert into identity.accounts(auth_user_id,email,display_name,status)
    values(target_auth_id,target_email,trim(official_name),'ACTIVE')
    on conflict(email) do update set auth_user_id=excluded.auth_user_id,display_name=excluded.display_name,status='ACTIVE',deactivated_at=null
    where identity.accounts.auth_user_id is null or identity.accounts.auth_user_id=excluded.auth_user_id
    returning id into target_account_id;
  if target_account_id is null then raise exception 'Account already mapped to a different Auth user'; end if;
  insert into identity.roles(code,name,is_system_role) values(technical_role,technical_role,true)
    on conflict(code) do nothing;
  select id into target_role_id from identity.roles where code=technical_role;
  insert into identity.account_roles(account_id,role_id)
    select target_account_id,target_role_id
    where not exists(select 1 from identity.account_roles where account_id=target_account_id
      and role_id=target_role_id and starts_at<=now() and (ends_at is null or ends_at>now()));
  insert into org.assignments(account_id,position_id,period_id,starts_on)
    select target_account_id,target_position_id,target_period_id,current_date
    where not exists(select 1 from org.assignments where account_id=target_account_id and position_id=target_position_id
      and period_id=target_period_id and starts_on<=current_date and (ends_on is null or ends_on>=current_date));
  update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb) || jsonb_build_object('kpi_access',true,'kpi_role',technical_role)
    where id=target_auth_id;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
    values('ACCOUNT_ACTIVATED','identity','account',target_account_id,'SUCCESS','manual:' || gen_random_uuid(),
      jsonb_build_object('authUserId',target_auth_id,'positionId',target_position_id,'periodId',target_period_id));
end $$;
commit;
