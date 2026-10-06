import assert from 'node:assert/strict';
import test from 'node:test';
import {readdir} from 'node:fs/promises';
import {createHostedDatabase,hostedFixture as f,loginHostedFixture} from './fixtures/hosted-database';
import {grantHostedFixture} from './fixtures/hosted-grants';
import catalog from '../src/platform/intake/case-sop-catalog.json';
import {renderCaseFormHtml} from '../src/platform/intake/case-form-export';
import {readSection,sectionFilled,type CaseForm} from '../src/platform/intake/case-form-contract';

test('structured sections preserve old notes and printable export escapes untrusted content',()=>{
 assert.equal(readSection('Catatan lama').notes,'Catatan lama');assert.equal(sectionFilled(JSON.stringify({format:'fields-v1',fields:{f1:false},notes:'',notApplicableReason:''})),false);
 const form:CaseForm={id:crypto.randomUUID(),code:'01',title:'<script>attack()</script>',stage:'AUTHORIZATION_RECORDED',version:2,templateVersion:catalog.version,answers:{A:'<img src=x onerror=attack()>'},updatedAt:new Date().toISOString(),authorName:'Petugas',history:[]};
 const html=renderCaseFormHtml(form,catalog.forms[0],'fixture-nonce');assert.ok(!html.includes('<script>attack'));assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('&lt;img'));assert.match(html,/DRAF — BELUM DISAHKAN/);assert.match(html,/nonce="fixture-nonce"/);
});

