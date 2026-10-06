import assert from 'node:assert/strict';
import test from 'node:test';
import {readdir,readFile} from 'node:fs/promises';
import {createHostedDatabase,hostedFixture as f,loginHostedFixture} from './fixtures/hosted-database';
import {grantHostedFixture} from './fixtures/hosted-grants';

test('case SOP source catalog preserves every form section and original source text',async()=>{
 const catalog=JSON.parse(await readFile(new URL('../src/platform/intake/case-sop-catalog.json',import.meta.url),'utf8'));
 assert.equal(catalog.forms.length,7);assert.match(catalog.sopText,/PERIODE 2025-2027/);
 assert.deepEqual(catalog.forms.map((t:any)=>t.sections.length),[11,14,18,18,25,24,21]);
 for(const form of catalog.forms){assert.equal(form.sections[0].key,'HEADER');assert.equal(new Set(form.sections.map((s:any)=>s.key)).size,form.sections.length);assert.ok(form.sections.every((s:any)=>typeof s.guide==='string'));assert.ok(form.sections[0].guide.length>0);}
});
test('case forms persist drafts, preserve revisions, enforce case permissions and never issue decisions',async()=>{
 const names=(await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>/^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300|^20261005003100|^20261006003200/.test(n)).sort();
 const db=await createHostedDatabase(names.map(n=>'migrations/'+n),[]);
 const caseId=crypto.randomUUID(),division=crypto.randomUUID(),formId=crypto.randomUUID();
 const save=(input:object)=>db.query<{r:any}>('select public.kpi_case_form_save($1,$2) r',[caseId,JSON.stringify(input)]);
 const list=()=>db.query<{r:any[]}>('select public.kpi_case_forms($1) r',[caseId]);
 const input={id:formId,code:'07',expectedVersion:0,title:'Draf keputusan kasus',answers:{HEADER:'Administrasi pemeriksaan',F:'Belum ada keputusan yang ditetapkan'}};
 try{
  await db.exec(`insert into org.divisions(id,organization_id,code,name) values('${division}','${f.organization}','IOD','I&O');
   insert into intake.cases(id,organization_id,period_id,iod_division_id,secretary_account_id,owner_account_id,kind,subject,description,tracking_hash,request_key) values('${caseId}','${f.organization}','${f.period}','${division}','${f.reviewer}','${f.owner}','PENGADUAN','Isolated case fixture','Isolated test case, not a real complaint','${'a'.repeat(64)}',gen_random_uuid());
   insert into intake.case_personnel values('${caseId}','${f.owner}',true);`);
  for(const p of ['CASE_READ','CASE_MANAGE'])await grantHostedFixture(db,f.owner,p,caseId);
  await loginHostedFixture(db,f.owner);
  assert.equal((await save(input)).rows[0].r.version,1);assert.equal((await save(input)).rows[0].r.version,1);
  const updated=(await save({...input,expectedVersion:1,answers:{F:'Analisis belum disahkan oleh pejabat berwenang'}})).rows[0].r;
  assert.equal(updated.version,2);assert.equal(updated.history.length,2);assert.equal(updated.history[1].answers.F,input.answers.F);
  await assert.rejects(save({...input,expectedVersion:1}),/changed/);
  await assert.rejects(save({...input,id:crypto.randomUUID(),answers:{X:'Invalid section'}}),/section/);
  await assert.rejects(save({...input,id:crypto.randomUUID(),answers:{F:{malicious:'object'}}}),/section/);
  for(const code of ['01','02','03','04','05','06'])await save({...input,id:crypto.randomUUID(),code,answers:{A:'Recorded draft section'}});
  await save({...input,id:crypto.randomUUID(),code:'04',title:'Wawancara kedua',answers:{A:'Distinct interview record'}});
  assert.equal((await list()).rows[0].r.length,8);
  await db.exec('reset role;');const state=(await db.query<{status:string;version:number}>('select status,version from intake.cases where id=$1',[caseId])).rows[0];assert.equal(state.status,'RECEIVED');assert.equal(state.version,1);
  await loginHostedFixture(db,f.stranger);await assert.rejects(list(),/denied/);await assert.rejects(save(input),/denied/);
  await db.exec(`reset role;update intake.cases set status='IN_REVIEW' where id='${caseId}';`);await loginHostedFixture(db,f.owner);await assert.rejects(save({...input,expectedVersion:2}),/review or closed/);
  await db.exec(`reset role;update identity.permission_grants set revoked_at=now() where account_id='${f.owner}' and permission='CASE_READ';`);await loginHostedFixture(db,f.owner);await assert.rejects(list(),/denied/);
  await db.exec('reset role;set role anon;');await assert.rejects(list(),/permission denied/);await assert.rejects(db.exec('select * from intake.case_forms'),/permission denied/);
 }finally{await db.close();}
});
