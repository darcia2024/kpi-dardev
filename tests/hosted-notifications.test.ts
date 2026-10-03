import assert from "node:assert/strict";
import test from "node:test";
import {createHostedDatabase,hostedFixture,loginHostedFixture} from "./fixtures/hosted-database";
test("hosted inbox records events atomically, isolates recipients and respects source revocation",async()=>{
 const db=await createHostedDatabase(["migrations/20261002000300_hosted_tasks.sql","migrations/20261002000500_hosted_meetings.sql","migrations/20261002000600_hosted_content.sql","migrations/20261002000900_hosted_notifications.sql"],["TASK_READ","TASK_CREATE","TASK_REVIEW","NOTIFICATION_READ"]);
 try{await loginHostedFixture(db,hostedFixture.owner);
 await db.query("select public.kpi_task_create('KPI','CURRENT','Tugas pengurus','Uraian pekerjaan',$1,'00000000-0000-4000-8000-000000000099')",[hostedFixture.owner]);
 const list=()=>db.query<{items:{id:string;readAt:string|null}[]}>("select public.kpi_notifications_list() items");
 const owner=(await list()).rows[0].items;assert.equal(owner.length,1);assert.equal(owner[0].readAt,null);
 await db.query("select public.kpi_notification_read($1)",[owner[0].id]);assert.ok((await list()).rows[0].items[0].readAt);
 await loginHostedFixture(db,hostedFixture.reviewer);assert.equal((await list()).rows[0].items.length,1);await assert.rejects(db.query("select public.kpi_notification_read($1)",[owner[0].id]),/Access denied/);
 await loginHostedFixture(db,hostedFixture.stranger);assert.deepEqual((await list()).rows[0].items,[]);await assert.rejects(db.exec("select * from notifications.inbox"),/permission denied/);
 await db.exec(`reset role;update identity.permission_grants set revoked_at=now() where account_id='${hostedFixture.owner}' and permission='TASK_READ';`);
 await loginHostedFixture(db,hostedFixture.owner);assert.deepEqual((await list()).rows[0].items,[]);await assert.rejects(db.query("select public.kpi_notification_read($1)",[owner[0].id]),/Access denied/);
 }finally{await db.close();}
});
