import assert from 'node:assert/strict';
import test from 'node:test';
import {readdir} from 'node:fs/promises';
import {createHostedDatabase,hostedFixture as f,loginHostedFixture} from './fixtures/hosted-database';
import {grantHostedFixture} from './fixtures/hosted-grants';
test('hosted task extensions enforce delegation, graph completion, templates and revoked access',async()=>{
 const names=(await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>/^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300/.test(n)).sort();
 const db=await createHostedDatabase(names.map(n=>'migrations/'+n),[]);
 type Task={id:string;version:number;ownerAccountId:string};
 async function create(title:string){return (await db.query<{r:Task}>(`select public.kpi_task_create('KPI','CURRENT',$1,'Fixture description',$2,gen_random_uuid()) r`,[title,f.owner])).rows[0].r;}
 async function extend(t:Task,command:string,extra:object={}){return (await db.query<{r:Task}>('select public.kpi_task_extend($1,$2,$3,$4) r',[t.id,t.version,command,JSON.stringify({note:'Documented fixture action',...extra})])).rows[0].r;}
 async function action(t:Task,command:string){return (await db.query<{r:Task}>('select public.kpi_task_action($1,$2,$3,\'Documented fixture action\') r',[t.id,t.version,command])).rows[0].r;}
 try{
 for(const a of [f.owner,f.reviewer])for(const p of ['TASK_READ','TASK_CREATE','TASK_SUBMIT','TASK_REVIEW'])await grantHostedFixture(db,a,p);
 await loginHostedFixture(db,f.owner);let parent=await create('Parent task fixture');let prerequisite=await create('Prerequisite fixture');
 await assert.rejects(extend(parent,'DELEGATE',{ownerAccountId:f.stranger}),/assignment/);
 parent=await extend(parent,'DELEGATE',{ownerAccountId:f.reviewer});assert.equal(parent.ownerAccountId,f.reviewer);
 await assert.rejects(extend({...parent,version:1},'COMMENT'),/changed/);
 parent=await extend(parent,'SUBTASK',{title:'Child task fixture',description:'Prepare supporting material',ownerAccountId:f.owner,requestKey:crypto.randomUUID()});
 let extensions=(await db.query<{r:any}>('select public.kpi_task_extensions($1) r',[parent.id])).rows[0].r;let child:Task=extensions.subtasks[0];assert.equal(extensions.blocked,true);
 await assert.rejects(extend(child,'DEPENDENCY_ADD',{prerequisiteId:parent.id}),/cycle/);
 prerequisite=await extend(prerequisite,'DEPENDENCY_ADD',{prerequisiteId:parent.id});await assert.rejects(extend(child,'DEPENDENCY_ADD',{prerequisiteId:prerequisite.id}),/cycle/);
 prerequisite=await extend(prerequisite,'DEPENDENCY_REMOVE',{prerequisiteId:parent.id});parent=await extend(parent,'DEPENDENCY_ADD',{prerequisiteId:prerequisite.id});await assert.rejects(extend(prerequisite,'DEPENDENCY_ADD',{prerequisiteId:parent.id}),/cycle/);
 parent=await extend(parent,'TEMPLATE');assert.equal((await db.query<{r:any[]}>('select public.kpi_task_templates(\'KPI\',\'CURRENT\',null) r')).rows[0].r.length,1);
 parent=await extend(parent,'DEADLINE',{dueAt:new Date(Date.now()+86400000).toISOString()});await assert.rejects(extend(parent,'DEADLINE',{dueAt:'2020-01-01T00:00:00Z'}),/Future/);
 await loginHostedFixture(db,f.reviewer);parent=await action(parent,'START');await assert.rejects(action(parent,'SUBMIT'),/prerequisites/);
 await loginHostedFixture(db,f.owner);child=await action(child,'START');child=await action(child,'SUBMIT');prerequisite=await action(prerequisite,'START');prerequisite=await action(prerequisite,'SUBMIT');
 await loginHostedFixture(db,f.reviewer);await action(child,'APPROVE');await action(prerequisite,'APPROVE');parent=await action(parent,'SUBMIT');await assert.rejects(action(parent,'APPROVE'),/Access denied/);
 await loginHostedFixture(db,f.owner);await assert.rejects(action(parent,'APPROVE'),/Access denied/);
 await loginHostedFixture(db,f.stranger);await assert.rejects(db.query('select public.kpi_task_extensions($1)',[parent.id]),/denied/);
 await db.exec('reset role;');await db.query("update governance.access_decisions set suspended_at=now() where recipient_account_id=$1 and permission='TASK_READ'",[f.owner]);await loginHostedFixture(db,f.owner);await assert.rejects(db.query('select public.kpi_task_extensions($1)',[parent.id]),/denied/);assert.equal((await db.query<{r:any[]}>('select public.kpi_task_people($1) r',[child.id]).catch(()=>({rows:[{r:[]}]}))).rows[0].r.length,0);
 await db.exec('reset role;set role anon;');await assert.rejects(db.query('select * from work.task_dependencies'),/permission denied/);await assert.rejects(db.query('select public.kpi_task_extend($1,1,\'COMMENT\',\'{}\')',[parent.id]),/permission denied/);
 }finally{await db.close();}
});