test('structured fields, evidence custody and draft review obey version, permissions and independent review',async()=>{
 const names=(await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>/^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300|^20261005003100|^20261006003200/.test(n)).sort();
 const db=await createHostedDatabase(names.map(n=>'migrations/'+n),[]),caseId=crypto.randomUUID(),division=crypto.randomUUID(),evidenceId=crypto.randomUUID(),formId=crypto.randomUUID();
 const save=(input:object)=>db.query<{r:CaseForm}>('select public.kpi_case_form_save($1,$2) r',[caseId,JSON.stringify(input)]);
 const act=(input:object)=>db.query<{r:any}>('select public.kpi_case_operation($1,$2) r',[caseId,JSON.stringify({note:'Isolated documented action',...input})]);
 const list=()=>db.query<{r:any}>('select public.kpi_case_operations($1) r',[caseId]);
 const fields={title:'Evidence fixture',source:'Isolated source',acquisition:'Submitted by fixture',condition:'Good condition',verification:'UNVERIFIED',location:'Locked cabinet A',assetId:'',receivedOn:'2026-10-06',verifiedOn:'',verificationNote:'',custodian:'Fixture custodian'};
 const structured=(fields:object)=>JSON.stringify({format:'fields-v1',fields,notes:'',notApplicableReason:''});
 try{
  await db.exec(`insert into org.divisions(id,organization_id,code,name) values('${division}','${f.organization}','IOD','I&O');
  insert into intake.cases(id,organization_id,period_id,iod_division_id,secretary_account_id,owner_account_id,kind,subject,description,tracking_hash,request_key) values('${caseId}','${f.organization}','${f.period}','${division}','${f.reviewer}','${f.owner}','PENGADUAN','Isolated operational fixture','Isolated test case without real personal data','${'b'.repeat(64)}',gen_random_uuid());insert into intake.case_personnel values('${caseId}','${f.owner}',true);`);
  for(const account of [f.owner,f.reviewer])for(const permission of ['CASE_READ','CASE_MANAGE','CASE_REVIEW'])await grantHostedFixture(db,account,permission,caseId);
  await loginHostedFixture(db,f.owner);
  await assert.rejects(act({action:'EVIDENCE_SAVE',id:evidenceId,expectedVersion:0,fields:{...fields,assetId:crypto.randomUUID()}}),/attachment access/);
  await act({action:'EVIDENCE_SAVE',id:evidenceId,expectedVersion:0,fields});
  await assert.rejects(act({action:'EVIDENCE_SAVE',id:evidenceId,expectedVersion:1,fields:{...fields,location:'Different cabinet'}}),/transfer/);
  await act({action:'EVIDENCE_TRANSFER',id:evidenceId,expectedVersion:1,fields:{...fields,location:'Locked cabinet B'}});
  let evidence=(await list()).rows[0].r.evidence[0];assert.equal(evidence.version,2);assert.equal(evidence.history.length,2);assert.equal(evidence.history[0].snapshot.previousLocation,'Locked cabinet A');assert.equal(evidence.history[1].snapshot.location,'Locked cabinet A');
  await assert.rejects(act({action:'EVIDENCE_SAVE',id:evidenceId,expectedVersion:1,fields}),/changed/);
  await assert.rejects(act({action:'EVIDENCE_SAVE',id:evidenceId,expectedVersion:2,fields:{...fields,location:'Locked cabinet B',verification:'VERIFIED'}}),/basis and date/);
  await assert.rejects(save({id:formId,code:'01',title:'Structured fixture',expectedVersion:0,answers:{HEADER:structured({evil:'Injected field'})}}),/structured field/);
  await assert.rejects(save({id:formId,code:'01',title:'Structured fixture',expectedVersion:0,answers:{HEADER:structured({evidence_refs:crypto.randomUUID()})}}),/reference denied/);
  for(const template of catalog.forms){const dateSection=template.sections.find(s=>s.fields.some(v=>v.kind==='date'));if(dateSection){const date=dateSection.fields.find(v=>v.kind==='date')!;await assert.rejects(save({id:crypto.randomUUID(),code:template.code,title:'Invalid date fixture',expectedVersion:0,answers:{[dateSection.key]:structured({[date.key]:'2026-99-99'})}}),/Invalid date/);}}
  const input={id:formId,code:'01',title:'Structured fixture',expectedVersion:0,answers:{HEADER:structured({evidence_refs:evidenceId}),A:'Catatan lama tetap terbaca'}};
  await save(input);await act({action:'SUBMIT',id:formId,expectedVersion:1});
  await assert.rejects(save({...input,expectedVersion:2}),/locked/);
  await assert.rejects(act({action:'REVIEW',id:formId,expectedVersion:2}),/Independent/);
  await loginHostedFixture(db,f.reviewer);await act({action:'REQUEST_REVISION',id:formId,expectedVersion:2});
  await loginHostedFixture(db,f.owner);await save({...input,expectedVersion:3,answers:{A:'Revised by assigned officer'}});await act({action:'SUBMIT',id:formId,expectedVersion:4});
  await loginHostedFixture(db,f.reviewer);await act({action:'REVIEW',id:formId,expectedVersion:5});
  await assert.rejects(act({action:'RECORD_AUTHORIZATION',id:formId,expectedVersion:6,reference:'External document number'}),/reference required/);
  await db.exec('reset role;');const asset=(await db.query<{id:string}>(`insert into files.managed_assets(organization_id,period_id,owner_account_id,original_name,mime_type,size_bytes,sha256,object_path,request_key,status) values($1,$2,$3,'authorization-fixture.pdf','application/pdf',100,$4,'case-authorization-fixture',gen_random_uuid(),'AVAILABLE') returning id`,[f.organization,f.period,f.owner,'c'.repeat(64)])).rows[0].id;
  await db.query("insert into files.module_attachments(module,entity_id,asset_id,created_by_account_id) values('CASE',$1,$2,$3)",[caseId,asset,f.owner]);
  await loginHostedFixture(db,f.reviewer);await assert.rejects(act({action:'RECORD_AUTHORIZATION',id:formId,expectedVersion:6,reference:'Document fixture',assetId:asset}),/reference required/);
  await grantHostedFixture(db,f.reviewer,'ASSET_READ',asset);await loginHostedFixture(db,f.reviewer);await act({action:'RECORD_AUTHORIZATION',id:formId,expectedVersion:6,reference:'Document fixture',assetId:asset});
  assert.equal((await list()).rows[0].r.events.length,5);
  await db.exec('reset role;');await assert.rejects(db.query("update files.module_attachments set removed_at=now() where entity_id=$1 and asset_id=$2",[caseId,asset]),/prevents attachment removal/);
  await db.exec(`update identity.permission_grants set revoked_at=now() where account_id='${f.reviewer}' and permission='ASSET_READ';`);await loginHostedFixture(db,f.reviewer);assert.equal((await list()).rows[0].r.attachments.length,0);assert.equal((await list()).rows[0].r.events[4].assetId,null);
  await loginHostedFixture(db,f.stranger);await assert.rejects(list(),/denied/);await assert.rejects(act({action:'EVIDENCE_SAVE',id:evidenceId,expectedVersion:2,fields}),/denied/);
  await db.exec(`reset role;update identity.permission_grants set revoked_at=now() where account_id='${f.owner}' and permission='CASE_READ';`);await loginHostedFixture(db,f.owner);await assert.rejects(list(),/denied/);
  await db.exec('reset role;');const state=(await db.query<{status:string;version:number}>('select status,version from intake.cases where id=$1',[caseId])).rows[0];assert.equal(state.status,'RECEIVED');assert.equal(state.version,1);
  await db.exec('set role anon;');await assert.rejects(list(),/permission denied/);await assert.rejects(db.exec('select * from intake.case_evidence'),/permission denied/);
 }finally{await db.close();}
});
