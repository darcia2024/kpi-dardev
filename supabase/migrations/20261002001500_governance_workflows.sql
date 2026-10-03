begin;
alter table governance.information_resources add column version integer not null default 1;
create table governance.workflow_records(
 id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('ACCESS','INCIDENT','OFFBOARD','CLASSIFICATION')),
 organization_id uuid not null references org.organizations(id),period_id uuid not null references org.periods(id),division_id uuid references org.divisions(id),
 creator_account_id uuid not null references identity.accounts(id),handler_account_id uuid references identity.accounts(id),reviewer_account_id uuid references identity.accounts(id),
 classification text not null check(classification in ('INTERNAL','TERBATAS','RAHASIA')),status text not null default 'SUBMITTED',version integer not null default 1,
 request_key uuid not null,payload jsonb not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(creator_account_id,request_key)
);
create table governance.workflow_events(
 id uuid primary key default gen_random_uuid(),record_id uuid not null references governance.workflow_records(id),actor_account_id uuid not null references identity.accounts(id),
 action text not null,note text not null default '',reference text,created_at timestamptz not null default now(),version integer not null,unique(record_id,version)
);
create table governance.access_reviews(
 id uuid primary key default gen_random_uuid(),decision_id uuid not null references governance.access_decisions(id),reviewer_account_id uuid not null references identity.accounts(id),
 trigger_reason text not null check(trigger_reason in ('PERIODIC','ASSIGNMENT_CHANGE','OFFBOARD','CONFLICT','INCIDENT')),finding text not null,
 follow_up text not null,pic_account_id uuid not null references identity.accounts(id),due_at timestamptz not null,verified_at timestamptz,verified_by_account_id uuid references identity.accounts(id),verification_reference text,suspension_reason text,suspension_reference text,suspended_by_account_id uuid references identity.accounts(id),suspended_at timestamptz,
 created_at timestamptz not null default now()
);
alter table governance.workflow_records enable row level security;
alter table governance.workflow_events enable row level security;
alter table governance.access_reviews enable row level security;
revoke all on governance.workflow_records,governance.workflow_events,governance.access_reviews from public,anon,authenticated;
create function governance.text_value(input jsonb,key text,minimum integer default 3,maximum integer default 2000) returns text language plpgsql immutable set search_path='' as $$
declare value text:=trim(input->>key);
begin if value is null or length(value)<minimum or length(value)>maximum then raise exception 'Invalid field: %',key using errcode='22023';end if;return value;end $$;
create function governance.authorized(actor uuid,capability text,oid uuid,pid uuid,did uuid,class text,entity uuid default null) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from governance.access_authorities a join identity.accounts u on u.id=a.account_id where a.account_id=actor and u.status='ACTIVE' and u.deactivated_at is null
 and a.organization_id=oid and a.period_id=pid and (a.division_id is null or a.division_id=did) and capability=any(a.permissions) and class=any(a.classifications)
 and a.starts_at<=now() and a.expires_at>now() and a.revoked_at is null and not governance.has_conflict(actor,oid,pid,entity));
$$;
create function governance.in_scope(actor uuid,oid uuid,pid uuid,did uuid default null) returns boolean language sql stable security definer set search_path='' as $$
 select actor is not null and exists(select 1 from org.periods where id=pid and organization_id=oid and status<>'CLOSED')
 and (did is null or exists(select 1 from org.divisions where id=did and organization_id=oid)) and
 (identity.is_system_admin() or exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id where s.account_id=actor and s.period_id=pid and p.organization_id=oid
 and (s.ends_on is null or s.ends_on>=current_date)) or exists(select 1 from governance.access_authorities where account_id=actor and organization_id=oid and period_id=pid and revoked_at is null and expires_at>now()));
