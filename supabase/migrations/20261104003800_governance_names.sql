begin;
-- The register and history already show these people's records to the reader; without their names they read as "Pengurus".
alter function public.kpi_governance_context() rename to kpi_governance_context_before_names;
revoke all on function public.kpi_governance_context_before_names() from public,anon,authenticated;
create function public.kpi_governance_context() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb:=public.kpi_governance_context_before_names();
begin
 return result||jsonb_build_object('accounts',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'name',u.display_name)),'[]'::jsonb) from identity.accounts u where u.id in (
  select (a->>'id')::uuid from jsonb_array_elements(result->'accounts') a
  union select (d->>'recipientAccountId')::uuid from jsonb_array_elements(result->'register') d
  union select (r->>'creatorAccountId')::uuid from jsonb_array_elements(result->'records') r
  union select (r->>'reviewerAccountId')::uuid from jsonb_array_elements(result->'records') r where r->>'reviewerAccountId' is not null
  union select (e->>'actorAccountId')::uuid from jsonb_array_elements(result->'records') r,jsonb_array_elements(r->'events') e
  union select (v->>'reviewerAccountId')::uuid from jsonb_array_elements(result->'reviews') v
  union select (v->>'verifiedByAccountId')::uuid from jsonb_array_elements(result->'reviews') v where v->>'verifiedByAccountId' is not null
  union select (c->>'accountId')::uuid from jsonb_array_elements(result->'conflicts') c)));
end $$;
revoke all on function public.kpi_governance_context() from public,anon,authenticated;
grant execute on function public.kpi_governance_context() to authenticated;
notify pgrst,'reload schema';
commit;
