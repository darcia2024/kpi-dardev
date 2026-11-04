begin;
-- The SOP v1.1 workflow functions stay as they are; these wrappers add the rules decided on 4 November 2026.
alter function public.kpi_governance_context() rename to kpi_governance_context_v11;
alter function public.kpi_governance_create(text,jsonb,uuid) rename to kpi_governance_create_v11;
alter function public.kpi_governance_action(uuid,integer,text,jsonb) rename to kpi_governance_action_v11;
revoke all on function public.kpi_governance_context_v11(),public.kpi_governance_create_v11(text,jsonb,uuid),public.kpi_governance_action_v11(uuid,integer,text,jsonb) from public,anon,authenticated;

create function governance.resource_read_permission(resource_kind text) returns text language sql immutable set search_path='' as $$
 select case resource_kind when 'ASSET' then 'ASSET_READ' when 'MEETING' then 'MEETING_READ' when 'CASE' then 'CASE_READ' when 'TASK' then 'TASK_READ'
 when 'KNOWLEDGE' then 'KNOWLEDGE_READ' when 'BUDGET' then 'FINANCE_READ' when 'FINANCE' then 'FINANCE_READ' when 'EVALUATION' then 'EVALUATION_READ' when 'HANDOVER' then 'HANDOVER_READ' else null end;
$$;
create function governance.resource_division(resource_id uuid) returns uuid language sql stable security definer set search_path='' as $$
 select coalesce((select division_id from files.managed_assets where id=resource_id),(select division_id from work.meetings where id=resource_id));
$$;

create function public.kpi_governance_context() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();
begin
 return public.kpi_governance_context_v11()||jsonb_build_object(
 'reviews',(select coalesce(jsonb_agg(jsonb_build_object('id',v.id,'decisionId',v.decision_id,'reviewerAccountId',v.reviewer_account_id,'trigger',v.trigger_reason,'finding',v.finding,'followUp',v.follow_up,'picAccountId',v.pic_account_id,'dueAt',v.due_at,'createdAt',v.created_at,'verifiedAt',v.verified_at,'verifiedByAccountId',v.verified_by_account_id,'verificationReference',v.verification_reference,'suspensionReason',v.suspension_reason,'suspensionReference',v.suspension_reference,'suspendedByAccountId',v.suspended_by_account_id,'suspendedAt',v.suspended_at) order by v.created_at desc),'[]'::jsonb)
 from governance.access_reviews v join governance.access_decisions d on d.id=v.decision_id where actor in (v.reviewer_account_id,v.pic_account_id,d.recipient_account_id) or governance.authorized(actor,'SOP_ACCESS_REVIEW',d.organization_id,d.period_id,d.division_id,d.classification,d.object_id)),
 'resources',(select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'organizationId',r.organization_id,'periodId',r.period_id,'kind',r.kind,'classification',r.classification,'version',r.version,'held',r.hold_reference is not null)),'[]'::jsonb)
 from governance.information_resources r where exists(select 1 from governance.access_authorities a where a.account_id=actor and a.organization_id=r.organization_id and a.period_id=r.period_id and a.division_id is null and a.revoked_at is null and a.starts_at<=now() and a.expires_at>now() and a.permissions&&array['INFORMATION_CLASSIFY','INFORMATION_HOLD','INFORMATION_HOLD_RELEASE'] and r.classification=any(a.classifications) and not governance.has_conflict(actor,r.organization_id,r.period_id,r.id))
 or (governance.resource_read_permission(r.kind) is not null and identity.has_permission(governance.resource_read_permission(r.kind),r.organization_id,r.period_id,governance.resource_division(r.id),r.id))),
 'divisions',(select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'organizationId',d.organization_id,'code',d.code,'name',d.name) order by d.name),'[]'::jsonb) from org.divisions d where exists(select 1 from org.periods p where p.organization_id=d.organization_id and governance.in_scope(actor,d.organization_id,p.id))),
 'conflicts',(select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'accountId',c.account_id,'organizationId',c.organization_id,'periodId',c.period_id,'objectId',c.object_id,'reference',c.reference,'startsAt',c.starts_at,'endsAt',c.ends_at) order by c.starts_at desc),'[]'::jsonb)
 from governance.conflicts c where c.revoked_at is null and (c.ends_at is null or c.ends_at>now()) and (c.account_id=actor or identity.is_super_admin(c.organization_id) or exists(select 1 from governance.access_authorities a where a.account_id=actor and a.organization_id=c.organization_id and a.period_id=c.period_id and 'SOP_ACCESS_REVIEW'=any(a.permissions) and a.revoked_at is null and a.starts_at<=now() and a.expires_at>now()))));
end $$;

