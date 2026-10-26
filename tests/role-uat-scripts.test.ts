import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,readdir} from 'node:fs/promises';
import {createHostedDatabase,hostedFixture as f,loginHostedFixture} from './fixtures/hosted-database';
const manual=(name:string)=>readFile(new URL(`../supabase/manual/${name}`,import.meta.url),'utf8');
function fill(sql:string,pairs:[string,string][]){for(const [from,to] of pairs){assert.ok(sql.includes(from),`Template value changed: ${from}`);sql=sql.replace(from,to);}return sql;}
test('role UAT scripts activate the period, accounts and first mandate, then F01 grants only approved permissions',async()=>{
 const names=(await readdir(new URL('../supabase/migrations/',import.meta.url))).filter(n=>/^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300|^20261005003100|^20261006003200/.test(n)).sort();
 const db=await createHostedDatabase(names.map(n=>'migrations/'+n),[]);
 try{
 const [period,accounts,mandate]=await Promise.all(['uji-peran-1-aktifkan-periode.sql','uji-peran-2-aktifkan-akun.sql','uji-peran-3-mandat-awal.sql'].map(manual));
 const ketua='00000000-0000-4000-8000-0000000000a1',pengurus='00000000-0000-4000-8000-0000000000a2',pending='00000000-0000-4000-8000-0000000000a3';
 await db.exec(`insert into identity.roles(code,name) values('ADMIN_SISTEM','Admin');insert into identity.account_roles(account_id,role_id) select '${f.stranger}',id from identity.roles where code='ADMIN_SISTEM';insert into identity.system_administrators(account_id,approved_reason) values('${f.stranger}','Isolated fixture technical approval');
 insert into org.organizations(code,name) values('KPI_PPMI_MESIR','KPI PPMI Mesir');
 insert into org.periods(organization_id,code,starts_on,ends_on,status) select id,'2026_2027',current_date-9,current_date+356,'PLANNED' from org.organizations where code='KPI_PPMI_MESIR';
 insert into auth.users values('${ketua}','Ketua.Uji@example.org',now(),'{}'),('${pengurus}','pengurus.uji@example.org',now(),null),('${pending}','belum@example.org',null,'{}');
 create function public.fixture_permission(wanted text,oid uuid,pid uuid) returns boolean language sql stable security definer as $$ select identity.has_permission(wanted,oid,pid) $$;grant execute on function public.fixture_permission(text,uuid,uuid) to authenticated;`);
 const ids=(await db.query<{oid:string;pid:string}>("select o.id oid,p.id pid from org.organizations o join org.periods p on p.organization_id=o.id where o.code='KPI_PPMI_MESIR'")).rows[0];
 const fails=async(sql:string,pattern:RegExp)=>{await assert.rejects(db.exec(sql),pattern);await db.exec('rollback');};
 const status=async()=>(await db.query<{status:string}>('select status from org.periods where id=$1',[ids.pid])).rows[0].status;

 const accountList=JSON.stringify([{email:'ketua.uji@example.org',nama:'Ketua Uji'},{email:'pengurus.uji@example.org',nama:'Pengurus Uji'}]);
 await fails(accounts,/Isi daftar akun/);
 await fails(fill(accounts,[["daftar jsonb := '[]';",`daftar jsonb := '${JSON.stringify([{email:'belum@example.org',nama:'Belum Verifikasi'}])}';`]]),/belum diverifikasi/);
 const filledAccounts=fill(accounts,[["daftar jsonb := '[]';",`daftar jsonb := '${accountList}';`]]);
 await db.exec(filledAccounts);await db.exec(filledAccounts);
 const activated=(await db.query<{email:string;roles:number;meta:{kpi_access:boolean;kpi_role:string}}>("select a.email,(select count(*)::int from identity.account_roles r where r.account_id=a.id) roles,u.raw_app_meta_data meta from identity.accounts a join auth.users u on u.id=a.auth_user_id where a.email like '%.uji@example.org' order by a.email")).rows;
 assert.deepEqual(activated.map(a=>[a.email,a.roles,a.meta.kpi_access,a.meta.kpi_role]),[['ketua.uji@example.org',1,true,'PENGURUS'],['pengurus.uji@example.org',1,true,'PENGURUS']]);
 assert.equal((await db.query<{n:number}>("select count(*)::int n from identity.permission_grants g join identity.accounts a on a.id=g.account_id where a.email like '%.uji@example.org'")).rows[0].n,0);

 const filledMandate=fill(mandate,[["pejabat_email text := null;","pejabat_email text := 'Ketua.Uji@example.org';"],["mandate_reference text := null;","mandate_reference text := 'Fixture written mandate reference';"]]);
 await fails(filledMandate,/Aktifkan periode/);
 await fails(period,/rujukan keputusan/);
 assert.equal(await status(),'PLANNED');
 const filledPeriod=fill(period,[["decision_reference text := null;","decision_reference text := 'Fixture period decision';"]]);
 await db.exec(filledPeriod);assert.equal(await status(),'ACTIVE');await db.exec(filledPeriod);
 await db.exec(filledMandate);await db.exec(filledMandate);
 const authorities=(await db.query<{id:string}>("select g.id from governance.access_authorities g join identity.accounts a on a.id=g.account_id where a.email='ketua.uji@example.org'")).rows;
 assert.equal(authorities.length,1);

 const pengurusAccount=(await db.query<{id:string}>("select id from identity.accounts where email='pengurus.uji@example.org'")).rows[0].id;
 await loginHostedFixture(db,f.stranger);
 await db.query("select public.kpi_roster_action('KPI_PPMI_MESIR','2026_2027','POSITION',$1)",[JSON.stringify({code:'PENGURUS_UJI',name:'Pengurus uji peran',note:'Fixture position'})]);
 await db.exec('reset role;');const position=(await db.query<{id:string}>("select id from org.positions where organization_id=$1 and code='PENGURUS_UJI'",[ids.oid])).rows[0].id;await loginHostedFixture(db,f.stranger);
 const today=new Date().toISOString().slice(0,10),end=new Date(Date.now()+300*86400000).toISOString().slice(0,10);
 await db.query("select public.kpi_roster_action('KPI_PPMI_MESIR','2026_2027','ASSIGN',$1)",[JSON.stringify({accountId:pengurusAccount,positionId:position,startsOn:today,endsOn:end,decisionReference:'Fixture assignment decision',note:'Fixture assignment'})]);

 const act=async(r:{id:string;version:number},action:string,input:Record<string,unknown>)=>(await db.query<{r:{id:string;version:number;status:string}}>('select public.kpi_governance_action($1,$2,$3,$4) r',[r.id,r.version,action,JSON.stringify(input)])).rows[0].r;
 await loginHostedFixture(db,pengurus);
 assert.equal((await db.query<{allowed:boolean}>("select public.fixture_permission('TASK_READ',$1,$2) allowed",[ids.oid,ids.pid])).rows[0].allowed,false);
 let request=(await db.query<{r:{id:string;version:number;status:string}}>('select public.kpi_governance_create($1,$2,$3) r',['ACCESS',JSON.stringify({organizationId:ids.oid,periodId:ids.pid,classification:'INTERNAL',formReference:'Fixture F01 UAT',requestType:'GRANT',permissions:['TASK_READ','TASK_SUBMIT','FINANCE_READ'],purpose:'Fixture role check',informationScope:'Fixture task metadata',mandateReference:'Fixture assignment decision',startsAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+86400000).toISOString()}),crypto.randomUUID()])).rows[0].r;
 await loginHostedFixture(db,ketua);
 request=await act(request,'DECIDE',{authorityId:authorities[0].id,outcome:'PARTIAL',approvedPermissions:['TASK_READ','TASK_SUBMIT'],reference:'Fixture F01 decision',needFinding:'Fixture need verified',note:'Fixture tasks only'});
 assert.equal(request.status,'PARTIAL');
 await loginHostedFixture(db,f.stranger);
 request=await act(request,'IMPLEMENT',{reference:'Fixture technical execution'});
 assert.equal(request.status,'IMPLEMENTED');
 await loginHostedFixture(db,pengurus);
 const allowed=async(p:string)=>(await db.query<{allowed:boolean}>("select public.fixture_permission($1,$2,$3) allowed",[p,ids.oid,ids.pid])).rows[0].allowed;
 assert.equal(await allowed('TASK_READ'),true);
 assert.equal(await allowed('TASK_SUBMIT'),true);
 assert.equal(await allowed('FINANCE_READ'),false);
 await loginHostedFixture(db,ketua);
 assert.equal(await allowed('TASK_READ'),false);
 }finally{await db.close();}
});
