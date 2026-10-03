begin;
create or replace function governance.grant_valid(g identity.permission_grants) returns boolean language sql stable security definer set search_path='' as $$
 select governance.grant_valid_sop_v11(g) and not exists(select 1 from governance.workflow_records r where r.kind='OFFBOARD' and r.status in ('APPROVED','IMPLEMENTED','CLOSED')
 and r.organization_id=g.organization_id and r.period_id=g.period_id and (r.payload->>'subjectAccountId')::uuid=g.account_id and (r.payload->>'effectiveAt')::timestamptz<=now()
 and (not coalesce((r.payload->'transitionDecisionIds')?g.decision_id::text,false) or coalesce((r.payload->>'transitionExpiresAt')::timestamptz,'-infinity'::timestamptz)<=now()));
$$;
notify pgrst,'reload schema';
commit;
