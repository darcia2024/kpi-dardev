import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("hosted meetings persist, scope participants, serialize voting and require independent minutes review", async () => {
 const db = await PGlite.create();
 const owner="00000000-0000-4000-8000-000000000001", reviewer="00000000-0000-4000-8000-000000000002", stranger="00000000-0000-4000-8000-000000000003";
 const org="00000000-0000-4000-8000-000000000004", period="00000000-0000-4000-8000-000000000005";
 try {
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema auth; create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
 for(const file of ["migrations/20260921000000_platform.sql","manual/paket-2-install.sql","migrations/20261002000300_hosted_tasks.sql","migrations/20261002000500_hosted_meetings.sql"])
 await db.exec((await readFile(new URL(`../supabase/${file}`,import.meta.url),"utf8")).replace("create extension if not exists pgcrypto;",""));
 await db.exec(`insert into auth.users values('${owner}','one@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}'),('${reviewer}','two@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}'),('${stranger}','three@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}');
 insert into identity.accounts(id,auth_user_id,email,display_name,status) select id,id,email,email,'ACTIVE' from auth.users;
 insert into identity.roles(code,name) values('PENGURUS','Pengurus'); insert into identity.account_roles(account_id,role_id) select a.id,r.id from identity.accounts a cross join identity.roles r;
 insert into org.organizations(id,code,name) values('${org}','KPI','KPI'); insert into org.periods(id,organization_id,code,starts_on,ends_on,status) values('${period}','${org}','CURRENT',current_date-1,current_date+1,'ACTIVE');
 insert into org.positions(organization_id,code,name) values('${org}','MEMBER','Member'); insert into org.assignments(account_id,position_id,period_id,starts_on) select a.id,p.id,'${period}',current_date-1 from identity.accounts a cross join org.positions p where a.id<>'${stranger}';
 insert into identity.permission_grants(account_id,organization_id,period_id,permission,reason) select a.id,'${org}','${period}',p,'Fixture' from identity.accounts a cross join unnest(array['MEETING_READ','MEETING_MANAGE']) p where a.id<>'${stranger}';`);
 const login=async(id:string)=>db.exec(`reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`);
 type Meeting={id:string;version:number;status:string;motions:{id:string;votesCast:number;tally:unknown}[];events:unknown[]};
 const createInput={title:"Rapat koordinasi",agenda:"Agenda persiapan kegiatan",startsAt:new Date(Date.now()+86400000).toISOString(),participantAccountIds:[owner,reviewer],idempotencyKey:"00000000-0000-4000-8000-000000000099"};
 const create=(input= createInput)=>db.query<{m:Meeting}>("select public.kpi_meeting_create('KPI','CURRENT',$1::jsonb) m",[JSON.stringify(input)]);
 const act=(id:string,version:number,command:string,input:object={})=>db.query<{m:Meeting}>("select public.kpi_meeting_action($1,$2,$3,$4::jsonb) m",[id,version,command,JSON.stringify({note:"Tindakan dicatat",...input})]);
 await login(owner); const m=(await create()).rows[0].m;
 assert.equal((await create()).rows[0].m.id,m.id);
 await assert.rejects(create({...createInput,title:"Berubah"}),/Request key already used/);
 await assert.rejects(db.exec("select * from work.meetings"),/permission denied/);
 await assert.rejects(act(m.id,1,"OPEN_MOTION",{text:"Usulan kegiatan",quorum:1}),/Invalid motion/);
 await act(m.id,1,"ATTENDANCE",{accountId:owner,attendance:"HADIR"});
 await act(m.id,2,"ATTENDANCE",{accountId:reviewer,attendance:"HADIR"});
 const motion=(await act(m.id,3,"OPEN_MOTION",{text:"Usulan kegiatan",quorum:2})).rows[0].m.motions[0];
 await assert.rejects(act(m.id,3,"VOTE",{motionId:motion.id,choice:"SETUJU"}),/reload first/);
 await act(m.id,4,"VOTE",{motionId:motion.id,choice:"SETUJU"});
 await assert.rejects(act(m.id,5,"VOTE",{motionId:motion.id,choice:"TOLAK"}),/already recorded/);
 await login(stranger); await assert.rejects(db.query("select public.kpi_meeting_detail($1)",[m.id]),/Access denied/);
 await login(reviewer); const voted=(await act(m.id,5,"VOTE",{motionId:motion.id,choice:"ABSTAIN"})).rows[0].m;
 assert.equal(voted.motions[0].tally,null); assert.equal(voted.motions[0].votesCast,2);
 const closed=(await act(m.id,6,"CLOSE_MOTION",{motionId:motion.id})).rows[0].m;
 assert.deepEqual(closed.motions[0].tally,{SETUJU:1,TOLAK:0,ABSTAIN:1});
 await login(owner); await act(m.id,7,"SAVE_MINUTES",{summary:"Hasil rapat dan tindak lanjut tercatat."});
 await act(m.id,8,"SUBMIT_MINUTES"); await assert.rejects(act(m.id,9,"APPROVE_MINUTES"),/Independent reviewer/);
 await login(reviewer); assert.equal((await act(m.id,9,"APPROVE_MINUTES")).rows[0].m.status,"FINAL");
 assert.equal((await act(m.id,10,"ARCHIVE")).rows[0].m.status,"ARCHIVED");
 await assert.rejects(act(m.id,11,"SAVE_MINUTES",{summary:"Mengubah hasil final"}),/Invalid action/);
 await db.exec("reset role; set role anon;"); await assert.rejects(db.exec("select public.kpi_meetings_list('KPI','CURRENT')"),/permission denied/);
 await db.exec("reset role;"); assert.equal((await db.query("select * from audit.audit_events where module='meeting'")).rows.length,11);
 } finally {await db.close();}
});