$$;
create function governance.record_readable(item governance.workflow_records,actor uuid) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((actor=item.creator_account_id or (item.kind='OFFBOARD' and actor in ((item.payload->>'subjectAccountId')::uuid,(item.payload->>'successorAccountId')::uuid))
 or (actor in (item.handler_account_id,item.reviewer_account_id) and governance.authorized(actor,case when item.kind='INCIDENT' and actor=item.reviewer_account_id then 'SOP_INCIDENT_APPROVE' when item.kind='INCIDENT' and coalesce((item.payload->>'personnelConcern')::boolean,false) then 'SOP_BPI_REVIEW' when item.kind='INCIDENT' then 'SOP_INCIDENT_HANDLE' else 'SOP_OFFBOARD_VERIFY' end,item.organization_id,item.period_id,item.division_id,item.classification,item.id))
 or (item.kind='ACCESS' and exists(select 1 from governance.access_authorities a where a.account_id=actor and a.organization_id=item.organization_id and a.period_id=item.period_id
 and (a.division_id is null or a.division_id=item.division_id) and item.classification=any(a.classifications) and a.permissions&&(array(select jsonb_array_elements_text(item.payload->'permissions')))
 and a.starts_at<=now() and a.expires_at>now() and a.revoked_at is null and not governance.has_conflict(actor,item.organization_id,item.period_id,(item.payload->>'objectId')::uuid)))
 or (item.kind='CLASSIFICATION' and governance.authorized(actor,case item.payload->>'mode' when 'HOLD' then 'INFORMATION_HOLD' when 'RELEASE' then 'INFORMATION_HOLD_RELEASE' else 'INFORMATION_CLASSIFY' end,item.organization_id,item.period_id,item.division_id,item.classification,(item.payload->>'objectId')::uuid))),false);
$$;
create function governance.record_visible(item governance.workflow_records,actor uuid) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((governance.record_readable(item,actor) or (identity.is_system_admin() and item.kind in ('ACCESS','OFFBOARD') and item.status in ('APPROVED','PARTIAL','IMPLEMENTED','CLOSED'))
 or (item.kind='INCIDENT' and governance.authorized(actor,case when coalesce((item.payload->>'personnelConcern')::boolean,false) then 'SOP_BPI_REVIEW' else 'SOP_INCIDENT_HANDLE' end,item.organization_id,item.period_id,item.division_id,item.classification,item.id))),false);
$$;
create function governance.record_json(item governance.workflow_records) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',item.id,'kind',item.kind,'organizationId',item.organization_id,'periodId',item.period_id,'divisionId',item.division_id,'creatorAccountId',item.creator_account_id,
 'handlerAccountId',item.handler_account_id,'reviewerAccountId',item.reviewer_account_id,'classification',item.classification,'status',item.status,'version',item.version,'createdAt',item.created_at,'updatedAt',item.updated_at,
 'canRead',governance.record_readable(item,identity.current_account_id()),'payload',case when governance.record_readable(item,identity.current_account_id()) then case when item.kind='INCIDENT' and identity.current_account_id()=item.creator_account_id and not (identity.current_account_id() in (coalesce(item.handler_account_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(item.reviewer_account_id,'00000000-0000-0000-0000-000000000000'::uuid))) then item.payload->'submission' else item.payload-'submission' end
 else (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from jsonb_each(item.payload) where key=any(array['formReference','requestType','permissions','approvedPermissions','decisionIds','decisionReference','targetDecisionId','objectId','startsAt','expiresAt','effectiveAt','subjectAccountId','successorAccountId','verifierAccountId','transitionDecisionIds','transitionExpiresAt','revokeTechnical','implementedAt','incidentType','personnelConcern','affectedClassification'])) end,
 'events',case when governance.record_readable(item,identity.current_account_id()) then (select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'action',e.action,'note',e.note,'reference',e.reference,'actorAccountId',e.actor_account_id,'at',e.created_at,'version',e.version) order by e.version),'[]'::jsonb) from governance.workflow_events e where e.record_id=item.id and (item.kind<>'INCIDENT' or identity.current_account_id()<>item.creator_account_id or e.action='CREATED' or identity.current_account_id() in (item.handler_account_id,item.reviewer_account_id))) else '[]'::jsonb end);