test('module attachments preserve classification and meeting followups use approved minutes',async()=>{
 const names=(await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>/^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300/.test(n)).sort();const db=await createHostedDatabase(names.map(n=>'migrations/'+n),[]);
 try{
 for(const a of [f.owner,f.reviewer])for(const p of ['MEETING_READ','MEETING_MANAGE','TASK_READ','TASK_CREATE','TASK_SUBMIT','ASSET_READ','KNOWLEDGE_READ','KNOWLEDGE_WRITE'])await grantHostedFixture(db,a,p);
 await db.exec('reset role;');const asset=(await db.query<{id:string}>(`insert into files.managed_assets(organization_id,period_id,owner_account_id,original_name,mime_type,size_bytes,sha256,object_path,request_key,status) values($1,$2,$3,'fixture.pdf','application/pdf',100,$4,'fixture-file',gen_random_uuid(),'AVAILABLE') returning id`,[f.organization,f.period,f.owner,'a'.repeat(64)])).rows[0].id;await grantHostedFixture(db,f.owner,'ASSET_READ',asset);await grantHostedFixture(db,f.reviewer,'ASSET_READ',asset);
 await loginHostedFixture(db,f.owner);let m=(await db.query<{r:any}>("select public.kpi_meeting_create('KPI','CURRENT',$1,null) r",[JSON.stringify({title:'Fixture agenda',agenda:'Review the activity plan',startsAt:new Date(Date.now()+3600000).toISOString(),participantAccountIds:[f.owner,f.reviewer],idempotencyKey:crypto.randomUUID()})])).rows[0].r;
 const attach=()=>db.query("select public.kpi_module_attachment_action('MEETING',$1,$2,'ATTACH',$3,'Approved fixture attachment') r",[m.id,m.version,asset]);await assert.rejects(attach(),/Classify/);
 await db.exec('reset role;');await db.query("update governance.information_resources set classification='INTERNAL' where id=$1",[asset]);await loginHostedFixture(db,f.owner);m.version=(await attach()).rows[0].r.version;assert.equal((await db.query<{r:any[]}>("select public.kpi_module_attachments('MEETING',$1) r",[m.id])).rows[0].r.length,1);
 const input={title:'Follow up the approved activity',description:'Prepare the action agreed in the final minutes.',note:'Approved fixture decision',requestKey:crypto.randomUUID()};const follow=()=>db.query<{r:any}>('select public.kpi_meeting_followup_create($1,$2,$3) r',[m.id,m.version,JSON.stringify(input)]);await assert.rejects(follow(),/Approved minutes/);
 m=(await db.query<{r:any}>("select public.kpi_meeting_action($1,$2,'SAVE_MINUTES',$3) r",[m.id,m.version,JSON.stringify({summary:'The activity plan has been discussed and recorded.',note:'Fixture minutes'})])).rows[0].r;
 m=(await db.query<{r:any}>("select public.kpi_meeting_action($1,$2,'SUBMIT_MINUTES',$3) r",[m.id,m.version,JSON.stringify({note:'Fixture submit'})])).rows[0].r;
 await loginHostedFixture(db,f.reviewer);m=(await db.query<{r:any}>("select public.kpi_meeting_action($1,$2,'APPROVE_MINUTES',$3) r",[m.id,m.version,JSON.stringify({note:'Fixture independent approval'})])).rows[0].r;
 const task=(await follow()).rows[0].r;assert.equal((await follow()).rows[0].r.id,task.id);assert.equal((await db.query<{r:any[]}>('select public.kpi_meeting_followups($1) r',[m.id])).rows[0].r.length,1);
 await assert.rejects(db.query("select public.kpi_module_attachment_action('MEETING',$1,$2,'REMOVE',$3,'Attempt after final')",[m.id,m.version,asset]),/finalized/);
 await loginHostedFixture(db,f.stranger);await assert.rejects(db.query("select public.kpi_module_attachments('MEETING',$1)",[m.id]),/denied/);
 }finally{await db.close();}
});


