import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("PostgreSQL migrations enforce self access, revocation, scope isolation and deny client writes", async () => {
  const db = await PGlite.create();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth;
      create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz, raw_app_meta_data jsonb);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
    for (const file of ["migrations/20260921000000_platform.sql", "migrations/20261002000000_foundation_backend_read.sql", "manual/paket-2-install.sql"]) {
      const sql = await readFile(new URL(`../supabase/${file}`, import.meta.url), "utf8");
      // gen_random_uuid is built in; the hosted pgcrypto extension is not available in this test runtime.
      await db.exec(sql.replace("create extension if not exists pgcrypto;", ""));
    }
    await db.exec(`insert into auth.users values
      ('00000000-0000-4000-8000-000000000001','one@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}'),
      ('00000000-0000-4000-8000-000000000002','two@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}');
      insert into identity.accounts(id,auth_user_id,email,display_name,status) select id,id,email,email,'ACTIVE' from auth.users;
      insert into identity.roles(id,code,name) values('00000000-0000-4000-8000-000000000003','PENGURUS','Pengurus');
      insert into identity.account_roles(account_id,role_id) select id,'00000000-0000-4000-8000-000000000003' from identity.accounts;
      insert into org.organizations(id,code,name) values('00000000-0000-4000-8000-000000000004','KPI','KPI'),('00000000-0000-4000-8000-000000000005','OTHER','Other');
      insert into org.periods(id,organization_id,code,starts_on,ends_on,status) values
        ('00000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000004','CURRENT',current_date-1,current_date+1,'ACTIVE'),
        ('00000000-0000-4000-8000-000000000007','00000000-0000-4000-8000-000000000005','OTHER',current_date-1,current_date+1,'ACTIVE');
      insert into org.positions(id,organization_id,code,name) values('00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000004','MEMBER','Member');
      insert into org.assignments(account_id,position_id,period_id,starts_on) values('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000006',current_date-1);
      insert into identity.permission_grants(account_id,organization_id,period_id,permission,reason) values('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000006','TASK_READ','Fixture');
      set role authenticated;
      select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000001',false);`);
    const context = async () => (await db.query<{ value: { grants: unknown[]; memberships: unknown[] } | null }>("select public.kpi_access_context() as value")).rows[0].value;
    assert.equal((await context())?.grants.length, 1);
    assert.equal((await db.query("select * from identity.accounts")).rows.length, 1);
    assert.equal((await db.query("select * from org.organizations")).rows.length, 1);
    assert.equal((await db.query("select * from org.periods")).rows.length, 1);
    assert.equal((await db.query("select * from org.positions")).rows.length, 1);
    await assert.rejects(db.exec("update identity.accounts set status='ACTIVE'"), /permission denied/);
    await assert.rejects(db.exec("update identity.permission_grants set permission='IDENTITY_MANAGE'"), /permission denied/);
    await db.exec(`reset role;
      insert into org.assignments(account_id,position_id,period_id,starts_on) values('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000006',current_date-1);
      insert into identity.permission_grants(account_id,organization_id,period_id,permission,expires_at,reason) values('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000006','IDENTITY_MANAGE',now()+interval '1 hour','Fixture');
      set role authenticated;`);
    const rpc = (recipient: string, wanted: string) => db.query("select public.kpi_manage_grant('GRANT',$1,'00000000-0000-4000-8000-000000000004','00000000-0000-4000-8000-000000000006',$2,'Approved request') as id", [recipient,wanted]);
    await assert.rejects(rpc("00000000-0000-4000-8000-000000000001", "TASK_READ"), /Access denied/);
    await assert.rejects(rpc("00000000-0000-4000-8000-000000000002", "FINANCE_READ"), /Access denied/);
    await assert.rejects(rpc("00000000-0000-4000-8000-000000000002", "IDENTITY_MANAGE"), /Access denied/);
    const grant = await rpc("00000000-0000-4000-8000-000000000002", "TASK_READ");
    await db.exec("reset role;");
    const delegated = await db.query<{ expires_at: Date | string | null }>("select expires_at from identity.permission_grants where id=$1", [grant.rows[0].id]);
    assert.ok(delegated.rows[0].expires_at);
    assert.equal((await db.query("select * from audit.audit_events where action='PERMISSION_GRANT'")).rows.length, 1);
    await db.exec("set role authenticated;");
    await db.exec("reset role; update identity.permission_grants set revoked_at=now(); set role authenticated;");
    assert.equal((await context())?.grants.length, 0);
    await db.exec("reset role; update org.assignments set ends_on=current_date-1; set role authenticated;");
    assert.equal((await context())?.memberships.length, 0);
    await db.exec("reset role; update identity.accounts set status='SUSPENDED' where email='one@example.org'; set role authenticated;");
    assert.equal(await context(), null);
    await db.exec("reset role; set role anon;");
    await assert.rejects(db.exec("select public.kpi_access_context()"), /permission denied/);
    await db.exec("reset role;");
    await assert.rejects(db.exec(`insert into org.assignments(account_id,position_id,period_id,starts_on) values('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000008','00000000-0000-4000-8000-000000000007',current_date)`), /organization mismatch/);
    await db.exec(`insert into auth.users values('093b761f-d1c7-433c-8153-0f271e85664c','kpippmimesirofficial@gmail.com',now(),'{}');`);
    const bootstrap = await readFile(new URL("../supabase/manual/paket-2-aktifkan-admin-awal.sql", import.meta.url), "utf8");
    await db.exec(bootstrap);
    await db.exec(bootstrap);
    assert.equal((await db.query("select * from identity.account_roles r join identity.accounts a on a.id=r.account_id where a.auth_user_id='093b761f-d1c7-433c-8153-0f271e85664c'")).rows.length, 1);
    await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','093b761f-d1c7-433c-8153-0f271e85664c',false);`);
    const initialAdmin = await context();
    assert.ok(initialAdmin);
    assert.deepEqual(initialAdmin.memberships, []);
    assert.deepEqual(initialAdmin.grants, []);
  } finally {
    await db.close();
  }
});