$$;
create function public.kpi_governance_context() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();
begin
 if actor is null then raise exception 'Access denied' using errcode='42501';end if;
 return jsonb_build_object('scopes',(select coalesce(jsonb_agg(jsonb_build_object('organizationId',o.id,'organizationCode',o.code,'periodId',p.id,'periodCode',p.code,'startsOn',p.starts_on,'endsOn',p.ends_on,'status',p.status)),'[]'::jsonb)
 from org.organizations o join org.periods p on p.organization_id=o.id where governance.in_scope(actor,o.id,p.id)),
 'authorities',(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'accountId',a.account_id,'organizationId',a.organization_id,'periodId',a.period_id,'divisionId',a.division_id,'permissions',a.permissions,'classifications',a.classifications,'mandateReference',case when a.account_id=actor then a.mandate_reference else null end,'expiresAt',a.expires_at)),'[]'::jsonb)
 from governance.access_authorities a where a.starts_at<=now() and a.expires_at>now() and a.revoked_at is null and governance.in_scope(actor,a.organization_id,a.period_id)),
 'accounts',(select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'name',u.display_name)),'[]'::jsonb) from identity.accounts u where u.status='ACTIVE' and u.deactivated_at is null and
 (u.id=actor or identity.is_system_admin() or exists(select 1 from governance.access_authorities a where a.account_id=u.id and a.revoked_at is null and a.expires_at>now() and governance.in_scope(actor,a.organization_id,a.period_id)) or
 exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id where s.account_id=u.id and (s.ends_on is null or s.ends_on>=current_date) and governance.authorized(actor,'SOP_OFFBOARD_MANAGE',p.organization_id,s.period_id,p.division_id,'INTERNAL')))),
 'records',(select coalesce(jsonb_agg(governance.record_json(r) order by r.updated_at desc),'[]'::jsonb) from (select * from governance.workflow_records wr where governance.record_visible(wr,actor) order by updated_at desc limit 100) r),
 'register',public.kpi_access_register(),
 'reviews',(select coalesce(jsonb_agg(jsonb_build_object('id',v.id,'decisionId',v.decision_id,'reviewerAccountId',v.reviewer_account_id,'trigger',v.trigger_reason,'finding',v.finding,'followUp',v.follow_up,'picAccountId',v.pic_account_id,'dueAt',v.due_at,'verifiedAt',v.verified_at,'verificationReference',v.verification_reference,'suspensionReason',v.suspension_reason,'suspensionReference',v.suspension_reference,'suspendedAt',v.suspended_at)),'[]'::jsonb)
 from governance.access_reviews v join governance.access_decisions d on d.id=v.decision_id where actor in (v.reviewer_account_id,v.pic_account_id,d.recipient_account_id)),
 'resources',(select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'organizationId',r.organization_id,'periodId',r.period_id,'kind',r.kind,'classification',r.classification,'version',r.version,'held',r.hold_reference is not null)),'[]'::jsonb)
 from governance.information_resources r where exists(select 1 from governance.access_authorities a where a.account_id=actor and a.organization_id=r.organization_id and a.period_id=r.period_id and a.division_id is null and a.revoked_at is null and a.starts_at<=now() and a.expires_at>now() and a.permissions&&array['INFORMATION_CLASSIFY','INFORMATION_HOLD','INFORMATION_HOLD_RELEASE'] and r.classification=any(a.classifications) and not governance.has_conflict(actor,r.organization_id,r.period_id,r.id))
 or identity.has_permission(case r.kind when 'ASSET' then 'ASSET_READ' else 'CASE_READ' end,r.organization_id,r.period_id,null,r.id)));