test('editorial publication checks privacy, classification, schedules and current authority',async()=>{
 const names=(await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>/^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300/.test(n)).sort();const db=await createHostedDatabase(names.map(n=>'migrations/'+n),[]);
 try{
 for(const a of [f.owner,f.reviewer])for(const p of ['CONTENT_DRAFT_WRITE','CONTENT_REVIEW','CONTENT_PUBLISH'])await grantHostedFixture(db,a,p);
 const fields={title:'Informasi kegiatan KPI',summary:'Pengantar kegiatan yang telah disetujui.',body:'Penjelasan kegiatan pendidikan interaksi untuk masyarakat Indonesia di Mesir.',source:'Dokumen kegiatan resmi',locale:'id',slug:'kegiatan-resmi'};
 await loginHostedFixture(db,f.owner);let item=(await db.query<{r:any}>("select public.kpi_content_create('KPI','CURRENT','PUBLICATION',$1) r",[JSON.stringify({fields,idempotencyKey:crypto.randomUUID()})])).rows[0].r;
 const act=async(command:string,extra:object={})=>{item=(await db.query<{r:any}>('select public.kpi_content_action($1,$2,$3,$4) r',[item.id,item.version,command,JSON.stringify({note:'Independent fixture review',...extra})])).rows[0].r;};
 await assert.rejects(db.query('select public.kpi_content_metadata($1,$2,$3)',[item.id,item.version,JSON.stringify({category:'EVENT',metadata:{eventDate:'2026-10-03'},note:'Fixture metadata'})]),/location/);
 item=(await db.query<{r:any}>('select public.kpi_content_metadata($1,$2,$3) r',[item.id,item.version,JSON.stringify({category:'NEWS',metadata:{},note:'Fixture category'})])).rows[0].r;
 await act('SUBMIT');await loginHostedFixture(db,f.reviewer);await assert.rejects(act('APPROVE'),/privacy review/);await assert.rejects(act('APPROVE',{privacyReviewed:true}),/open classification/);
 await db.exec('reset role;');await db.query("update governance.information_resources set classification='TERBUKA' where id=$1",[item.id]);await loginHostedFixture(db,f.reviewer);await act('APPROVE',{privacyReviewed:true});
 await db.query("select public.kpi_content_schedule($1,$2,now()+interval '1 hour')",[item.id,item.version]);
 await db.exec("reset role;");await db.query("update content.publication_schedule set publish_at=now()-interval '1 minute' where item_id=$1",[item.id]);await db.exec('set role service_role;');assert.equal((await db.query<{r:number}>('select public.kpi_publish_due() r')).rows[0].r,1);assert.equal((await db.query<{r:number}>('select public.kpi_publish_due() r')).rows[0].r,0);
 await db.exec('reset role;set role anon;');assert.equal((await db.query<{r:any[]}>("select public.kpi_public_content('NEWS','id','KPI') r")).rows[0].r.length,1);assert.equal((await db.query<{r:any[]}>("select public.kpi_publications_list('id',null,'KPI') r")).rows[0].r.length,0);await assert.rejects(db.query('select public.kpi_publish_due()'),/permission denied/);
 await db.exec('reset role;');const asset=(await db.query<{id:string}>(`insert into files.managed_assets(organization_id,period_id,owner_account_id,original_name,mime_type,size_bytes,sha256,object_path,request_key,status) values($1,$2,$3,'public.pdf','application/pdf',100,$4,'fixture-public',gen_random_uuid(),'AVAILABLE') returning id`,[f.organization,f.period,f.owner,'a'.repeat(64)])).rows[0].id;await db.query("insert into files.module_attachments(module,entity_id,asset_id,created_by_account_id) values('CONTENT',$1,$2,$3)",[item.id,asset,f.owner]);await db.exec('set role anon;');assert.deepEqual((await db.query<{r:any[]}>("select public.kpi_public_content_assets($1,'KPI') r",[item.id])).rows[0].r,[]);await assert.rejects(db.query("select public.kpi_public_asset_delivery($1,$2,'KPI')",[item.id,asset]),/permission denied/);
 await db.exec('reset role;');await db.query("update governance.information_resources set classification='TERBUKA' where id=$1",[asset]);await db.exec('set role anon;');assert.equal((await db.query<{r:any[]}>("select public.kpi_public_content_assets($1,'KPI') r",[item.id])).rows[0].r.length,1);await db.exec('reset role;');await db.query("update governance.information_resources set hold_reference='Fixture hold' where id=$1",[asset]);await db.exec('set role service_role;');assert.equal((await db.query<{r:any}>("select public.kpi_public_asset_delivery($1,$2,'KPI') r",[item.id,asset])).rows[0].r,null);
 await db.exec('reset role;');await db.query("update content.managed_items set status='APPROVED' where id=$1",[item.id]);await db.query("update content.publication_schedule set status='PENDING' where item_id=$1",[item.id]);await db.query("update governance.access_decisions set suspended_at=now() where recipient_account_id=$1 and permission='CONTENT_PUBLISH'",[f.reviewer]);await db.exec('set role service_role;');assert.equal((await db.query<{r:number}>('select public.kpi_publish_due() r')).rows[0].r,0);
 await db.exec('reset role;');assert.equal((await db.query<{s:string}>('select status s from content.publication_schedule where item_id=$1',[item.id])).rows[0].s,'BLOCKED');assert.deepEqual((await db.query<{r:string[]}>("select content.sensitive_markers('Contact abc@example.org or +201234567890') r")).rows[0].r,['EMAIL','PHONE_OR_ID']);assert.deepEqual((await db.query<{r:string[]}>("select content.sensitive_markers('2026-10-03') r")).rows[0].r,[]);
 }finally{await db.close();}
});

