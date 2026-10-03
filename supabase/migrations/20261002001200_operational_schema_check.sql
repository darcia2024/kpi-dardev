begin;
create function public.kpi_operations_schema_ready() returns boolean language sql stable security definer set search_path='' as $$
 select to_regclass('work.meetings') is not null
 and to_regclass('content.managed_items') is not null
 and to_regclass('files.managed_assets') is not null
 and to_regclass('notifications.inbox') is not null
 and to_regclass('intake.cases') is not null
 and to_regprocedure('public.kpi_meeting_action(uuid,integer,text,jsonb)') is not null
 and to_regprocedure('public.kpi_content_action(uuid,integer,text,jsonb)') is not null
 and to_regprocedure('public.kpi_case_action(uuid,integer,text,jsonb)') is not null
 and to_regprocedure('public.kpi_publications_list(text,text,text)') is not null
 and to_regprocedure('notifications.case_event()') is not null
 and exists(select 1 from storage.buckets where id='kpi-private' and not public);
$$;
revoke all on function public.kpi_operations_schema_ready() from public,anon,authenticated;
grant execute on function public.kpi_operations_schema_ready() to service_role;
notify pgrst,'reload schema';
commit;
