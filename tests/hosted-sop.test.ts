import assert from "node:assert/strict";
import test from "node:test";
import {createHostedDatabase,hostedFixture as f,loginHostedFixture} from "./fixtures/hosted-database";
import {hasHostedPermission,type HostedAccess} from "../src/platform/authorization/hosted-access";
const migrations=["00300_hosted_tasks","00400_system_administration","00500_hosted_meetings","00600_hosted_content","00700_publication_organization_scope","00800_hosted_assets","00900_hosted_notifications","01000_hosted_intake_cases","01100_case_notifications","01200_operational_schema_check","01300_confidentiality_sop_v11","01400_sop_asset_case_enforcement"].map(s=>`migrations/202610020${s}.sql`);
test("SOP v1.1 enforces independent documented decisions, expiry, revocation and conflicts",async()=>{
 const db=await createHostedDatabase(migrations,["TASK_READ"]);
 try{
 await db.exec("create function public.fixture_permission(wanted text,oid uuid,pid uuid) returns boolean language sql stable security definer as $$ select identity.has_permission(wanted,oid,pid) $$;grant execute on function public.fixture_permission(text,uuid,uuid) to authenticated;");
 await db.exec(`insert into identity.roles(code,name) values('ADMIN_SISTEM','Admin');insert into identity.account_roles(account_id,role_id) select '${f.stranger}',id from identity.roles where code='ADMIN_SISTEM';`);
 await db.exec(`insert into identity.system_administrators(account_id,approved_reason) values('${f.stranger}','Fixture-only technical mandate');`);
 await loginHostedFixture(db,f.stranger);
 assert.equal((await db.query<{allowed:boolean}>("select public.fixture_permission('TASK_READ',$1,$2) allowed",[f.organization,f.period])).rows[0].allowed,false);
 await assert.rejects(db.exec("select public.kpi_manage_grant('GRANT',null,null,null,null,null,null,null,null,null)"),/permission denied/);
 await loginHostedFixture(db,f.owner);
 assert.equal((await db.query<{allowed:boolean}>("select public.fixture_permission('TASK_READ',$1,$2) allowed",[f.organization,f.period])).rows[0].allowed,false);
 await db.exec('reset role;');
 const authority=(await db.query<{id:string}>(`insert into governance.access_authorities(account_id,organization_id,period_id,classifications,permissions,mandate_reference,starts_at,expires_at) values($1,$2,$3,array['INTERNAL','TERBATAS','RAHASIA'],array['TASK_READ','ASSET_READ'],'Fixture-only delegation',now()-interval '1 hour',now()+interval '1 day') returning id`,[f.reviewer,f.organization,f.period])).rows[0].id;
 const input={authorityId:authority,recipientAccountId:f.owner,organizationId:f.organization,periodId:f.period,classification:'INTERNAL',permission:'TASK_READ',startsAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+3600000).toISOString(),formReference:'Fixture F01',mandateReference:'Fixture assignment',purpose:'Fixture task review',informationScope:'Fixture task metadata',decisionReference:'Fixture written decision'};
 await loginHostedFixture(db,f.reviewer);
 await assert.rejects(db.query('select public.kpi_record_access_decision($1)',[JSON.stringify({...input,recipientAccountId:f.reviewer})]),/independent access decision/);
 await assert.rejects(db.query('select public.kpi_record_access_decision($1)',[JSON.stringify({...input,classification:'RAHASIA'})]),/identified information object/);
 const decision=(await db.query<{id:string}>('select public.kpi_record_access_decision($1) id',[JSON.stringify(input)])).rows[0].id;
 await loginHostedFixture(db,f.owner);await assert.rejects(db.query('select public.kpi_apply_access_decision($1)',[decision]),/not authorized/);
 await loginHostedFixture(db,f.stranger);const grant=(await db.query<{id:string}>('select public.kpi_apply_access_decision($1) id',[decision])).rows[0].id;
 assert.equal((await db.query<{id:string}>('select public.kpi_apply_access_decision($1) id',[decision])).rows[0].id,grant);
 await loginHostedFixture(db,f.owner);
 assert.equal((await db.query<{allowed:boolean}>("select public.fixture_permission('TASK_READ',$1,$2) allowed",[f.organization,f.period])).rows[0].allowed,true);
 assert.equal((await db.query<{allowed:boolean}>("select public.fixture_permission('ASSET_DOWNLOAD',$1,$2) allowed",[f.organization,f.period])).rows[0].allowed,false);
 await db.exec('reset role;');await db.query('update governance.access_decisions set suspended_at=now() where id=$1',[decision]);await loginHostedFixture(db,f.owner);
 assert.equal((await db.query<{allowed:boolean}>("select public.fixture_permission('TASK_READ',$1,$2) allowed",[f.organization,f.period])).rows[0].allowed,false);
 await db.exec('reset role;');await db.query('update governance.access_decisions set suspended_at=null where id=$1',[decision]);await db.query('insert into governance.conflicts(account_id,organization_id,period_id,reference) values($1,$2,$3,$4)',[f.reviewer,f.organization,f.period,'Fixture conflict']);await loginHostedFixture(db,f.owner);
 assert.equal((await db.query<{allowed:boolean}>("select public.fixture_permission('TASK_READ',$1,$2) allowed",[f.organization,f.period])).rows[0].allowed,false);
 await db.exec('reset role;update governance.conflicts set revoked_at=now();');
 const asset=(await db.query<{id:string}>("insert into files.managed_assets(organization_id,period_id,owner_account_id,original_name,mime_type,size_bytes,sha256,object_path,request_key,status) values($1,$2,$3,'fixture.pdf','application/pdf',100,$4,'fixture-private-path',gen_random_uuid(),'AVAILABLE') returning id",[f.organization,f.period,f.owner,'a'.repeat(64)])).rows[0].id;
 await db.query("update governance.information_resources set classification='TERBATAS',classification_reference='Fixture-only classification decision' where id=$1",[asset]);
 await loginHostedFixture(db,f.reviewer);
 const readDecision=(await db.query<{id:string}>('select public.kpi_record_access_decision($1) id',[JSON.stringify({...input,permission:'ASSET_READ',classification:'TERBATAS',formReference:'Fixture F01 read'})])).rows[0].id;
 await loginHostedFixture(db,f.stranger);await db.query('select public.kpi_apply_access_decision($1)',[readDecision]);
 await loginHostedFixture(db,f.owner);
 assert.equal((await db.query<{assets:Array<{id:string}>}>("select public.kpi_assets_list('KPI','CURRENT') assets")).rows[0].assets[0].id,asset);
 await assert.rejects(db.query('select public.kpi_asset_download($1)',[asset]),/Access denied/);
 await db.exec('reset role;');await db.query("update governance.information_resources set classification='RAHASIA' where id=$1",[asset]);await loginHostedFixture(db,f.owner);
 assert.equal((await db.query<{assets:unknown[]}>("select public.kpi_assets_list('KPI','CURRENT') assets")).rows[0].assets.length,0);
 await db.exec('reset role;');
await db.query('update identity.permission_grants set revoked_at=now() where id=$1',[grant]);await loginHostedFixture(db,f.stranger);await assert.rejects(db.query('select public.kpi_apply_access_decision($1)',[decision]),/new decision/);
 await db.exec('reset role;set role service_role;');assert.equal((await db.query<{ready:boolean}>('select public.kpi_operations_schema_ready() ready')).rows[0].ready,true);
 }finally{await db.close();}
});
test("technical admin scope does not imply business permissions in the interface",()=>{
 const a:HostedAccess={accountId:f.stranger,authUserId:f.stranger,email:'admin@example.org',name:'Admin',roles:['ADMIN_SISTEM'],systemAdmin:true,managedScopes:[{organizationCode:'KPI',periodCode:'CURRENT',divisionCode:null}],memberships:[],grants:[]};
 assert.equal(hasHostedPermission(a,'TASK_READ',{organizationCode:'KPI',periodCode:'CURRENT'}),false);
 assert.equal(hasHostedPermission(a,'CASE_READ',{organizationCode:'KPI',periodCode:'CURRENT'}),false);
 assert.equal(hasHostedPermission(a,'IDENTITY_MANAGE',{organizationCode:'KPI',periodCode:'CURRENT'}),true);
});