test('reminder deliveries are opt-in, idempotent, generic and revoked before sending',async()=>{
 const names=(await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>/^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300/.test(n)).sort();const db=await createHostedDatabase(names.map(n=>'migrations/'+n),[]);
 try{
 for(const p of ['TASK_READ','TASK_CREATE','TASK_SUBMIT','NOTIFICATION_READ'])await grantHostedFixture(db,f.owner,p);
 await loginHostedFixture(db,f.owner);await db.query("select public.kpi_task_create('KPI','CURRENT','Private fixture title','Confidential task description',$1,gen_random_uuid(),now()+interval '1 hour')",[f.owner]);
 await db.exec('reset role;set role service_role;');await db.query('select public.kpi_enqueue_reminders()');assert.equal((await db.query<{r:any}>("select public.kpi_delivery_claim('EMAIL') r")).rows[0].r,null);
 await loginHostedFixture(db,f.owner);await db.query('select public.kpi_delivery_preferences($1)',[JSON.stringify({emailEnabled:true,whatsappEnabled:false})]);await assert.rejects(db.query('select public.kpi_delivery_preferences($1)',[JSON.stringify({emailEnabled:false,whatsappEnabled:true})]),/consent/);
 await db.exec('reset role;set role service_role;');await db.query('select public.kpi_enqueue_reminders()');await db.query('select public.kpi_enqueue_reminders()');const claim=(await db.query<{r:any}>("select public.kpi_delivery_claim('EMAIL') r")).rows[0].r;assert.ok(claim);assert.ok(!claim.message.includes('Private fixture'));assert.equal((await db.query<{r:boolean}>('select public.kpi_delivery_validate($1,$2) r',[claim.id,claim.claimToken])).rows[0].r,true);
 await db.exec('reset role;');await db.query("update governance.access_decisions set suspended_at=now() where recipient_account_id=$1 and permission='TASK_READ'",[f.owner]);await db.exec('set role service_role;');assert.equal((await db.query<{r:boolean}>('select public.kpi_delivery_validate($1,$2) r',[claim.id,claim.claimToken])).rows[0].r,false);await assert.rejects(db.query('select public.kpi_delivery_finish($1,gen_random_uuid(),true)',[claim.id]),/expired/);
 await db.exec('reset role;set role anon;');await assert.rejects(db.query("select public.kpi_delivery_claim('EMAIL')"),/permission denied/);
 }finally{await db.close();}
});