end $$;
create function public.kpi_governance_create(record_kind text,input jsonb,request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare actor uuid:=identity.current_account_id();oid uuid:=(input->>'organizationId')::uuid;pid uuid:=(input->>'periodId')::uuid;did uuid:=(input->>'divisionId')::uuid;item governance.workflow_records;data jsonb;class text;resource governance.information_resources;target governance.access_decisions;permission text;
begin
 if not governance.in_scope(actor,oid,pid,did) or request_key is null then raise exception 'Scope denied' using errcode='42501';end if;
 if input is null or octet_length(input::text)>16000 or input::text ~* '(21st_sk_|sk-proj-|eyJhbGciOi)' then raise exception 'Invalid or credential-bearing input' using errcode='22023';end if;
 class:=coalesce(input->>'classification','RAHASIA');if class not in ('INTERNAL','TERBATAS','RAHASIA') then raise exception 'Invalid classification' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text||request_key::text,0));
 select * into item from governance.workflow_records where creator_account_id=actor and governance.workflow_records.request_key=request_key;
 if item.id is not null then if item.kind<>record_kind or item.payload->'submission' is distinct from input then raise exception 'Request key already used' using errcode='40001';end if;return governance.record_json(item);end if;
 if record_kind='ACCESS' then
  if input->>'requestType' is null or input->>'requestType' not in ('GRANT','CHANGE','REVOKE','RESTORE') or input->'permissions' is null or jsonb_typeof(input->'permissions')<>'array' or jsonb_array_length(input->'permissions') not between 1 and 40 then raise exception 'Invalid access request' using errcode='22023';end if;
  for permission in select jsonb_array_elements_text(input->'permissions') loop
   if permission not in ('SYSTEM_CONFIGURATION_READ','IDENTITY_READ','IDENTITY_MANAGE','WORKSPACE_READ','TASK_READ','TASK_CREATE','TASK_SUBMIT','TASK_REVIEW','MEETING_READ','MEETING_MANAGE','FINANCE_READ','FINANCE_MANAGE','FINANCE_APPROVE_FINAL','EVALUATION_READ','EVALUATION_WRITE','KNOWLEDGE_READ','KNOWLEDGE_WRITE','KNOWLEDGE_REVIEW','HANDOVER_READ','HANDOVER_ACCEPT','AI_READ','AI_ACTION_CONFIRM','CONTENT_DRAFT_WRITE','CONTENT_REVIEW','CONTENT_PUBLISH','ASSET_UPLOAD','ASSET_READ','ASSET_DOWNLOAD','ASPIRATION_TRIAGE','CASE_READ','CASE_MANAGE','CASE_REVIEW','NOTIFICATION_READ','NOTIFICATION_TEMPLATE_REVIEW') then raise exception 'Unsupported permission' using errcode='22023';end if;
  end loop;
  if (input->>'expiresAt')::timestamptz<=greatest(now(),(input->>'startsAt')::timestamptz) or input->>'startsAt' is null or input->>'expiresAt' is null then raise exception 'Finite access duration required' using errcode='22023';end if;
  if input->>'requestType'<>'GRANT' then
   select * into target from governance.access_decisions where id=(input->>'targetDecisionId')::uuid;
   if target.id is null or target.recipient_account_id<>actor or target.organization_id<>oid or target.period_id<>pid then raise exception 'Decision not owned' using errcode='42501';end if;
  end if;
  data:=jsonb_build_object('formReference',governance.text_value(input,'formReference',3,150),'requestType',input->>'requestType','permissions',input->'permissions','purpose',governance.text_value(input,'purpose'),
  'informationScope',governance.text_value(input,'informationScope'),'mandateReference',governance.text_value(input,'mandateReference',3,500),'startsAt',input->>'startsAt','expiresAt',input->>'expiresAt','objectId',input->>'objectId','targetDecisionId',input->>'targetDecisionId','endCondition',left(coalesce(input->>'endCondition',''),500));
 elsif record_kind='INCIDENT' then
  class:='RAHASIA';
  if input->>'incidentType' is null or input->>'incidentType' not in ('MIS_SEND','LOST','UNAUTH_ACCESS','ACCOUNT_TAKEOVER','OTHER') then raise exception 'Invalid incident type' using errcode='22023';end if;
  data:=jsonb_build_object('formReference',governance.text_value(input,'formReference',3,150),'incidentType',input->>'incidentType','description',governance.text_value(input,'description',3,6000),'system',left(coalesce(input->>'system','Belum diketahui'),500),'impact',left(coalesce(input->>'impact','Belum diketahui'),2000),
  'eventAt',(input->>'eventAt')::timestamptz,'discoveredAt',(input->>'discoveredAt')::timestamptz,'reportedAt',now(),'initialAction',left(coalesce(input->>'initialAction',''),2000),'notifiedParties',left(coalesce(input->>'notifiedParties',''),500),
  'contact',left(coalesce(input->>'contact',''),254),'evidenceReference',left(coalesce(input->>'evidenceReference',''),500),'unknownDetails',left(coalesce(input->>'unknownDetails',''),2000),'affectedClassification',coalesce(input->>'affectedClassification','UNKNOWN'),
  'personnelConcern',coalesce((input->>'personnelConcern')::boolean,false),'corrections','[]'::jsonb,'noticeDecision','PENDING','bpiStatus',case when coalesce((input->>'personnelConcern')::boolean,false) then 'PENDING' else 'NOT_APPLICABLE' end);
 elsif record_kind='OFFBOARD' then
  if not governance.authorized(actor,'SOP_OFFBOARD_MANAGE',oid,pid,did,class) and (input->>'subjectAccountId')::uuid<>actor then raise exception 'Offboarding mandate required' using errcode='42501';end if;
  if input->>'subjectAccountId' is null or input->>'successorAccountId' is null or input->>'verifierAccountId' is null or input->>'effectiveAt' is null
  or (input->>'subjectAccountId')::uuid=(input->>'successorAccountId')::uuid or (input->>'verifierAccountId')::uuid in (actor,(input->>'subjectAccountId')::uuid) then raise exception 'Independent successor and verifier required' using errcode='22023';end if;
  if not exists(select 1 from org.assignments x join org.positions p on p.id=x.position_id where x.account_id=(input->>'subjectAccountId')::uuid and x.period_id=pid and p.organization_id=oid) then raise exception 'Subject assignment required' using errcode='42501';end if;
  if not governance.authorized((input->>'verifierAccountId')::uuid,'SOP_OFFBOARD_VERIFY',oid,pid,did,class) then raise exception 'Verifier mandate required' using errcode='42501';end if;
  if not exists(select 1 from org.assignments s join org.positions p on p.id=s.position_id where s.account_id=(input->>'successorAccountId')::uuid and s.period_id=pid and p.organization_id=oid and (s.ends_on is null or s.ends_on>=current_date)) then raise exception 'Successor assignment required' using errcode='42501';end if;
  data:=jsonb_build_object('formReference',governance.text_value(input,'formReference',3,150),'subjectAccountId',(input->>'subjectAccountId')::uuid,'successorAccountId',(input->>'successorAccountId')::uuid,'verifierAccountId',(input->>'verifierAccountId')::uuid,'effectiveAt',(input->>'effectiveAt')::timestamptz,
  'basis',governance.text_value(input,'basis',3,2000),'function',governance.text_value(input,'function',3,200),'checklist','{}'::jsonb,'details','[]'::jsonb,'exceptions','[]'::jsonb,'transitionDecisionIds','[]'::jsonb,'revokeTechnical',coalesce((input->>'revokeTechnical')::boolean,false));
 elsif record_kind='CLASSIFICATION' then
  select * into resource from governance.information_resources where id=(input->>'objectId')::uuid;
  if resource.id is null or resource.organization_id<>oid or resource.period_id<>pid then raise exception 'Resource not found' using errcode='22023';end if;
  if not identity.has_permission(case resource.kind when 'ASSET' then 'ASSET_READ' else 'CASE_READ' end,oid,pid,did,resource.id)
  and not governance.authorized(actor,case input->>'mode' when 'HOLD' then 'INFORMATION_HOLD' when 'RELEASE' then 'INFORMATION_HOLD_RELEASE' else 'INFORMATION_CLASSIFY' end,oid,pid,did,resource.classification,resource.id) then raise exception 'Resource scope denied' using errcode='42501';end if;
  if input->>'mode' is null or input->>'mode' not in ('CLASSIFY','HOLD','RELEASE') or input->>'newClassification' is null or input->>'newClassification' not in ('TERBUKA','INTERNAL','TERBATAS','RAHASIA') then raise exception 'Invalid classification request' using errcode='22023';end if;
  class:=resource.classification;if class='TERBUKA' then class:='INTERNAL';end if;
  data:=jsonb_build_object('formReference',governance.text_value(input,'formReference',3,150),'mode',input->>'mode','objectId',resource.id,'fromClassification',resource.classification,'newClassification',input->>'newClassification','resourceVersion',resource.version,'reason',governance.text_value(input,'reason'),'basis',governance.text_value(input,'basis',3,500));
 else raise exception 'Unknown workflow' using errcode='22023';end if;
 insert into governance.workflow_records(kind,organization_id,period_id,division_id,creator_account_id,reviewer_account_id,classification,payload,request_key,status)
 values(record_kind,oid,pid,did,actor,case when record_kind='OFFBOARD' then (data->>'verifierAccountId')::uuid else null end,class,data||jsonb_build_object('submission',input),request_key,case when record_kind='OFFBOARD' then 'DRAFT' when record_kind='INCIDENT' then 'SECURITY' else 'SUBMITTED' end) returning * into item;
 insert into governance.workflow_events(record_id,actor_account_id,action,note,version) values(item.id,actor,'CREATED','Pengajuan tersimpan.',1);
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('SOP_WORKFLOW_CREATED','governance',record_kind,item.id,'SUCCESS',request_key::text,jsonb_build_object('actorAccountId',actor));
 return governance.record_json(item);
