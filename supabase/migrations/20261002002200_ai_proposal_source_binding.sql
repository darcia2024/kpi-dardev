begin;
create function public.kpi_ai_proposal_create(organization_code text,period_code text,division_code text,input jsonb,request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare source_ids uuid[];current_sources jsonb;current_versions jsonb;
begin
 if input is null or jsonb_typeof(input->'sources') is distinct from 'array' or jsonb_array_length(input->'sources')>5 or jsonb_typeof(input->'sourceVersions') is distinct from 'object' then raise exception 'Source versions required' using errcode='22023';end if;
 source_ids:=array(select value::uuid from jsonb_array_elements_text(input->'sources'));
 current_sources:=public.kpi_ai_sources(organization_code,period_code,division_code,source_ids);
 perform id from content.managed_items where id=any(source_ids) order by id for share;
 current_sources:=public.kpi_ai_sources(organization_code,period_code,division_code,source_ids);
 select coalesce(jsonb_object_agg(e->>'id',e->'version'),'{}'::jsonb) into current_versions from jsonb_array_elements(current_sources)e;
 if current_versions is distinct from input->'sourceVersions' then raise exception 'Source version changed; request a fresh proposal' using errcode='40001';end if;
 return public.kpi_management_create('AI_DRAFT',organization_code,period_code,division_code,input,request_key);
exception when invalid_text_representation then raise exception 'Invalid source identifier' using errcode='22023';end $$;
revoke all on function public.kpi_ai_proposal_create(text,text,text,jsonb,uuid) from public,anon,authenticated;
grant execute on function public.kpi_ai_proposal_create(text,text,text,jsonb,uuid) to authenticated;
create or replace function public.kpi_operations_schema_ready() returns boolean language sql stable security definer set search_path='' as $$
 select public.kpi_operations_schema_ready_before_management() and to_regclass('management.records') is not null and to_regclass('management.ai_usage') is not null
 and to_regprocedure('public.kpi_management_action(uuid,integer,text,jsonb)') is not null and to_regprocedure('public.kpi_ai_draft_commit(uuid,integer,text)') is not null
 and to_regprocedure('public.kpi_workspace_snapshot(text,text,text)') is not null and to_regprocedure('public.kpi_ai_proposal_create(text,text,text,jsonb,uuid)') is not null;
$$;
notify pgrst,'reload schema';
commit;