test('administration persists units and draft intake configuration without manufacturing permissions',async()=>{
 const names=(await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>/^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300/.test(n)).sort();const db=await createHostedDatabase(names.map(n=>'migrations/'+n),[]);
 try{
 await loginHostedFixture(db,f.owner);await assert.rejects(db.query("select public.kpi_roster_directory('KPI','CURRENT')"),/administrator/);
 await db.exec('reset role;');await db.query("update auth.users set raw_app_meta_data=jsonb_build_object('kpi_access',true,'kpi_role','ADMIN_SISTEM') where id=$1",[f.owner]);await db.exec("insert into identity.roles(code,name) values('ADMIN_SISTEM','Admin');");await db.query("insert into identity.account_roles(account_id,role_id) select $1,id from identity.roles where code='ADMIN_SISTEM'",[f.owner]);await db.query("insert into identity.system_administrators(account_id,approved_reason) values($1,'Isolated fixture approval')",[f.owner]);await loginHostedFixture(db,f.owner);
 const run=(command:string,input:object)=>db.query<{r:any}>("select public.kpi_roster_action('KPI','CURRENT',$1,$2) r",[command,JSON.stringify({note:'Official fixture configuration',...input})]);
 let directory=(await run('DIVISION',{code:'IOD',name:'Intelligence and Operation Division'})).rows[0].r;assert.equal(directory.divisions.length,1);directory=(await run('POSITION',{code:'IOD_MEMBER',name:'IOD Member',divisionId:directory.divisions[0].id})).rows[0].r;assert.ok(directory.positions.some((p:any)=>p.code==='IOD_MEMBER'));
 const cfg=(command:string,input:object)=>db.query<{r:any}>("select public.kpi_intake_configure('KPI','CURRENT',$1,$2) r",[command,JSON.stringify({note:'Official fixture configuration',...input})]);
 const configured=(await cfg('ROUTING',{secretaryAccountId:f.owner,iodDivisionId:directory.divisions[0].id,enabled:false})).rows[0].r;assert.equal(configured.ready,false);await assert.rejects(cfg('ROUTING',{secretaryAccountId:f.owner,iodDivisionId:directory.divisions[0].id,enabled:true}),/authority/);
 const template=(await cfg('TEMPLATE_CREATE',{kind:'PENGADUAN',title:'Formulir pengaduan',instructions:'Jelaskan waktu dan konteks kejadian.',reference:'Official fixture F01',fields:[{key:'context',label:'Konteks kejadian',required:true}]})).rows[0].r.templates[0];assert.equal(template.status,'DRAFT');await assert.rejects(cfg('TEMPLATE_APPROVE',{id:template.id,expectedVersion:template.version}),/authority/);
 await db.exec('reset role;');assert.equal((await db.query<{c:number}>('select count(*)::int c from identity.permission_grants')).rows[0].c,0);await db.exec('set role service_role;');assert.equal((await db.query<{r:any}>("select public.kpi_public_intake_template('KPI','PENGADUAN') r")).rows[0].r,null);
 await db.exec('reset role;set role anon;');await assert.rejects(db.query('select * from governance.mandate_submissions'),/permission denied/);
 }finally{await db.close();}
});