exception when invalid_text_representation or datetime_field_overflow then raise exception 'Invalid workflow values' using errcode='22023';end $$;
create function public.kpi_governance_action(record_id uuid,expected_version integer,workflow_action text,input jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
   item.handler_account_id:=other;note:=governance.text_value(input,'note');reference:=governance.text_value(input,'reference',3,500);
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
   if item.status not in ('DRAFT','SUBMITTED') or data->>'receivedAt' is not null or actor<>(data->>'successorAccountId')::uuid or actor=(data->>'subjectAccountId')::uuid then raise exception 'Successor required' using errcode='42501';end if;
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
create function public.kpi_access_review_action(review_action text,input jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();d governance.access_decisions;v governance.access_reviews;result uuid;
begin
 if actor is null then raise exception 'Access denied' using errcode='42501';end if;
 if review_action='RECORD' then select * into d from governance.access_decisions where id=(input->>'decisionId')::uuid for update;
 else select * into v from governance.access_reviews where id=(input->>'reviewId')::uuid for update;select * into d from governance.access_decisions where id=v.decision_id for update;end if;
 if d.id is null or actor=d.recipient_account_id or not governance.authorized(actor,case when review_action='SUSPEND' then 'SOP_ACCESS_SUSPEND' else 'SOP_ACCESS_REVIEW' end,d.organization_id,d.period_id,d.division_id,d.classification,d.object_id) then raise exception 'Independent review mandate required' using errcode='42501';end if;
 if review_action='RECORD' then
  if input->>'trigger' is null or input->>'trigger' not in ('PERIODIC','ASSIGNMENT_CHANGE','OFFBOARD','CONFLICT','INCIDENT') or input->>'dueAt' is null or not governance.in_scope((input->>'picAccountId')::uuid,d.organization_id,d.period_id,d.division_id) then raise exception 'Invalid review follow-up' using errcode='22023';end if;
  insert into governance.access_reviews(decision_id,reviewer_account_id,trigger_reason,finding,follow_up,pic_account_id,due_at) values(d.id,actor,input->>'trigger',governance.text_value(input,'finding'),governance.text_value(input,'followUp'),(input->>'picAccountId')::uuid,(input->>'dueAt')::timestamptz) returning id into result;
 elsif review_action='VERIFY' then
  if v.id is null or v.verified_at is not null or v.pic_account_id=actor then raise exception 'Independent follow-up verification required' using errcode='42501';end if;
  update governance.access_reviews set verified_at=now(),verified_by_account_id=actor,verification_reference=governance.text_value(input,'reference',3,500) where id=v.id;
  update governance.access_decisions set review_due_at=least(expires_at,now()+interval '3 months') where id=d.id;result:=v.id;
 elsif review_action='SUSPEND' then
  if v.id is null or v.suspended_at is not null then raise exception 'Review already suspended' using errcode='22023';end if;
  update governance.access_reviews set suspension_reason=governance.text_value(input,'finding'),suspension_reference=governance.text_value(input,'reference',3,500),suspended_by_account_id=actor,suspended_at=now() where id=v.id;
  update governance.access_decisions set suspended_at=now(),review_due_at=least(expires_at,now()+interval '1 day') where id=d.id;result:=d.id;
 else raise exception 'Unknown review action' using errcode='22023';end if;
 insert into audit.audit_events(action,module,entity_type,entity_id,result,request_id,metadata) values('SOP_ACCESS_REVIEW_'||review_action,'governance','access_review',result,'SUCCESS','hosted:'||gen_random_uuid(),jsonb_build_object('actorAccountId',actor,'decisionId',d.id,'reference',input->>'reference'));
 return result;
exception when invalid_text_representation or datetime_field_overflow then raise exception 'Invalid review input' using errcode='22023';end $$;
alter function governance.grant_valid(identity.permission_grants) rename to grant_valid_sop_v11;
create function governance.grant_valid(g identity.permission_grants) returns boolean language sql stable security definer set search_path='' as $$
 select governance.grant_valid_sop_v11(g) and not exists(select 1 from governance.workflow_records r where r.kind='OFFBOARD' and r.status in ('APPROVED','IMPLEMENTED','CLOSED')
 and r.organization_id=g.organization_id and r.period_id=g.period_id and (r.payload->>'subjectAccountId')::uuid=g.account_id and (r.payload->>'effectiveAt')::timestamptz<=now()
 and not (r.payload->'transitionDecisionIds')?g.decision_id::text);
$$;
-- PostgreSQL stores SQL function dependencies by OID. Refresh callers to bind the new effective-date check.
create or replace function identity.has_permission(wanted text,target_org uuid,target_period uuid,target_division uuid default null,target_object uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
 select (identity.is_system_admin() and wanted=any(array['SYSTEM_CONFIGURATION_READ','IDENTITY_READ','IDENTITY_MANAGE'])
 and exists(select 1 from org.periods p where p.id=target_period and p.organization_id=target_org and p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on)
 and (target_division is null or exists(select 1 from org.divisions where id=target_division and organization_id=target_org)))
 or exists(select 1 from identity.permission_grants g join governance.access_decisions d on d.id=g.decision_id where g.account_id=identity.current_account_id() and g.permission=wanted and g.organization_id=target_org and g.period_id=target_period
 and (g.division_id is null or g.division_id=target_division) and (g.object_id is null or g.object_id=target_object) and g.starts_at<=now() and g.revoked_at is null and g.expires_at>now() and governance.grant_valid(g)
 and identity.is_active_member(target_org,target_period,g.division_id) and not governance.has_conflict(g.account_id,target_org,target_period,target_object)
 and (target_object is null or governance.classification_rank(d.classification)>=coalesce((select governance.classification_rank(r.classification) from governance.information_resources r where r.id=target_object and r.organization_id=target_org and r.period_id=target_period),1)));
$$;
create or replace function identity.is_system_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from identity.system_administrators s join identity.account_roles ar on ar.account_id=s.account_id join identity.roles r on r.id=ar.role_id
 where s.account_id=identity.current_account_id() and s.revoked_at is null and r.code='ADMIN_SISTEM' and ar.starts_at<=now() and (ar.ends_at is null or ar.ends_at>now()))
 and not exists(select 1 from governance.workflow_records f where f.kind='OFFBOARD' and f.status in ('APPROVED','IMPLEMENTED','CLOSED') and (f.payload->>'subjectAccountId')::uuid=identity.current_account_id()
 and coalesce((f.payload->>'revokeTechnical')::boolean,false) and (f.payload->>'effectiveAt')::timestamptz<=now());
$$;
create or replace function public.kpi_access_register() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=identity.current_account_id();
begin if actor is null then raise exception 'Access denied' using errcode='42501';end if;
 return(select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'recipientAccountId',d.recipient_account_id,'organizationId',d.organization_id,'periodId',d.period_id,'divisionId',d.division_id,'objectId',d.object_id,'permission',d.permission,'classification',d.classification,'formReference',d.form_reference,
 'decisionReference',d.decision_reference,'mandateReference',d.mandate_reference,'informationScope',case when actor in (d.recipient_account_id,d.approved_by_account_id) or governance.authorized(actor,'SOP_ACCESS_REVIEW',d.organization_id,d.period_id,d.division_id,d.classification,d.object_id) then d.information_scope else 'Metadata pelaksanaan teknis' end,
 'startsAt',d.starts_at,'expiresAt',d.expires_at,'reviewDueAt',d.review_due_at,'approvedAt',d.approved_at,'implementedAt',d.implemented_at,'reviewOverdue',d.review_due_at<=now(),
 'status',case when d.revoked_at is not null then 'REVOKED' when d.suspended_at is not null then 'SUSPENDED' when d.expires_at<=now() then 'EXPIRED' when d.implemented_at is null then 'APPROVED' when d.starts_at>now() then 'SCHEDULED'
 when exists(select 1 from identity.permission_grants g where g.decision_id=d.id and g.revoked_at is null and governance.grant_valid(g) and g.starts_at<=now() and exists(select 1 from org.periods p where p.id=d.period_id and p.status in ('ACTIVE','CLOSING') and current_date between p.starts_on and p.ends_on) and exists(select 1 from org.assignments x join org.positions z on z.id=x.position_id where x.account_id=d.recipient_account_id and x.period_id=d.period_id and z.organization_id=d.organization_id and (d.division_id is null or z.division_id=d.division_id) and x.starts_on<=current_date and (x.ends_on is null or x.ends_on>=current_date))) then 'ACTIVE' else 'INACTIVE' end) order by d.approved_at desc),'[]'::jsonb)
 from governance.access_decisions d where actor in (d.recipient_account_id,d.approved_by_account_id,d.implemented_by_account_id) or governance.authorized(actor,'SOP_ACCESS_REVIEW',d.organization_id,d.period_id,d.division_id,d.classification,d.object_id));
