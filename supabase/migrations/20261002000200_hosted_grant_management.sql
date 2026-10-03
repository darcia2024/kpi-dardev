begin;

create function identity.has_permission(wanted text, target_org uuid, target_period uuid, target_division uuid default null, target_object uuid default null) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from identity.permission_grants g
    where g.account_id = identity.current_account_id() and g.permission = wanted
      and g.organization_id = target_org and g.period_id = target_period
      and (g.division_id is null or g.division_id = target_division)
      and (g.object_id is null or g.object_id = target_object)
      and g.starts_at <= now() and g.revoked_at is null and (g.expires_at is null or g.expires_at > now())
      and identity.is_active_member(target_org,target_period,target_division));
$$;
revoke all on function identity.has_permission(text,uuid,uuid,uuid,uuid) from public, anon;

create function public.kpi_manage_grant(
  action text, recipient uuid, target_org uuid, target_period uuid,
  wanted text, reason text, target_division uuid default null, target_object uuid default null,
  expiry timestamptz default null, grant_id uuid default null
) returns uuid language plpgsql security definer set search_path = '' as $$
declare actor uuid := identity.current_account_id(); result_id uuid; current_grant identity.permission_grants; actor_limit timestamptz;
begin
  if actor is null or actor = recipient or length(trim(reason)) < 3 or action not in ('GRANT','REVOKE') then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if action = 'REVOKE' then
    select * into current_grant from identity.permission_grants where id = grant_id for update;
    if current_grant.id is null or current_grant.account_id <> recipient then
      raise exception 'Access denied' using errcode = '42501';
    end if;
    target_org := current_grant.organization_id;
    target_period := current_grant.period_id;
    target_division := current_grant.division_id;
    target_object := current_grant.object_id;
  end if;
  if not identity.has_permission('IDENTITY_MANAGE',target_org,target_period,target_division,target_object) then
    raise exception 'Access denied' using errcode = '42501';
  end if;
  if action = 'GRANT' then
    if wanted = 'IDENTITY_MANAGE' or not identity.has_permission(wanted,target_org,target_period,target_division,target_object)
      or (expiry is not null and expiry <= now())
      or not exists(select 1 from identity.accounts where id = recipient and status = 'ACTIVE' and deactivated_at is null)
      or not exists(select 1 from org.assignments s join org.positions p on p.id = s.position_id
        join org.periods t on t.id = s.period_id
        where s.account_id = recipient and p.organization_id = target_org and t.organization_id = target_org
          and t.id = target_period and t.status in ('ACTIVE','CLOSING')
          and current_date between t.starts_on and t.ends_on
          and s.starts_on <= current_date and (s.ends_on is null or s.ends_on >= current_date)
          and (target_division is null or p.division_id = target_division)) then
      raise exception 'Access denied' using errcode = '42501';
    end if;
    select min(g.expires_at) into actor_limit from identity.permission_grants g
      where g.account_id = actor and g.organization_id = target_org and g.period_id = target_period
        and g.permission in ('IDENTITY_MANAGE',wanted)
        and (g.division_id is null or g.division_id = target_division)
        and (g.object_id is null or g.object_id = target_object)
        and g.revoked_at is null and g.starts_at <= now() and (g.expires_at is null or g.expires_at > now());
    if actor_limit is not null and (expiry is null or expiry > actor_limit) then expiry := actor_limit; end if;
    insert into identity.permission_grants(account_id,organization_id,period_id,division_id,object_id,permission,expires_at,granted_by_account_id,reason)
      values(recipient,target_org,target_period,target_division,target_object,wanted,expiry,actor,trim(reason)) returning id into result_id;
  else
    update identity.permission_grants set revoked_at = coalesce(revoked_at,now()) where id = grant_id returning id into result_id;
  end if;
  insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata)
    values('PERMISSION_' || action,'identity','permission_grant',result_id,'SUCCESS','hosted:' || gen_random_uuid(),
      jsonb_build_object('actorAccountId',actor,'recipientAccountId',recipient,'reason',trim(reason)));
  return result_id;
end $$;

revoke all on function public.kpi_manage_grant(text,uuid,uuid,uuid,text,text,uuid,uuid,timestamptz,uuid) from public, anon;
grant execute on function public.kpi_manage_grant(text,uuid,uuid,uuid,text,text,uuid,uuid,timestamptz,uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
