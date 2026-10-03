import assert from "node:assert/strict";
import test from "node:test";
import {createHostedDatabase} from "./fixtures/hosted-database";
test("deployment schema readiness checks every hosted module and private bucket",async()=>{
 const migrations=["00300_hosted_tasks","00400_system_administration","00500_hosted_meetings","00600_hosted_content","00700_publication_organization_scope","00800_hosted_assets","00900_hosted_notifications","01000_hosted_intake_cases","01100_case_notifications","01200_operational_schema_check"].map(s=>`migrations/202610020${s}.sql`);
 const db=await createHostedDatabase(migrations,[]);
 try{
  await db.exec("set role service_role;");
  assert.equal((await db.query<{ready:boolean}>("select public.kpi_operations_schema_ready() ready")).rows[0].ready,true);
  await db.exec("reset role;update storage.buckets set public=true where id='kpi-private';set role service_role;");
  assert.equal((await db.query<{ready:boolean}>("select public.kpi_operations_schema_ready() ready")).rows[0].ready,false);
  await db.exec("reset role;set role anon;");await assert.rejects(db.exec("select public.kpi_operations_schema_ready()"),/permission denied/);
 }finally{await db.close();}
});