end $$;
create function governance.preserve_evidence() returns trigger language plpgsql security definer set search_path='' as $$
begin if exists(select 1 from governance.information_resources where id=old.id and hold_reference is not null) then raise exception 'Evidence hold prevents deletion' using errcode='42501';end if;return old;end $$;
create trigger asset_evidence_hold before delete on files.managed_assets for each row execute function governance.preserve_evidence();
create trigger case_evidence_hold before delete on intake.cases for each row execute function governance.preserve_evidence();
create trigger resource_evidence_hold before delete on governance.information_resources for each row execute function governance.preserve_evidence();
revoke all on function governance.text_value(jsonb,text,integer,integer),governance.authorized(uuid,text,uuid,uuid,uuid,text,uuid),governance.in_scope(uuid,uuid,uuid,uuid),governance.record_readable(governance.workflow_records,uuid),governance.record_visible(governance.workflow_records,uuid),governance.record_json(governance.workflow_records),governance.grant_valid(identity.permission_grants),governance.preserve_evidence(),public.kpi_governance_context(),public.kpi_governance_create(text,jsonb,uuid),public.kpi_governance_action(uuid,integer,text,jsonb),public.kpi_access_review_action(text,jsonb) from public,anon,authenticated;
grant execute on function public.kpi_governance_context(),public.kpi_governance_create(text,jsonb,uuid),public.kpi_governance_action(uuid,integer,text,jsonb),public.kpi_access_review_action(text,jsonb) to authenticated;
create or replace function public.kpi_assets_list(organization_code text,period_code text,division_code text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;did uuid;
begin
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 if division_code is not null then select id into did from org.divisions where organization_id=oid and code=division_code;end if;
 if oid is null or (division_code is not null and did is null) or (not identity.has_permission('ASSET_READ',oid,pid,did) and not exists(select 1 from files.managed_assets a where a.organization_id=oid and a.period_id=pid and (did is null or a.division_id=did) and identity.has_permission('ASSET_READ',oid,pid,a.division_id,a.id))) then raise exception 'Access denied' using errcode='42501';end if;
 return(select coalesce(jsonb_agg(files.asset_json(t) order by t.created_at desc,t.id),'[]'::jsonb) from (select * from files.managed_assets a where a.organization_id=oid and a.period_id=pid
 and (division_code is null or a.division_id=did) and identity.has_permission('ASSET_READ',oid,pid,a.division_id,a.id) order by a.created_at desc,a.id limit 100) t);
end $$;
create or replace function public.kpi_cases_list(organization_code text,period_code text) returns jsonb language plpgsql stable security definer set search_path='' as $$
#variable_conflict use_variable
declare oid uuid;pid uuid;
begin
 if identity.current_account_id() is null then raise exception 'Access denied' using errcode='42501';end if;
 select o.id,p.id into oid,pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code=organization_code and p.code=period_code;
 return(select coalesce(jsonb_agg(jsonb_build_object('id',t.id,'kind',t.kind,'subject',t.subject,'status',t.status,'version',t.version,'submittedAt',t.submitted_at,'ownerAccountId',t.owner_account_id) order by t.updated_at desc,t.id),'[]'::jsonb)
 from(select * from intake.cases c where c.organization_id=oid and c.period_id=pid and intake.can_read(c) order by c.updated_at desc,c.id limit 100)t);
end $$;
alter function public.kpi_operations_schema_ready() rename to kpi_operations_schema_ready_before_workflows;
create function public.kpi_operations_schema_ready() returns boolean language sql stable security definer set search_path='' as $$
 select public.kpi_operations_schema_ready_before_workflows() and to_regclass('governance.workflow_records') is not null
 and to_regclass('governance.access_reviews') is not null and to_regprocedure('public.kpi_governance_action(uuid,integer,text,jsonb)') is not null;
$$;
revoke all on function public.kpi_operations_schema_ready(),public.kpi_operations_schema_ready_before_workflows() from public,anon,authenticated;
grant execute on function public.kpi_operations_schema_ready() to service_role;
notify pgrst,'reload schema';
commit;
