import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
export const hostedFixture={owner:"00000000-0000-4000-8000-000000000001",reviewer:"00000000-0000-4000-8000-000000000002",stranger:"00000000-0000-4000-8000-000000000003",organization:"00000000-0000-4000-8000-000000000004",period:"00000000-0000-4000-8000-000000000005"};
export async function createHostedDatabase(migrations:string[],permissions:string[]):Promise<PGlite>{
 const db=await PGlite.create();
 try{
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
 for(const file of ["migrations/20260921000000_platform.sql","manual/paket-2-install.sql",...migrations]) {
  let sql=(await readFile(new URL(`../../supabase/${file}`,import.meta.url),"utf8")).replace("create extension if not exists pgcrypto;","");
  if(file==="migrations/20261002000400_system_administration.sql") {
   // Account activation is covered by hosted-admin.test.ts; ordinary fixtures must not acquire administrator access.
   const start=sql.indexOf("-- Approved account: global module administration");
   const end=sql.indexOf("create function public.kpi_admin_ready()",start);
   if(start<0||end<start)throw new Error("Administrator migration fixture boundary changed");
   sql=sql.slice(0,start)+sql.slice(end);
  }
  await db.exec(sql);
 }
 const {owner,reviewer,stranger,organization,period}=hostedFixture;
 await db.exec(`insert into auth.users values('${owner}','one@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}'),('${reviewer}','two@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}'),('${stranger}','three@example.org',now(),'{"kpi_access":true,"kpi_role":"PENGURUS"}');
 insert into identity.accounts(id,auth_user_id,email,display_name,status) select id,id,email,email,'ACTIVE' from auth.users;
 insert into identity.roles(code,name) values('PENGURUS','Pengurus');insert into identity.account_roles(account_id,role_id) select a.id,r.id from identity.accounts a cross join identity.roles r;
 insert into org.organizations(id,code,name) values('${organization}','KPI','KPI');insert into org.periods(id,organization_id,code,starts_on,ends_on,status) values('${period}','${organization}','CURRENT',current_date-1,current_date+1,'ACTIVE');
 insert into org.positions(organization_id,code,name) values('${organization}','MEMBER','Member');insert into org.assignments(account_id,position_id,period_id,starts_on) select a.id,p.id,'${period}',current_date-1 from identity.accounts a cross join org.positions p where a.id<>'${stranger}';`);
 for(const permission of permissions)await db.query(`insert into identity.permission_grants(account_id,organization_id,period_id,permission,reason) select id,$1,$2,$3,'Fixture' from identity.accounts where id<>$4`,[organization,period,permission,stranger]);
 return db;
 }catch(error){await db.close();throw error;}
}
export async function loginHostedFixture(db:PGlite,id:string):Promise<void>{await db.exec("reset role;set role authenticated;");await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);}
