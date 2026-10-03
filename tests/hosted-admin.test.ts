import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";
import {PGlite} from "@electric-sql/pglite";
test("approved system admin manages official scope; role alone and revoked approval cannot",async()=>{
  const db=await PGlite.create();
  const admin="093b761f-d1c7-433c-8153-0f271e85664c";
  const other="00000000-0000-4000-8000-000000000002";
  try{
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
      create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
    for(const file of ["migrations/20260921000000_platform.sql","manual/paket-2-install.sql","manual/paket-2-aktifkan-admin-awal.sql","migrations/20261002000300_hosted_tasks.sql","migrations/20261002000400_system_administration.sql"]){
      if(file==="manual/paket-2-aktifkan-admin-awal.sql")await db.exec(`insert into auth.users values('${admin}','kpippmimesirofficial@gmail.com',now(),'{}');`);
      await db.exec((await readFile(new URL(`../supabase/${file}`,import.meta.url),"utf8")).replace("create extension if not exists pgcrypto;",""));
    }
    await db.exec(`insert into auth.users values('${other}','other@example.org',now(),'{"kpi_access":true,"kpi_role":"ADMIN_SISTEM"}');
      insert into identity.accounts(id,auth_user_id,email,display_name,status)values('${other}','${other}','other@example.org','Other admin','ACTIVE');
      insert into identity.account_roles(account_id,role_id)select '${other}',id from identity.roles where code='ADMIN_SISTEM';`);
    const login=async(id:string)=>db.exec(`reset role;set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);`);
    await login(other);
    await assert.rejects(db.exec("select public.kpi_admin_directory()"),/Access denied/);
    await assert.rejects(db.exec("select * from identity.system_administrators"),/permission denied/);
    await login(admin);
    const context=async()=> (await db.query<{value:{systemAdmin:boolean;managedScopes:unknown[];accountId:string}}>("select public.kpi_access_context() as value")).rows[0].value;
    assert.equal((await context()).systemAdmin,true);
    assert.deepEqual((await context()).managedScopes,[]);
    await db.exec("select public.kpi_admin_setup('FUTURE','Future organization','NEXT',current_date+15,current_date+380)");
    assert.deepEqual((await context()).managedScopes,[]);
    await assert.rejects(db.exec("select public.kpi_tasks_list('FUTURE','NEXT')"),/Access denied/);
    await db.exec("reset role;");
    assert.equal((await db.query<{status:string}>("select status from org.periods where code='NEXT'")).rows[0].status,"PLANNED");
    await login(admin);
    await assert.rejects(db.exec("select public.kpi_admin_setup('KPI','KPI PPMI Mesir','CURRENT',current_date,current_date-1)"),/Invalid official/);
    await db.exec("select public.kpi_admin_setup('KPI','KPI PPMI Mesir','CURRENT',current_date-1,current_date+365)");
    await db.exec("select public.kpi_admin_setup('KPI','KPI PPMI Mesir','CURRENT',current_date-1,current_date+365)");
    await assert.rejects(db.exec("select public.kpi_admin_setup('KPI','KPI PPMI Mesir','CURRENT',current_date-2,current_date+365)"),/Period already exists/);
    assert.equal((await context()).managedScopes.length,1);
    const accountId=(await context()).accountId;
    const task=(await db.query<{value:{id:string}}>("select public.kpi_task_create('KPI','CURRENT','Admin task','Description',$1,'00000000-0000-4000-8000-000000000099') as value",[accountId])).rows[0].value;
    await db.exec(`select public.kpi_task_action('${task.id}',1,'START','Start admin task');select public.kpi_task_action('${task.id}',2,'SUBMIT','Submit admin task');`);
    await assert.rejects(db.exec(`select public.kpi_task_action('${task.id}',3,'APPROVE','Approve own task')`),/Access denied/);
    await assert.rejects(db.exec("select public.kpi_access_context_base()"),/permission denied/);
    await login(other);
    await assert.rejects(db.exec("select public.kpi_tasks_list('KPI','CURRENT')"),/Access denied/);
    await db.exec("reset role;update identity.system_administrators set revoked_at=now();");
    await login(admin);
    assert.equal((await context()).systemAdmin,false);
    assert.deepEqual((await context()).managedScopes,[]);
    await assert.rejects(db.exec("select public.kpi_admin_directory()"),/Access denied/);
    await assert.rejects(db.exec("select public.kpi_tasks_list('KPI','CURRENT')"),/Access denied/);
    await db.exec("reset role;");
    assert.equal((await db.query("select * from org.periods")).rows.length,2);
    assert.equal((await db.query("select * from audit.audit_events where action='ORGANIZATION_PERIOD_CREATED'")).rows.length,2);
    await db.exec("set role anon;");
    await assert.rejects(db.exec("select public.kpi_admin_directory()"),/permission denied/);
  }finally{await db.close();}
});
