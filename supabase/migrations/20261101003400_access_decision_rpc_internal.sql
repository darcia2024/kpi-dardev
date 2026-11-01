begin;
-- Access decisions are recorded and applied only from inside kpi_governance_action (F01 DECIDE / IMPLEMENT),
-- so every grant has a request, a requester and workflow history. Direct calls skipped all three.
revoke all on function public.kpi_record_access_decision(jsonb),public.kpi_apply_access_decision(uuid) from public,anon,authenticated;
insert into audit.audit_events(action,module,entity_type,result,request_id,metadata) values('SOP_POLICY_APPLIED','governance','policy','SUCCESS','migration:20261101003400',jsonb_build_object('document','002/SOP/KPI/X/2026','version','1.1','change','Access decisions can only be recorded and applied through the F01 workflow'));
notify pgrst,'reload schema';
commit;
