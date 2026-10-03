import assert from "node:assert/strict";
import test from "node:test";
import {createHostedDatabase,hostedFixture,loginHostedFixture} from "./fixtures/hosted-database";

test("hosted editorial content isolates scopes, preserves revisions and never publishes unapproved drafts",async()=>{
 const db=await createHostedDatabase(["migrations/20261002000600_hosted_content.sql","migrations/20261002000700_publication_organization_scope.sql"],["CONTENT_DRAFT_WRITE","CONTENT_REVIEW","CONTENT_PUBLISH","KNOWLEDGE_READ","KNOWLEDGE_WRITE","KNOWLEDGE_REVIEW"]);
 const fields={title:"Pedoman interaksi",summary:"Pedoman memahami interaksi",body:"Materi pedoman interaksi dengan penjelasan yang bertanggung jawab.",source:"Dokumen pedoman KPI",locale:"id",slug:"pedoman-interaksi"};
 type Item={id:string;version:number;status:string;events:unknown[]};
 const input={fields,idempotencyKey:"00000000-0000-4000-8000-000000000099"};
 const create=(kind="PUBLICATION",body=input)=>db.query<{item:Item}>("select public.kpi_content_create('KPI','CURRENT',$1,$2::jsonb) item",[kind,JSON.stringify(body)]);
 const action=(id:string,v:number,c:string,extra:object={})=>db.query<{item:Item}>("select public.kpi_content_action($1,$2,$3,$4::jsonb) item",[id,v,c,JSON.stringify({note:"Catatan editorial",...extra})]);
 const published=()=>db.query<{items:unknown[]}>("select public.kpi_publications_list('id',null,'KPI') items");
 try{
 await loginHostedFixture(db,hostedFixture.owner);const item=(await create()).rows[0].item;
 assert.equal((await create()).rows[0].item.id,item.id);
 await assert.rejects(create("PUBLICATION",{...input,fields:{...fields,body:"Isi berubah cukup panjang untuk disimpan."}}),/Request key already used/);
 assert.deepEqual((await published()).rows[0].items,[]);
 await assert.rejects(action(item.id,1,"PUBLISH"),/Approved content required/);
 await action(item.id,1,"SAVE",{fields:{...fields,summary:"Ringkasan revisi tersimpan"}});
 await assert.rejects(action(item.id,1,"SUBMIT"),/reload first/);
 await action(item.id,2,"SUBMIT");await assert.rejects(action(item.id,3,"APPROVE"),/Independent reviewer/);
 await loginHostedFixture(db,hostedFixture.stranger);await assert.rejects(db.query("select public.kpi_content_detail($1)",[item.id]),/Access denied/);
 await loginHostedFixture(db,hostedFixture.reviewer);await action(item.id,3,"REQUEST_REVISION");
 await loginHostedFixture(db,hostedFixture.owner);await action(item.id,4,"SUBMIT");
 await loginHostedFixture(db,hostedFixture.reviewer);await action(item.id,5,"APPROVE");await action(item.id,6,"PUBLISH");
 await db.exec("reset role;set role anon;");assert.equal((await published()).rows[0].items.length,1);
 await assert.rejects(db.query("select public.kpi_content_detail($1)",[item.id]),/permission denied/);
 await loginHostedFixture(db,hostedFixture.reviewer);await action(item.id,7,"WITHDRAW");assert.deepEqual((await published()).rows[0].items,[]);
 await assert.rejects(db.exec("update content.managed_items set status='PUBLISHED'"),/permission denied/);
 await db.exec("reset role;");assert.equal((await db.query("select * from content.managed_revisions")).rows.length,8);
 await loginHostedFixture(db,hostedFixture.owner);const knowledge=(await create("KNOWLEDGE",{...input,idempotencyKey:"00000000-0000-4000-8000-000000000098"})).rows[0].item;
 await action(knowledge.id,1,"SUBMIT");await loginHostedFixture(db,hostedFixture.reviewer);await action(knowledge.id,2,"APPROVE");await action(knowledge.id,3,"PUBLISH");assert.deepEqual((await published()).rows[0].items,[]);
 }finally{await db.close();}
});