test('document revisions preserve old files and require separate access to each secret version',async()=>{
 const names=(await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>/^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300/.test(n)).sort();const db=await createHostedDatabase(names.map(n=>'migrations/'+n),[]);
 try{
 for(const p of ['ASSET_READ','ASSET_UPLOAD'])await grantHostedFixture(db,f.owner,p);
 const input={name:'pedoman.pdf',mimeType:'application/pdf',sizeBytes:100,sha256:'a'.repeat(64),idempotencyKey:crypto.randomUUID()};
 await loginHostedFixture(db,f.owner);const original=(await db.query<{r:any}>("select public.kpi_asset_register('KPI','CURRENT',$1) r",[JSON.stringify(input)])).rows[0].r;
 await assert.rejects(db.query('select public.kpi_asset_versions($1)',[original.id]),/denied/);
 await grantHostedFixture(db,f.owner,'ASSET_READ',original.id);await grantHostedFixture(db,f.owner,'ASSET_UPLOAD',original.id);await loginHostedFixture(db,f.owner);
 const nextInput={...input,idempotencyKey:crypto.randomUUID(),previousAssetId:original.id,sha256:'b'.repeat(64)};const next=(await db.query<{r:any}>("select public.kpi_asset_register('KPI','CURRENT',$1) r",[JSON.stringify(nextInput)])).rows[0].r;assert.equal(next.revision,2);assert.equal(next.rootAssetId,original.id);assert.equal((await db.query<{r:any}>("select public.kpi_asset_register('KPI','CURRENT',$1) r",[JSON.stringify(nextInput)])).rows[0].r.id,next.id);
 assert.equal((await db.query<{r:any[]}>('select public.kpi_asset_versions($1) r',[original.id])).rows[0].r.length,1);await grantHostedFixture(db,f.owner,'ASSET_READ',next.id);await loginHostedFixture(db,f.owner);assert.equal((await db.query<{r:any[]}>('select public.kpi_asset_versions($1) r',[original.id])).rows[0].r.length,2);await assert.rejects(db.query('select public.kpi_asset_scan_request($1)',[next.id]),/denied/);
 await db.exec('reset role;');await db.query("update governance.information_resources set hold_reference='Fixture evidence hold' where id=$1",[original.id]);await loginHostedFixture(db,f.owner);await assert.rejects(db.query("select public.kpi_asset_register('KPI','CURRENT',$1)",[JSON.stringify({...nextInput,idempotencyKey:crypto.randomUUID()})]),/Evidence hold/);
 await loginHostedFixture(db,f.stranger);await assert.rejects(db.query('select public.kpi_asset_versions($1)',[original.id]),/denied/);
 }finally{await db.close();}
});