create function public.kpi_governance_create(record_kind text,input jsonb,request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare actor uuid:=identity.current_account_id();oid uuid:=(input->>'organizationId')::uuid;pid uuid:=(input->>'periodId')::uuid;did uuid:=(input->>'divisionId')::uuid;entity uuid:=(input->>'objectId')::uuid;class text:=coalesce(input->>'classification','RAHASIA');
 starting timestamptz:=(input->>'startsAt')::timestamptz;ending timestamptz:=(input->>'expiresAt')::timestamptz;target governance.access_decisions;item governance.workflow_records;data jsonb;resource governance.information_resources;
begin
 if actor is null or request_key is null or not governance.in_scope(actor,oid,pid,did) then raise exception 'Scope denied' using errcode='42501';end if;
 if exists(select 1 from governance.workflow_records w where w.creator_account_id=actor and w.request_key=request_key) then return public.kpi_governance_create_v11(record_kind,input,request_key);end if;
 if record_kind='CLASSIFICATION' then
  select * into resource from governance.information_resources where id=entity;
  -- Same answer whether the object is missing or out of division, so its existence is not revealed.
  if resource.id is null or governance.resource_division(resource.id) is distinct from did and did is not null then raise exception 'Resource scope denied' using errcode='42501';end if;
 elsif record_kind='ACCESS' and input->>'requestType'='REVOKE' then
  select * into target from governance.access_decisions where id=(input->>'targetDecisionId')::uuid;
  if target.id is not null and target.recipient_account_id<>actor then
   if input is null or octet_length(input::text)>16000 or input::text ~* '(21st_sk_|sk-proj-|eyJhbGciOi)' then raise exception 'Invalid or credential-bearing input' using errcode='22023';end if;
   if target.organization_id<>oid or target.period_id<>pid or target.revoked_at is not null or not (governance.authorized(actor,target.permission,oid,pid,target.division_id,target.classification,target.object_id) or governance.authorized(actor,'SOP_ACCESS_REVIEW',oid,pid,target.division_id,target.classification,target.object_id)) then raise exception 'Revocation mandate required' using errcode='42501';end if;
   data:=jsonb_build_object('formReference',governance.text_value(input,'formReference',3,150),'requestType','REVOKE','permissions',jsonb_build_array(target.permission),'purpose',governance.text_value(input,'purpose'),'informationScope',governance.text_value(input,'informationScope'),'mandateReference',governance.text_value(input,'mandateReference',3,500),'startsAt',input->>'startsAt','expiresAt',input->>'expiresAt','objectId',target.object_id,'targetDecisionId',target.id,'endCondition','','subjectAccountId',target.recipient_account_id,'submission',input);
   insert into governance.workflow_records(kind,organization_id,period_id,division_id,creator_account_id,classification,payload,request_key,status) values('ACCESS',oid,pid,target.division_id,actor,target.classification,data,request_key,'SUBMITTED') returning * into item;
   insert into governance.workflow_events(record_id,actor_account_id,action,note,version) values(item.id,actor,'CREATED','Pengajuan pencabutan tersimpan.',1);
   insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('SOP_WORKFLOW_CREATED','governance','ACCESS',item.id,'SUCCESS',request_key::text,jsonb_build_object('actorAccountId',actor,'subjectAccountId',target.recipient_account_id));
   return governance.record_json(item);
  end if;
 elsif record_kind='ACCESS' then
  -- These used to pass here and only fail at decision or implementation, leaving the request stuck.
  if class='RAHASIA' and entity is null then raise exception 'Secret access requires an identified information object' using errcode='22023';end if;
  if entity is not null and not exists(select 1 from governance.information_resources r where r.id=entity and r.organization_id=oid and r.period_id=pid and governance.classification_rank(class)>=governance.classification_rank(r.classification)) then raise exception 'Information scope or classification invalid' using errcode='22023';end if;
  if starting is not null and ending is not null and not exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id where s.account_id=actor and s.period_id=pid and p.organization_id=oid and (did is null or p.division_id=did) and s.starts_on<=starting::date and (s.ends_on is null or s.ends_on>=ending::date)) then raise exception 'Access dates must fall within the assignment' using errcode='22023';end if;
 end if;
 return public.kpi_governance_create_v11(record_kind,input,request_key);
exception when invalid_text_representation or datetime_field_overflow or invalid_datetime_format then raise exception 'Invalid workflow values' using errcode='22023';
end $$;

