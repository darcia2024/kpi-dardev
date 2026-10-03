import assert from "node:assert/strict";
import test from "node:test";
import {createHostedDatabase,hostedFixture as f,loginHostedFixture} from "./fixtures/hosted-database";
test("hosted complaints require ready routing, private tracking and involved personnel with independent closure",async()=>{
 const db=await createHostedDatabase(["migrations/20261002000300_hosted_tasks.sql","migrations/20261002000400_system_administration.sql","migrations/20261002000500_hosted_meetings.sql","migrations/20261002000600_hosted_content.sql","migrations/20261002000900_hosted_notifications.sql","migrations/20261002001000_hosted_intake_cases.sql","migrations/20261002001100_case_notifications.sql"],["CASE_READ","CASE_MANAGE","CASE_REVIEW","NOTIFICATION_READ"]);
 const division="00000000-0000-4000-8000-000000000006",fingerprint="b".repeat(64),token="c".repeat(64);
 const input={kind:"PENGADUAN",subject:"Laporan persoalan interaksi",description:"Uraian untuk pengujian dengan data fiktif, bukan perkara nyata.",contact:"reporter@example.invalid",consent:true,idempotencyKey:"00000000-0000-4000-8000-000000000099"};
 type Case={id:string;status:string;version:number};
 const submit=()=>db.query("select public.kpi_intake_submit('KPI',$1::jsonb,$2,$3)",[JSON.stringify(input),token,fingerprint]);
 const action=(id:string,v:number,command:string,more:object={})=>db.query<{item:Case}>("select public.kpi_case_action($1,$2,$3,$4::jsonb) item",[id,v,command,JSON.stringify({note:"Catatan tindak lanjut",...more})]);
 try{
 await db.exec("set role service_role;");await assert.rejects(submit(),/Intake not ready/);
 await db.exec(`reset role;insert into org.divisions(id,organization_id,code,name) values('${division}','${f.organization}','IOD','Intelligence and Operation Division');
 insert into org.positions(organization_id,division_id,code,name) values('${f.organization}','${division}','IOD_MEMBER','IOD Member');
 insert into org.assignments(account_id,position_id,period_id,starts_on) select '${f.owner}',id,'${f.period}',current_date-1 from org.positions where code='IOD_MEMBER';
 insert into intake.routing values('${f.organization}','${f.period}','${f.reviewer}','${division}',true,now(),'${f.reviewer}');`);
 await db.exec("set role service_role;");await submit();await submit();
 const tracking=(await db.query<{item:{latestUpdate:string;status:string}}>("select public.kpi_intake_track($1,$2) item",[token,fingerprint])).rows[0].item;
 assert.equal(tracking.status,"RECEIVED");assert.equal(Object.hasOwn(tracking,"description"),false);assert.equal(Object.hasOwn(tracking,"contact"),false);
 await db.exec("reset role;");const id=(await db.query<{id:string}>("select id from intake.cases")).rows[0].id;
 await loginHostedFixture(db,f.owner);await assert.rejects(db.query("select public.kpi_case_detail($1)",[id]),/Access denied/);
 await loginHostedFixture(db,f.reviewer);assert.equal((await action(id,1,"ASSIGN",{ownerAccountId:f.owner})).rows[0].item.status,"TRIAGED");
 await loginHostedFixture(db,f.owner);await assert.rejects(action(id,1,"START"),/reload first/);await action(id,2,"START");await action(id,3,"ADD_NOTE",{note:"Catatan internal rahasia untuk pemeriksaan"});await action(id,4,"PUBLIC_UPDATE",{note:"Laporan sedang ditelaah oleh petugas berwenang."});await action(id,5,"REQUEST_CLOSE");await assert.rejects(action(id,6,"APPROVE_CLOSE"),/Independent case reviewer/);
 await loginHostedFixture(db,f.stranger);await assert.rejects(db.query("select public.kpi_case_detail($1)",[id]),/Access denied/);
 await loginHostedFixture(db,f.reviewer);assert.equal((await action(id,6,"APPROVE_CLOSE")).rows[0].item.status,"CLOSED");
 assert.ok((await db.query<{items:{title:string}[]}>("select public.kpi_notifications_list() items")).rows[0].items.length>0);
 await loginHostedFixture(db,f.owner);assert.ok((await db.query<{items:unknown[]}>("select public.kpi_notifications_list() items")).rows[0].items.length>0);
 await db.exec(`reset role;update identity.permission_grants set revoked_at=now() where account_id='${f.owner}' and permission='CASE_READ';`);
 await loginHostedFixture(db,f.owner);assert.deepEqual((await db.query<{items:unknown[]}>("select public.kpi_notifications_list() items")).rows[0].items,[]);
 await db.exec("reset role;set role service_role;");const tracked=(await db.query<{item:{latestUpdate:string;status:string}}>("select public.kpi_intake_track($1,$2) item",[token,fingerprint])).rows[0].item;assert.equal(tracked.status,"CLOSED");assert.equal(tracked.latestUpdate,"Laporan sedang ditelaah oleh petugas berwenang.");
 await db.exec("reset role;set role anon;");await assert.rejects(submit(),/permission denied/);await assert.rejects(db.exec("select * from intake.cases"),/permission denied/);
 await db.exec(`reset role;update intake.routing set enabled=false;set role service_role;`);await assert.rejects(submit(),/Intake not ready/);
 }finally{await db.close();}
});
