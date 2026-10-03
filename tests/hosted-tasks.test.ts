import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("hosted tasks persist, isolate scope, prevent self approval and reject stale writes", async () => {
  const db = await PGlite.create();
  const owner = "00000000-0000-4000-8000-000000000001";
  const reviewer = "00000000-0000-4000-8000-000000000002";
  const stranger = "00000000-0000-4000-8000-000000000003";
  const org = "00000000-0000-4000-8000-000000000004";
  const period = "00000000-0000-4000-8000-000000000005";
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
    for (const file of ["migrations/20260921000000_platform.sql", "manual/paket-2-install.sql", "migrations/20261002000300_hosted_tasks.sql"]) {
      await db.exec((await readFile(new URL(`../supabase/${file}`, import.meta.url), "utf8")).replace("create extension if not exists pgcrypto;", ""));
    }
    await db.exec(`insert into auth.users values
      ('${owner}','owner@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}'),
      ('${reviewer}','reviewer@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}'),
      ('${stranger}','stranger@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}');
      insert into identity.accounts(id,auth_user_id,email,display_name,status) select id,id,email,email,'ACTIVE' from auth.users;
      insert into identity.roles(code,name) values('PENGURUS','Pengurus');
      insert into identity.account_roles(account_id,role_id) select a.id,r.id from identity.accounts a cross join identity.roles r;
      insert into org.organizations(id,code,name) values('${org}','KPI','KPI');
      insert into org.periods(id,organization_id,code,starts_on,ends_on,status) values('${period}','${org}','CURRENT',current_date-1,current_date+1,'ACTIVE');
      insert into org.positions(organization_id,code,name) values('${org}','MEMBER','Member');
      insert into org.assignments(account_id,position_id,period_id,starts_on) select a.id,p.id,'${period}',current_date-1 from identity.accounts a cross join org.positions p where a.id<>'${stranger}';
      insert into identity.permission_grants(account_id,organization_id,period_id,permission,reason)
        select a.id,'${org}','${period}',p,'Approved fixture' from identity.accounts a cross join unnest(array['TASK_READ','TASK_CREATE','TASK_SUBMIT','TASK_REVIEW']) p where a.id<>'${stranger}';`);
    async function login(id: string) { await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`); }
    const list = () => db.query<{ tasks: unknown[] }>("select public.kpi_tasks_list('KPI','CURRENT') as tasks");
    const create = (title = "Prepare a report", key = "00000000-0000-4000-8000-000000000099") => db.query<{ task: { id: string; version: number; status: string } }>("select public.kpi_task_create('KPI','CURRENT',$1,'A real description',$2,$3) as task", [title,owner,key]);
    const action = (id: string, version: number, command: string) => db.query<{ task: { version: number; status: string } }>("select public.kpi_task_action($1,$2,$3,'Recorded action note') as task", [id,version,command]);
    await login(owner);
    assert.deepEqual((await list()).rows[0].tasks, []);
    await assert.rejects(db.exec("select public.kpi_tasks_list('KPI','WRONG_PERIOD')"), /Access denied/);
    await assert.rejects(db.exec("select public.kpi_tasks_list('KPI','CURRENT','OTHER_DIVISION')"), /Access denied/);
    await assert.rejects(db.query("select public.kpi_task_create('KPI','CURRENT','Wrong owner','Details',$1,'00000000-0000-4000-8000-000000000098')",[stranger]), /Access denied/);
    const task = (await create()).rows[0].task;
    assert.equal((await create()).rows[0].task.id, task.id);
    await assert.rejects(create("A different report"), /Request key already used/);
    await assert.rejects(db.exec("select * from work.tasks"), /permission denied/);
    await assert.rejects(db.exec("update work.tasks set status='DONE'"), /permission denied/);
    assert.equal((await list()).rows[0].tasks.length, 1);
    assert.equal((await action(task.id,1,"START")).rows[0].task.status, "IN_PROGRESS");
    await assert.rejects(action(task.id,1,"SUBMIT"), /reload first/);
    assert.equal((await action(task.id,2,"SUBMIT")).rows[0].task.status, "IN_REVIEW");
    await assert.rejects(action(task.id,3,"APPROVE"), /Access denied/);
    await login(stranger);
    await assert.rejects(list(), /Access denied/);
    await assert.rejects(db.query("select public.kpi_task_detail($1)",[task.id]), /Access denied/);
    await login(reviewer);
    await assert.rejects(action(task.id,3,"START"), /Access denied/);
    assert.equal((await action(task.id,3,"REQUEST_REVISION")).rows[0].task.status, "REVISION");
    await login(owner);
    await action(task.id,4,"START");
    await action(task.id,5,"SUBMIT");
    await login(reviewer);
    assert.equal((await action(task.id,6,"APPROVE")).rows[0].task.status, "DONE");
    await assert.rejects(action(task.id,7,"APPROVE"), /Invalid task transition/);
    const detail = (await db.query<{ value: { events: unknown[] } }>("select public.kpi_task_detail($1) as value",[task.id])).rows[0].value;
    assert.equal(detail.events.length,7);
    await db.exec(`reset role; update identity.permission_grants set revoked_at=now() where account_id='${owner}';
      insert into identity.permission_grants(account_id,organization_id,period_id,object_id,permission,reason)
      values('${owner}','${org}','${period}','${task.id}','TASK_READ','Object only fixture');`);
    await login(owner);
    await assert.rejects(list(), /Access denied/);
    assert.equal((await db.query("select public.kpi_task_detail($1)",[task.id])).rows.length,1);
    await db.exec(`reset role; update identity.permission_grants set revoked_at=now() where account_id='${reviewer}';`);
    await login(reviewer);
    await assert.rejects(list(), /Access denied/);
    await db.exec("reset role; set role anon;");
    await assert.rejects(list(), /permission denied/);
    await db.exec("reset role;");
    assert.equal((await db.query("select * from work.tasks")).rows.length,1);
    assert.equal((await db.query("select * from audit.audit_events where module='work'")).rows.length,7);
    await db.exec(`update org.periods set status='CLOSED';`);
    await login(owner);
    await assert.rejects(db.query("select public.kpi_task_detail($1)",[task.id]), /Access denied/);
  } finally { await db.close(); }
});
