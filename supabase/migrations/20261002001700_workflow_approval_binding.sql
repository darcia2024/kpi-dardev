begin;
create or replace function public.kpi_governance_action(record_id uuid,expected_version integer,workflow_action text,input jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();item governance.workflow_records;a governance.access_authorities;data jsonb;approved text[];requested text[];p text;decision uuid;ids jsonb:='[]';target governance.access_decisions;
 resource governance.information_resources;entry jsonb;entries jsonb;entry_id uuid;other uuid;note text;reference text;can_handle boolean;can_approve boolean;
begin
 select * into item from governance.workflow_records where id=record_id for update;
 if item.id is null or actor is null or not governance.record_visible(item,actor) then raise exception 'Access denied' using errcode='42501';end if;
 if item.version<>expected_version then raise exception 'Record changed; refresh first' using errcode='40001';end if;
 if item.status in ('DENIED','CLOSED','COMPLETED') then raise exception 'Workflow finalized' using errcode='22023';end if;
 if input is null or octet_length(input::text)>16000 or input::text ~* '(21st_sk_|sk-proj-|eyJhbGciOi)' then raise exception 'Invalid action input' using errcode='22023';end if;
 data:=item.payload;note:=coalesce(input->>'note','');reference:=input->>'reference';if length(note)>2000 or length(coalesce(reference,''))>500 then raise exception 'Action too long' using errcode='22023';end if;
 if item.kind='ACCESS' then
  if workflow_action='DECIDE' then
   if item.status<>'SUBMITTED' or actor=item.creator_account_id or not governance.record_readable(item,actor) then raise exception 'Independent decision required' using errcode='42501';end if;
   select * into a from governance.access_authorities where id=(input->>'authorityId')::uuid for share;
   requested:=array(select jsonb_array_elements_text(data->'permissions'));
   if a.id is null or a.account_id<>actor or a.organization_id<>item.organization_id or a.period_id<>item.period_id or (a.division_id is not null and a.division_id is distinct from item.division_id)
   or not item.classification=any(a.classifications) or a.revoked_at is not null or a.starts_at>now() or a.expires_at<=now() or governance.has_conflict(actor,item.organization_id,item.period_id,(data->>'objectId')::uuid) then raise exception 'Decision mandate required' using errcode='42501';end if;
   reference:=governance.text_value(input,'reference',3,500);note:=governance.text_value(input,'note');perform governance.text_value(input,'needFinding');
   if input->>'outcome'='DENIED' then item.status:='DENIED';approved:='{}';
   elsif input->>'outcome' in ('APPROVED','PARTIAL') then
    if jsonb_typeof(input->'approvedPermissions')<>'array' then raise exception 'Approved permissions required' using errcode='22023';end if;
    approved:=array(select distinct jsonb_array_elements_text(input->'approvedPermissions'));
    if cardinality(approved)=0 or not approved<@requested or not approved<@a.permissions then raise exception 'Approval exceeds request or mandate' using errcode='42501';end if;
    if data->>'requestType'<>'GRANT' then
     select * into target from governance.access_decisions where id=(data->>'targetDecisionId')::uuid;
     if target.id is null or target.recipient_account_id<>item.creator_account_id or not target.permission=any(a.permissions) or not target.classification=any(a.classifications) or (a.division_id is not null and a.division_id is distinct from target.division_id) or governance.has_conflict(actor,target.organization_id,target.period_id,target.object_id) then raise exception 'Existing decision mandate required' using errcode='42501';end if;
    end if;
    if data->>'requestType'<>'REVOKE' then
     foreach p in array approved loop
      decision:=public.kpi_record_access_decision(jsonb_build_object('authorityId',a.id,'recipientAccountId',item.creator_account_id,'organizationId',item.organization_id,'periodId',item.period_id,'divisionId',item.division_id,'objectId',data->>'objectId',
      'classification',item.classification,'permission',p,'startsAt',data->>'startsAt','expiresAt',data->>'expiresAt','formReference',data->>'formReference','mandateReference',data->>'mandateReference','purpose',data->>'purpose','informationScope',data->>'informationScope','decisionReference',reference));
      ids:=ids||jsonb_build_array(decision);
     end loop;
    end if;
    item.status:=case when cardinality(approved)=cardinality(requested) then 'APPROVED' else 'PARTIAL' end;
   else raise exception 'Invalid decision outcome' using errcode='22023';end if;
   item.reviewer_account_id:=actor;data:=data||jsonb_build_object('approvedPermissions',approved,'decisionIds',ids,'decisionReference',reference,'needFinding',input->>'needFinding','decisionNote',note,'decidedAt',now(),'authorityId',a.id);
  elsif workflow_action='IMPLEMENT' then
   if item.status not in ('APPROVED','PARTIAL') or not identity.is_system_admin() or actor=item.creator_account_id then raise exception 'Technical implementation denied' using errcode='42501';end if;
   if data->>'requestType'='CHANGE' and (data->>'startsAt')::timestamptz>now() then raise exception 'Change not effective yet' using errcode='22023';end if;
   select * into a from governance.access_authorities where id=(data->>'authorityId')::uuid;
   if a.revoked_at is not null or a.expires_at<=now() or governance.has_conflict(item.reviewer_account_id,item.organization_id,item.period_id,(data->>'objectId')::uuid) then raise exception 'Decision mandate no longer valid' using errcode='42501';end if;
   for entry in select jsonb_array_elements(data->'decisionIds') loop perform public.kpi_apply_access_decision((entry#>>'{}')::uuid);end loop;
   if data->>'requestType' in ('CHANGE','REVOKE') then
    update governance.access_decisions set revoked_at=now() where id=(data->>'targetDecisionId')::uuid and recipient_account_id=item.creator_account_id;
    update identity.permission_grants set revoked_at=now() where decision_id=(data->>'targetDecisionId')::uuid and account_id=item.creator_account_id;
   end if;
   item.status:='IMPLEMENTED';data:=data||jsonb_build_object('implementedAt',now(),'implementedByAccountId',actor);reference:=governance.text_value(input,'reference',3,500);
  else raise exception 'Unsupported access action' using errcode='22023';end if;
 elsif item.kind='INCIDENT' then
  can_handle:=actor=item.handler_account_id and governance.authorized(actor,case when coalesce((data->>'personnelConcern')::boolean,false) then 'SOP_BPI_REVIEW' else 'SOP_INCIDENT_HANDLE' end,item.organization_id,item.period_id,item.division_id,item.classification,item.id);
  can_approve:=actor=item.reviewer_account_id and actor<>item.creator_account_id and actor is distinct from item.handler_account_id and governance.authorized(actor,'SOP_INCIDENT_APPROVE',item.organization_id,item.period_id,item.division_id,item.classification,item.id);
  if workflow_action='ASSIGN' then
   if actor=item.creator_account_id or not governance.authorized(actor,case when coalesce((data->>'personnelConcern')::boolean,false) then 'SOP_BPI_REVIEW' else 'SOP_INCIDENT_HANDLE' end,item.organization_id,item.period_id,item.division_id,item.classification,item.id) then raise exception 'Incident assignment mandate required' using errcode='42501';end if;
   other:=(input->>'handlerAccountId')::uuid;
   if other=item.creator_account_id or not governance.authorized(other,case when coalesce((data->>'personnelConcern')::boolean,false) then 'SOP_BPI_REVIEW' else 'SOP_INCIDENT_HANDLE' end,item.organization_id,item.period_id,item.division_id,item.classification,item.id) then raise exception 'Independent handler mandate required' using errcode='42501';end if;
   item.handler_account_id:=other;item.reviewer_account_id:=null;data:=data-'recoveryApprovedAt'-'recoveryApprovedBy'-'recoveryRequestedAt'-'recoveryApprovalReference';item.status:='SECURITY';note:=governance.text_value(input,'note');reference:=governance.text_value(input,'reference',3,500);
  elsif workflow_action='ACTION' then
   if not can_handle or input->>'phase' is null or input->>'phase' not in ('SECURITY','RECOVERY','INVESTIGATION','MONITORING') then raise exception 'Incident handling denied' using errcode='42501';end if;
   item.status:=input->>'phase';note:=governance.text_value(input,'note');reference:=governance.text_value(input,'reference',3,500);data:=data||jsonb_build_object('residualRisk',governance.text_value(input,'residualRisk'));
   data:=data-'recoveryApprovedAt'-'recoveryApprovedBy';
  elsif workflow_action='CORRECTION' then
   if not can_handle then raise exception 'Incident handling denied' using errcode='42501';end if;
   other:=(input->>'picAccountId')::uuid;if not governance.in_scope(other,item.organization_id,item.period_id,item.division_id) or input->>'dueAt' is null then raise exception 'Assigned PIC and deadline required' using errcode='22023';end if;
   note:=governance.text_value(input,'note');data:=jsonb_set(data,'{corrections}',(data->'corrections')||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'note',note,'picAccountId',other,'dueAt',(input->>'dueAt')::timestamptz)));
   data:=data-'recoveryApprovedAt'-'recoveryApprovedBy';
  elsif workflow_action='VERIFY_CORRECTION' then
   if not can_handle and not can_approve then raise exception 'Verification mandate required' using errcode='42501';end if;
   entry_id:=(input->>'entryId')::uuid;entries:='[]';other:=null;
   for entry in select jsonb_array_elements(data->'corrections') loop
    if (entry->>'id')::uuid=entry_id then if (entry->>'picAccountId')::uuid=actor then raise exception 'Independent verification required' using errcode='42501';end if;
     other:=entry_id;reference:=governance.text_value(input,'reference',3,500);entry:=entry||jsonb_build_object('verifiedAt',now(),'verifiedBy',actor,'reference',reference);end if;
    entries:=entries||jsonb_build_array(entry);
   end loop;if other is null then raise exception 'Correction not found' using errcode='22023';end if;data:=jsonb_set(data,'{corrections}',entries);
  elsif workflow_action='REQUEST_RECOVERY' then
   if not can_handle then raise exception 'Handler required' using errcode='42501';end if;
   other:=(input->>'reviewerAccountId')::uuid;
   if other in (actor,item.creator_account_id) or not governance.authorized(other,'SOP_INCIDENT_APPROVE',item.organization_id,item.period_id,item.division_id,item.classification,item.id) then raise exception 'Independent recovery approver required' using errcode='42501';end if;
   item.reviewer_account_id:=other;reference:=governance.text_value(input,'reference',3,500);data:=(data-'recoveryApprovedAt'-'recoveryApprovedBy')||jsonb_build_object('recoveryRequestedAt',now(),'recoveryReference',reference,'residualRisk',governance.text_value(input,'residualRisk'));
  elsif workflow_action='NOTICE_DECISION' then
   if not can_approve or input->>'outcome' is null or input->>'outcome' not in ('REQUIRED','NOT_REQUIRED','PENDING') then raise exception 'Notice decision mandate required' using errcode='42501';end if;
   note:=governance.text_value(input,'note');reference:=governance.text_value(input,'reference',3,500);data:=data||jsonb_build_object('noticeDecision',input->>'outcome','noticeBasis',note,'noticeApprover',actor,'noticeReference',reference);
  elsif workflow_action='APPROVE_RECOVERY' then
   if not can_approve or data->>'recoveryRequestedAt' is null or exists(select 1 from jsonb_array_elements(data->'corrections') e where e->>'verifiedAt' is null) then raise exception 'Recovery not ready or approver unauthorized' using errcode='42501';end if;
   reference:=governance.text_value(input,'reference',3,500);data:=data||jsonb_build_object('recoveryApprovedAt',now(),'recoveryApprovedBy',actor,'recoveryApprovalReference',reference);item.status:='MONITORING';
  elsif workflow_action='BPI_RESULT' then
   if not can_handle or not coalesce((data->>'personnelConcern')::boolean,false) then raise exception 'BPI mandate required' using errcode='42501';end if;
   reference:=governance.text_value(input,'reference',3,500);data:=data||jsonb_build_object('bpiResultReference',reference,'bpiStatus','RESULT_RECORDED');
  elsif workflow_action='CLOSE' then
   if not can_approve or data->>'recoveryApprovedAt' is null or coalesce(data->>'noticeDecision','PENDING')='PENDING' or exists(select 1 from jsonb_array_elements(data->'corrections') e where e->>'verifiedAt' is null) then raise exception 'Technical closure prerequisites missing' using errcode='42501';end if;
   reference:=governance.text_value(input,'reference',3,500);note:=governance.text_value(input,'note');item.status:='CLOSED';data:=data||jsonb_build_object('closedAt',now(),'closedBy',actor,'closureReference',reference);
  else raise exception 'Unsupported incident action' using errcode='22023';end if;
 elsif item.kind='OFFBOARD' then
  if workflow_action in ('CHECK','DETAIL','EXCEPTION','TRANSITION','SUBMIT') then
   if item.status<>'DRAFT' or (actor<>item.creator_account_id and not governance.authorized(actor,'SOP_OFFBOARD_MANAGE',item.organization_id,item.period_id,item.division_id,item.classification,item.id)) then raise exception 'Handover editing denied' using errcode='42501';end if;
   if workflow_action='CHECK' then
    if input->>'check' is null or input->>'check' not in ('basis','inventory','access','documents','responsibilities','accounts','evidence','copies','transition','confidentiality') or input->>'checkStatus' is null or input->>'checkStatus' not in ('DONE','PENDING','NA') then raise exception 'Invalid checklist entry' using errcode='22023';end if;
    note:=governance.text_value(input,'note');data:=jsonb_set(data,array['checklist',input->>'check'],jsonb_build_object('status',input->>'checkStatus','note',note,'actorAccountId',actor,'at',now()));
   elsif workflow_action='DETAIL' then
    note:=governance.text_value(input,'note');reference:=governance.text_value(input,'reference',3,500);data:=jsonb_set(data,'{details}',(data->'details')||jsonb_build_array(jsonb_build_object('note',note,'reference',reference,'actorAccountId',actor,'at',now())));
   elsif workflow_action='EXCEPTION' then
    note:=governance.text_value(input,'note');other:=(input->>'picAccountId')::uuid;if not governance.in_scope(other,item.organization_id,item.period_id) or input->>'dueAt' is null then raise exception 'Exception PIC and deadline required' using errcode='22023';end if;
    data:=jsonb_set(data,'{exceptions}',(data->'exceptions')||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'note',note,'picAccountId',other,'dueAt',(input->>'dueAt')::timestamptz,'basis',governance.text_value(input,'reference',3,500))));
   elsif workflow_action='TRANSITION' then
    if jsonb_typeof(input->'decisionIds')<>'array' or input->>'expiresAt' is null or input->>'revokerAccountId' is null then raise exception 'Approved transition required' using errcode='22023';end if;
    for entry in select jsonb_array_elements(input->'decisionIds') loop
     select * into target from governance.access_decisions where id=(entry#>>'{}')::uuid;
     if target.id is null or target.recipient_account_id<>(data->>'subjectAccountId')::uuid or target.organization_id<>item.organization_id or target.period_id<>item.period_id or target.revoked_at is not null or target.suspended_at is not null or target.implemented_at is null or target.expires_at>(input->>'expiresAt')::timestamptz then raise exception 'Transition decision invalid' using errcode='42501';end if;
    end loop;other:=(input->>'revokerAccountId')::uuid;
    if not exists(select 1 from identity.system_administrators s join identity.accounts u on u.id=s.account_id where s.account_id=other and s.revoked_at is null and u.status='ACTIVE') then raise exception 'Technical revoker required' using errcode='42501';end if;
    reference:=governance.text_value(input,'reference',3,500);data:=data||jsonb_build_object('transitionDecisionIds',input->'decisionIds','transitionExpiresAt',(input->>'expiresAt')::timestamptz,'transitionReference',reference,'revokerAccountId',other);
   else
    if exists(select 1 from unnest(array['basis','inventory','documents','responsibilities','accounts','evidence','copies','transition','confidentiality']) key where coalesce(data->'checklist'->key->>'status','PENDING') not in ('DONE','NA')) then raise exception 'Checklist incomplete' using errcode='22023';end if;
    item.status:='SUBMITTED';
   end if;
  elsif workflow_action='RECEIVE' then
   if item.status<>'SUBMITTED' or data->>'receivedAt' is not null or actor<>(data->>'successorAccountId')::uuid or actor=(data->>'subjectAccountId')::uuid then raise exception 'Successor required' using errcode='42501';end if;
   reference:=governance.text_value(input,'reference',3,500);data:=data||jsonb_build_object('receivedAt',now(),'receivedBy',actor,'receiptReference',reference);
  elsif workflow_action='APPROVE' then
   if item.status<>'SUBMITTED' or actor<>item.reviewer_account_id or actor=item.creator_account_id or actor=(data->>'subjectAccountId')::uuid or data->>'receivedAt' is null or not governance.authorized(actor,'SOP_OFFBOARD_VERIFY',item.organization_id,item.period_id,item.division_id,item.classification,item.id) then raise exception 'Independent handover verification required' using errcode='42501';end if;
   if coalesce((data->>'revokeTechnical')::boolean,false) and not governance.authorized(actor,'SOP_TECHNICAL_OFFBOARD',item.organization_id,item.period_id,item.division_id,item.classification,item.id) then raise exception 'Global technical offboarding mandate required' using errcode='42501';end if;
   reference:=governance.text_value(input,'reference',3,500);data:=data||jsonb_build_object('approvedAt',now(),'approvedBy',actor,'approvalReference',reference);item.status:='APPROVED';
  elsif workflow_action='IMPLEMENT' then
   if item.status<>'APPROVED' or not identity.is_system_admin() or actor=(data->>'subjectAccountId')::uuid or (data->>'effectiveAt')::timestamptz>now() then raise exception 'Technical offboarding implementation denied' using errcode='42501';end if;
   update governance.access_decisions d set revoked_at=coalesce(d.revoked_at,now()) where d.recipient_account_id=(data->>'subjectAccountId')::uuid and d.organization_id=item.organization_id and d.period_id=item.period_id and not (data->'transitionDecisionIds')?d.id::text;
   update identity.permission_grants g set revoked_at=coalesce(g.revoked_at,now()) where g.account_id=(data->>'subjectAccountId')::uuid and g.organization_id=item.organization_id and g.period_id=item.period_id and (g.decision_id is null or not (data->'transitionDecisionIds')?g.decision_id::text);
   if coalesce((data->>'revokeTechnical')::boolean,false) then update identity.system_administrators set revoked_at=now() where account_id=(data->>'subjectAccountId')::uuid;end if;
   reference:=governance.text_value(input,'reference',3,500);data:=jsonb_set(data||jsonb_build_object('implementedAt',now(),'implementedBy',actor),'{checklist,access}',jsonb_build_object('status','DONE','note',reference,'actorAccountId',actor,'at',now()));item.status:='IMPLEMENTED';
  elsif workflow_action='VERIFY_EXCEPTION' then
   if actor<>item.reviewer_account_id or not governance.authorized(actor,'SOP_OFFBOARD_VERIFY',item.organization_id,item.period_id,item.division_id,item.classification,item.id) then raise exception 'Verifier required' using errcode='42501';end if;
   entry_id:=(input->>'entryId')::uuid;entries:='[]';other:=null;reference:=governance.text_value(input,'reference',3,500);
   for entry in select jsonb_array_elements(data->'exceptions') loop if (entry->>'id')::uuid=entry_id then
    if actor=(entry->>'picAccountId')::uuid then raise exception 'Independent exception verification required' using errcode='42501';end if;
    other:=entry_id;entry:=entry||jsonb_build_object('verifiedAt',now(),'verifiedBy',actor,'reference',reference);end if;entries:=entries||jsonb_build_array(entry);end loop;
   if other is null then raise exception 'Exception not found' using errcode='22023';end if;data:=jsonb_set(data,'{exceptions}',entries);
  elsif workflow_action='CLOSE' then
   if item.status<>'IMPLEMENTED' or actor<>item.reviewer_account_id or not governance.authorized(actor,'SOP_OFFBOARD_VERIFY',item.organization_id,item.period_id,item.division_id,item.classification,item.id)
   or exists(select 1 from jsonb_array_elements(data->'exceptions') e where e->>'verifiedAt' is null) then raise exception 'Handover closure prerequisites missing' using errcode='42501';end if;
   reference:=governance.text_value(input,'reference',3,500);item.status:='CLOSED';data:=data||jsonb_build_object('verifiedAt',now(),'verifiedBy',actor,'verificationReference',reference);
  else raise exception 'Unsupported offboarding action' using errcode='22023';end if;
 elsif item.kind='CLASSIFICATION' then
  if workflow_action not in ('APPROVE','DENY') or item.status<>'SUBMITTED' or actor=item.creator_account_id then raise exception 'Independent classification decision required' using errcode='42501';end if;
  select * into resource from governance.information_resources where id=(data->>'objectId')::uuid for update;
  if resource.version<>(data->>'resourceVersion')::int then raise exception 'Resource classification changed' using errcode='40001';end if;
  p:=case data->>'mode' when 'HOLD' then 'INFORMATION_HOLD' when 'RELEASE' then 'INFORMATION_HOLD_RELEASE' else 'INFORMATION_CLASSIFY' end;
  if not governance.authorized(actor,p,item.organization_id,item.period_id,item.division_id,item.classification,resource.id) then raise exception 'Classification authority required' using errcode='42501';end if;
  reference:=governance.text_value(input,'reference',3,500);note:=governance.text_value(input,'note');
  if workflow_action='DENY' then item.status:='DENIED';
  else
   if data->>'mode'='CLASSIFY' and governance.classification_rank(data->>'newClassification')<governance.classification_rank(resource.classification)
   and not governance.authorized(actor,'INFORMATION_DECLASSIFY',item.organization_id,item.period_id,item.division_id,item.classification,resource.id) then raise exception 'Written declassification mandate required' using errcode='42501';end if;
   update governance.information_resources set classification=case when data->>'mode'='CLASSIFY' then data->>'newClassification' else classification end,
   classification_reference=case when data->>'mode'='CLASSIFY' then reference else classification_reference end,
   hold_reference=case data->>'mode' when 'HOLD' then reference when 'RELEASE' then null else hold_reference end,version=version+1 where id=resource.id;
   item.status:='COMPLETED';
  end if;item.reviewer_account_id:=actor;data:=data||jsonb_build_object('decisionReference',reference,'decisionNote',note,'decidedAt',now(),'decidedBy',actor);
 end if;
 update governance.workflow_records set status=item.status,payload=data,handler_account_id=item.handler_account_id,reviewer_account_id=item.reviewer_account_id,version=version+1,updated_at=now() where id=item.id returning * into item;
 insert into governance.workflow_events(record_id,actor_account_id,action,note,reference,version) values(item.id,actor,workflow_action,note,reference,item.version);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('SOP_WORKFLOW_'||workflow_action,'governance',item.kind,item.id,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'version',item.version));
 return governance.record_json(item);
exception when invalid_text_representation or datetime_field_overflow then raise exception 'Invalid workflow action' using errcode='22023';end $$;
notify pgrst,'reload schema';
commit;
