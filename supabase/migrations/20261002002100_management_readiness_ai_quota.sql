begin;
create table management.ai_usage(account_id uuid not null references identity.accounts(id),day date not null,minute timestamptz not null,day_count integer not null,minute_count integer not null,primary key(account_id,day));
alter table management.ai_usage enable row level security;
revoke all on management.ai_usage from public,anon,authenticated;
create function public.kpi_ai_consume_quota(organization_code text,period_code text,division_code text default null) returns boolean language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare actor uuid:=identity.current_account_id();oid uuid;pid uuid;did uuid;item management.ai_usage;bucket timestamptz:=date_trunc('minute',now());
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if actor is null or oid is null or (division_code is not null and did is null) or not identity.has_permission('AI_READ',oid,pid,did) then raise exception 'AI access denied' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('ai-quota:'||actor::text,0));
 select * into item from management.ai_usage where account_id=actor and day=current_date for update;
 if item.account_id is not null and (item.day_count>=100 or (item.minute=bucket and item.minute_count>=8)) then return false;end if;
 insert into management.ai_usage(account_id,day,minute,day_count,minute_count) values(actor,current_date,bucket,1,1)
 on conflict(account_id,day) do update set minute=excluded.minute,day_count=management.ai_usage.day_count+1,minute_count=case when management.ai_usage.minute=excluded.minute then management.ai_usage.minute_count+1 else 1 end;
 delete from management.ai_usage where account_id=actor and day<current_date-7;
 return true;
end $$;
revoke all on function public.kpi_ai_consume_quota(text,text,text) from public,anon,authenticated;
grant execute on function public.kpi_ai_consume_quota(text,text,text) to authenticated;
alter function public.kpi_operations_schema_ready() rename to kpi_operations_schema_ready_before_management;
create function public.kpi_operations_schema_ready() returns boolean language sql stable security definer set search_path='' as $$
 select public.kpi_operations_schema_ready_before_management() and to_regclass('management.records') is not null and to_regclass('management.ai_usage') is not null
 and to_regprocedure('public.kpi_management_action(uuid,integer,text,jsonb)') is not null and to_regprocedure('public.kpi_ai_draft_commit(uuid,integer,text)') is not null and to_regprocedure('public.kpi_workspace_snapshot(text,text,text)') is not null;
$$;
revoke all on function public.kpi_operations_schema_ready(),public.kpi_operations_schema_ready_before_management() from public,anon,authenticated;
grant execute on function public.kpi_operations_schema_ready() to service_role;
notify pgrst,'reload schema';
commit;
