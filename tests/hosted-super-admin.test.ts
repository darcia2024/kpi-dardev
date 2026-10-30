import assert from "node:assert/strict";
import test from "node:test";
import {readdir} from "node:fs/promises";
import {createHostedDatabase,hostedFixture as f,loginHostedFixture} from "./fixtures/hosted-database";
import {hasHostedPermission,type HostedAccess} from "../src/platform/authorization/hosted-access";
import {permissions} from "../src/platform/authorization/permission-catalog";

test("super admin UI scopes do not turn technical role or future periods into business write access",()=>{
 const access:HostedAccess={accountId:f.owner,authUserId:f.owner,email:'one@example.org',name:'One',roles:['ADMIN_SISTEM'],memberships:[],grants:[],systemAdmin:true,superAdmin:true,superAdminScopes:[{organizationCode:'KPI',periodCode:'NEXT',divisionCode:null,operational:false}]};
 assert.equal(hasHostedPermission(access,'CASE_READ',{organizationCode:'KPI',periodCode:'NEXT',objectId:f.stranger}),true);
 assert.equal(hasHostedPermission(access,'CASE_MANAGE',{organizationCode:'KPI',periodCode:'NEXT'}),false);
 assert.equal(hasHostedPermission(access,'CASE_READ',{organizationCode:'OTHER',periodCode:'NEXT'}),false);
 assert.equal(hasHostedPermission({...access,superAdmin:false},'CASE_READ',{organizationCode:'KPI',periodCode:'NEXT'}),false);
 assert.equal(hasHostedPermission({...access,systemAdmin:false},'CASE_READ',{organizationCode:'KPI',periodCode:'NEXT'}),false);
 const operational={...access,superAdminScopes:[{...access.superAdminScopes![0],operational:true}]};
 for(const permission of permissions)assert.equal(hasHostedPermission(operational,permission,{organizationCode:'KPI',periodCode:'NEXT'}),true);
});

test("explicit super administration is scoped, revoked, non-client-editable and preserves independent review",async()=>{
 const names=(await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>/^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300|^20261005003100|^20261006003[23]00/.test(n)).sort();
 const db=await createHostedDatabase(names.map(n=>'migrations/'+n),[]);
 try{
  await db.exec(`update auth.users set raw_app_meta_data='{"kpi_access":true,"kpi_role":"ADMIN_SISTEM"}' where id='${f.owner}';
  insert into identity.roles(code,name)values('ADMIN_SISTEM','Administrator');insert into identity.account_roles(account_id,role_id)select '${f.owner}',id from identity.roles where code='ADMIN_SISTEM';
  insert into identity.system_administrators(account_id,approved_reason)values('${f.owner}','Fixture approval');`);
  await db.exec("create function public.fixture_permission(p text,o uuid,t uuid) returns boolean language sql security definer set search_path='' as $$ select identity.has_permission(p,o,t) $$;");
  const permitted=async(permission:string,oid=f.organization,pid=f.period)=>(await db.query<{ok:boolean}>('select public.fixture_permission($1,$2,$3) ok',[permission,oid,pid])).rows[0].ok;
  await loginHostedFixture(db,f.owner);assert.equal(await permitted('CASE_READ'),false);
  await db.exec(`reset role;insert into identity.super_administrators(account_id,organization_id,approved_reference)values('${f.owner}','${f.organization}','Isolated fixture approval');`);
  await loginHostedFixture(db,f.owner);
  for(const p of permissions)assert.equal(await permitted(p),true,p);
  const context=(await db.query<{value:HostedAccess}>('select public.kpi_access_context() value')).rows[0].value;
  assert.equal(context.superAdmin,true);assert.equal(context.superAdminScopes?.length,1);
  assert.equal(await permitted('UNKNOWN_PERMISSION'),false);
  assert.equal(await permitted('CASE_READ',f.stranger,f.period),false);
  await assert.rejects(db.exec('update identity.super_administrators set revoked_at=null'),/permission denied/);
  await assert.rejects(db.exec("select identity.has_permission_standard('CASE_READ',null,null)"),/permission denied/);
  const task=(await db.query<{value:{id:string;version:number}}>("select public.kpi_task_create('KPI','CURRENT','Isolated super task','Fixture',$1,gen_random_uuid()) value",[f.owner])).rows[0].value;
  await db.query("select public.kpi_task_action($1,1,'START','Fixture start')",[task.id]);
  await db.query("select public.kpi_task_action($1,2,'SUBMIT','Fixture submit')",[task.id]);
  await assert.rejects(db.query("select public.kpi_task_action($1,3,'APPROVE','Self approval fixture')",[task.id]),/denied|review|independent/i);
  await db.exec(`reset role;update org.periods set status='PLANNED',starts_on=current_date+10,ends_on=current_date+365 where id='${f.period}';`);
  await loginHostedFixture(db,f.owner);assert.equal(await permitted('CASE_READ'),true);assert.equal(await permitted('CASE_MANAGE'),false);
  await db.exec(`reset role;update identity.super_administrators set revoked_at=now();`);
  await loginHostedFixture(db,f.owner);assert.equal(await permitted('CASE_READ'),false);
  assert.equal((await db.query<{value:HostedAccess}>('select public.kpi_access_context() value')).rows[0].value.superAdmin,false);
  await db.exec(`reset role;update identity.super_administrators set revoked_at=null,expires_at=now()-interval '1 second',starts_at=now()-interval '1 day';`);
  await loginHostedFixture(db,f.owner);assert.equal(await permitted('CASE_READ'),false);
  await db.exec(`reset role;update identity.super_administrators set expires_at=null;update identity.accounts set status='SUSPENDED' where id='${f.owner}';`);
  await loginHostedFixture(db,f.owner);assert.equal(await permitted('CASE_READ'),false);
  await db.exec(`reset role;update identity.accounts set status='ACTIVE' where id='${f.owner}';update identity.system_administrators set revoked_at=now();`);
  await loginHostedFixture(db,f.owner);assert.equal(await permitted('CASE_READ'),false);
  await loginHostedFixture(db,f.stranger);assert.equal(await permitted('FINANCE_READ'),false);
  await db.exec('reset role;set role anon;');await assert.rejects(db.exec('select * from identity.super_administrators'),/permission denied/);
 }finally{await db.close();}
});