create function governance.finish_access_step(item governance.workflow_records,actor uuid,step text,note text,reference text) returns jsonb language plpgsql security definer set search_path='' as $$
declare saved governance.workflow_records;
begin
 update governance.workflow_records set status=item.status,payload=item.payload,reviewer_account_id=item.reviewer_account_id,version=version+1,updated_at=now() where id=item.id returning * into saved;
 insert into governance.workflow_events(record_id,actor_account_id,action,note,reference,version) values(saved.id,actor,step,coalesce(note,''),reference,saved.version);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('SOP_WORKFLOW_'||step,'governance',saved.kind,saved.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'version',saved.version));
 return governance.record_json(saved);
end $$;

create function public.kpi_governance_action(record_id uuid,expected_version integer,workflow_action text,input jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();item governance.workflow_records;a governance.access_authorities;target governance.access_decisions;result jsonb;reference text;note text;subject uuid;outcome text;
begin
 select * into item from governance.workflow_records where id=record_id for update;
 if item.id is null or item.kind<>'ACCESS' then return public.kpi_governance_action_v11(record_id,expected_version,workflow_action,input);end if;
 if actor is null or not governance.record_visible(item,actor) then raise exception 'Access denied' using errcode='42501';end if;
 if item.version<>expected_version then raise exception 'Record changed; refresh first' using errcode='40001';end if;
 if item.status in ('DENIED','CLOSED','COMPLETED') then raise exception 'Workflow finalized' using errcode='22023';end if;
 subject:=(item.payload->>'subjectAccountId')::uuid;outcome:=input->>'outcome';

 if workflow_action='WITHDRAW' then
  if item.status<>'SUBMITTED' or actor<>item.creator_account_id then raise exception 'Only the requester can withdraw a pending request' using errcode='42501';end if;
  item.status:='CLOSED';item.payload:=item.payload||jsonb_build_object('withdrawnAt',now());
  return governance.finish_access_step(item,actor,'WITHDRAW',coalesce(nullif(trim(input->>'note'),''),'Pengajuan ditarik pemohon.'),null);
 elsif workflow_action='CANCEL' then
  if item.status not in ('APPROVED','PARTIAL') or not (identity.is_system_admin() or actor=item.reviewer_account_id) then raise exception 'Cancellation not authorized' using errcode='42501';end if;
  reference:=governance.text_value(input,'reference',3,500);note:=governance.text_value(input,'note');
  update governance.access_decisions set revoked_at=now() where implemented_at is null and id in (select (e#>>'{}')::uuid from jsonb_array_elements(coalesce(item.payload->'decisionIds','[]'::jsonb)) e);
  item.status:='CLOSED';item.payload:=item.payload||jsonb_build_object('cancelledAt',now(),'cancelledByAccountId',actor);
  return governance.finish_access_step(item,actor,'CANCEL',note,reference);
 end if;

 if workflow_action='DECIDE' then
  select * into a from governance.access_authorities where id=(input->>'authorityId')::uuid for share;
  if outcome in ('APPROVED','PARTIAL') and item.classification='RAHASIA' and (a.id is null or not 'SOP_SECRET_APPROVE'=any(a.permissions)) then raise exception 'Secret approval mandate required' using errcode='42501';end if;
  if subject is not null then
   select * into target from governance.access_decisions where id=(item.payload->>'targetDecisionId')::uuid;
   if item.status<>'SUBMITTED' or actor in (item.creator_account_id,subject) or a.id is null or a.account_id<>actor or a.organization_id<>item.organization_id or a.period_id<>item.period_id or (a.division_id is not null and a.division_id is distinct from item.division_id)
   or not item.classification=any(a.classifications) or not target.permission=any(a.permissions) or a.revoked_at is not null or a.starts_at>now() or a.expires_at<=now() or governance.has_conflict(actor,item.organization_id,item.period_id,target.object_id) then raise exception 'Independent decision required' using errcode='42501';end if;
   reference:=governance.text_value(input,'reference',3,500);note:=governance.text_value(input,'note');perform governance.text_value(input,'needFinding');
   if outcome='DENIED' then item.status:='DENIED';elsif outcome in ('APPROVED','PARTIAL') then item.status:='APPROVED';else raise exception 'Invalid decision outcome' using errcode='22023';end if;
   item.reviewer_account_id:=actor;item.payload:=item.payload||jsonb_build_object('approvedPermissions',case when outcome='DENIED' then '[]'::jsonb else item.payload->'permissions' end,'decisionIds','[]'::jsonb,'decisionReference',reference,'needFinding',input->>'needFinding','decisionNote',note,'decidedAt',now(),'authorityId',a.id);
   result:=governance.finish_access_step(item,actor,'DECIDE',note,reference);
  else
   result:=public.kpi_governance_action_v11(record_id,expected_version,workflow_action,input);
  end if;
  -- Record the outcome in the history itself; the note alone did not say what was decided.
  update governance.workflow_events e set note=case outcome when 'APPROVED' then 'Hasil: disetujui. ' when 'PARTIAL' then 'Hasil: disetujui sebagian. ' else 'Hasil: ditolak. ' end||e.note where e.record_id=item.id and e.version=(result->>'version')::integer;
  select * into item from governance.workflow_records where id=record_id;
  return governance.record_json(item);
 elsif workflow_action='IMPLEMENT' and item.payload->>'requestType'='REVOKE' then
  -- Ending access must not depend on the approver's mandate still being valid.
  if item.status not in ('APPROVED','PARTIAL') or not identity.is_system_admin() or actor=item.creator_account_id then raise exception 'Technical implementation denied' using errcode='42501';end if;
  reference:=governance.text_value(input,'reference',3,500);
  update governance.access_decisions set revoked_at=now() where id=(item.payload->>'targetDecisionId')::uuid and recipient_account_id=coalesce(subject,item.creator_account_id);
  update identity.permission_grants set revoked_at=now() where decision_id=(item.payload->>'targetDecisionId')::uuid and account_id=coalesce(subject,item.creator_account_id);
  item.status:='IMPLEMENTED';item.payload:=item.payload||jsonb_build_object('implementedAt',now(),'implementedByAccountId',actor);
  return governance.finish_access_step(item,actor,'IMPLEMENT',coalesce(input->>'note',''),reference);
 end if;
 return public.kpi_governance_action_v11(record_id,expected_version,workflow_action,input);
exception when invalid_text_representation or datetime_field_overflow then raise exception 'Invalid workflow action' using errcode='22023';
end $$;

-- Conflict of interest: anyone may declare their own; ending one needs someone else with review authority.
create function public.kpi_conflict_action(command text,input jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();oid uuid;pid uuid;subject uuid;item governance.conflicts;result uuid;
begin
 if actor is null or input is null then raise exception 'Access denied' using errcode='42501';end if;
 if command='DECLARE' then
  oid:=(input->>'organizationId')::uuid;pid:=(input->>'periodId')::uuid;subject:=coalesce((input->>'accountId')::uuid,actor);
  if not governance.in_scope(actor,oid,pid) or (subject<>actor and not identity.is_super_admin(oid) and not exists(select 1 from governance.access_authorities a where a.account_id=actor and a.organization_id=oid and a.period_id=pid and 'SOP_ACCESS_REVIEW'=any(a.permissions) and a.revoked_at is null and a.starts_at<=now() and a.expires_at>now())) then raise exception 'Conflict declaration denied' using errcode='42501';end if;
  insert into governance.conflicts(account_id,organization_id,period_id,object_id,reference) values(subject,oid,pid,(input->>'objectId')::uuid,governance.text_value(input,'reference',3,500)) returning id into result;
 elsif command='END' then
  select * into item from governance.conflicts where id=(input->>'id')::uuid for update;
  if item.id is null or item.revoked_at is not null or actor=item.account_id or not (identity.is_super_admin(item.organization_id) or exists(select 1 from governance.access_authorities a where a.account_id=actor and a.organization_id=item.organization_id and a.period_id=item.period_id and 'SOP_ACCESS_REVIEW'=any(a.permissions) and a.revoked_at is null and a.starts_at<=now() and a.expires_at>now())) then raise exception 'Independent conflict review required' using errcode='42501';end if;
  perform governance.text_value(input,'reference',3,500);
  update governance.conflicts set revoked_at=now() where id=item.id;result:=item.id;
 else raise exception 'Unknown conflict action' using errcode='22023';end if;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('SOP_CONFLICT_'||command,'governance','conflict',result,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'reference',trim(input->>'reference')));
 return result;
exception when invalid_text_representation then raise exception 'Invalid conflict input' using errcode='22023';
end $$;

revoke all on function governance.resource_read_permission(text),governance.resource_division(uuid),governance.finish_access_step(governance.workflow_records,uuid,text,text,text),public.kpi_governance_context(),public.kpi_governance_create(text,jsonb,uuid),public.kpi_governance_action(uuid,integer,text,jsonb),public.kpi_conflict_action(text,jsonb) from public,anon,authenticated;
grant execute on function public.kpi_governance_context(),public.kpi_governance_create(text,jsonb,uuid),public.kpi_governance_action(uuid,integer,text,jsonb),public.kpi_conflict_action(text,jsonb) to authenticated;
insert into audit.audit_events(action,module,entity_type,result,request_id,metadata) values('SOP_POLICY_APPLIED','governance','policy','SUCCESS','migration:20261104003600',jsonb_build_object('document','002/SOP/KPI/X/2026','version','1.1','change','Secret approvals need SOP_SECRET_APPROVE; default pending KPI ratification'));
notify pgrst,'reload schema';
commit;
