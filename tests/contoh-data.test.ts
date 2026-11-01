import assert from "node:assert/strict";
import test from "node:test";
import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const admin = "093b761f-d1c7-433c-8153-0f271e85664c";
const sql = async (file: string) => readFile(new URL(`../supabase/${file}`, import.meta.url), "utf8");

// Same shape as production on 1 November 2026: one organization, the official period still PLANNED, one approved administrator.
async function productionLikeDatabase(): Promise<PGlite> {
  const db = await PGlite.create();
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
  create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb,aud text,role text,banned_until timestamptz);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
  const names = (await readdir(new URL("../supabase/migrations/", import.meta.url))).filter((n) => /^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300|^20261005003100|^20261006003[23]00/.test(n)).sort();
  for (const file of ["migrations/20260921000000_platform.sql", "manual/paket-2-install.sql", ...names.map((n) => `migrations/${n}`)]) {
    let text = (await sql(file)).replace("create extension if not exists pgcrypto;", "");
    if (file.endsWith("_system_administration.sql")) {
      const start = text.indexOf("-- Approved account: global module administration");
      text = text.slice(0, start) + text.slice(text.indexOf("create function public.kpi_admin_ready()", start));
    }
    await db.exec(text);
  }
  await db.exec(`insert into auth.users(id,email,email_confirmed_at,raw_app_meta_data) values('${admin}','kpippmimesirofficial@gmail.com',now(),'{"kpi_access":true,"kpi_role":"ADMIN_SISTEM"}');
  insert into identity.accounts(id,auth_user_id,email,display_name,status) values('${admin}','${admin}','kpippmimesirofficial@gmail.com','KPI PPMI Mesir','ACTIVE');
  insert into identity.roles(code,name,is_system_role) values('ADMIN_SISTEM','ADMIN_SISTEM',true);
  insert into identity.account_roles(account_id,role_id) select '${admin}',id from identity.roles where code='ADMIN_SISTEM';
  insert into identity.system_administrators(account_id,approved_reason) values('${admin}','Persetujuan pengguna');
  insert into org.organizations(code,name) values('KPI_PPMI_MESIR','KPI PPMI Mesir');
  insert into org.periods(organization_id,code,starts_on,ends_on,status) select id,'2026_2027',current_date-15,current_date+350,'PLANNED' from org.organizations;
  insert into identity.super_administrators(account_id,organization_id,approved_reference) select '${admin}',id,'Persetujuan pengguna' from org.organizations;`);
  return db;
}

async function asAccount<T>(db: PGlite, account: string, query: string): Promise<T> {
  await db.exec("reset role;set role authenticated;");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [account]);
  try { return (await db.query<{ value: T }>(`select ${query} as value`)).rows[0].value; }
  finally { await db.exec("reset role;"); await db.query("select set_config('request.jwt.claim.sub','',false)"); }
}

test("data CONTOH terpasang lewat aturan aplikasi, terlihat di situs dan portal, lalu bisa dihapus bersih", async () => {
  const db = await productionLikeDatabase();
  try {
    await db.exec(await sql("manual/contoh-isi.sql"));

    // Situs publik membaca konten lewat RPC anonim, sama seperti website.
    await db.exec("set role anon;");
    const pub = async (category: string) => (await db.query<{ value: { title: string }[] }>("select public.kpi_public_content($1,'id','KPI_PPMI_MESIR') value", [category])).rows[0].value;
    assert.equal((await pub("NEWS")).length, 2);
    assert.equal((await pub("EVENT")).length, 2);
    assert.equal((await pub("ROSTER")).length, 4);
    const publications = (await db.query<{ value: { title: string }[] }>("select public.kpi_publications_list('id',null,'KPI_PPMI_MESIR') value")).rows[0].value;
    assert.equal(publications.length, 2, "draf yang masih direview tidak tampil di situs");
    assert.ok([...publications, ...await pub("NEWS"), ...await pub("EVENT")].every((item) => item.title.startsWith("CONTOH · ")), "setiap konten publik berlabel CONTOH");
    assert.equal((await db.query<{ value: unknown[] }>("select public.kpi_publications_list('en',null,'KPI_PPMI_MESIR') value")).rows[0].value.length, 1);
    await db.exec("reset role;");
    assert.equal((await db.query<{ value: boolean }>("select public.kpi_intake_ready('KPI_PPMI_MESIR') value")).rows[0].value, false, "kanal pengaduan publik tetap tertutup");

    // Super admin KPI melihat semua modul di periode CONTOH.
    const list = (fn: string) => asAccount<unknown[]>(db, admin, fn);
    assert.equal((await list("public.kpi_tasks_list('KPI_PPMI_MESIR','CONTOH')")).length, 6);
    assert.equal((await list("public.kpi_meetings_list('KPI_PPMI_MESIR','CONTOH')")).length, 2);
    assert.equal((await list("public.kpi_content_list('KPI_PPMI_MESIR','CONTOH','PUBLICATION')")).length, 12);
    assert.equal((await list("public.kpi_content_list('KPI_PPMI_MESIR','CONTOH','KNOWLEDGE')")).length, 1);
    assert.equal((await list("public.kpi_management_list('BUDGET','KPI_PPMI_MESIR','CONTOH')")).length, 2);
    assert.equal((await list("public.kpi_management_list('FINANCE','KPI_PPMI_MESIR','CONTOH')")).length, 2);
    assert.equal((await list("public.kpi_management_list('EVALUATION','KPI_PPMI_MESIR','CONTOH')")).length, 1);
    assert.equal((await list("public.kpi_management_list('HANDOVER','KPI_PPMI_MESIR','CONTOH')")).length, 1);
    assert.equal((await list("public.kpi_cases_list('KPI_PPMI_MESIR','CONTOH')")).length, 2);
    const statuses = (await list("public.kpi_tasks_list('KPI_PPMI_MESIR','CONTOH')") as { status: string }[]).map((t) => t.status).sort();
    assert.deepEqual(statuses, ["DONE", "IN_PROGRESS", "IN_REVIEW", "OPEN", "OPEN", "REVISION"]);

    // Super admin bisa langsung mencoba alur kerja, dan aturan independensi tetap berlaku.
    const created = await asAccount<{ id: string }>(db, admin, `public.kpi_task_create('KPI_PPMI_MESIR','CONTOH','Coba buat tugas','Uji',
      'c0a00000-0000-4000-8000-000000000005',gen_random_uuid())`);
    assert.ok(created.id);
    await assert.rejects(asAccount(db, admin, `public.kpi_management_action((select id from management.records where kind='BUDGET' and status='IN_REVIEW'),2,'APPROVE','{"note":"coba"}')`), /independent|approval|denied/i,
      "anggaran yang diajukan bendahara tetap butuh persetujuan orang lain");

    // Akun contoh tidak bisa login: tanpa sandi dan diblokir.
    const banned = (await db.query<{ n: number }>("select count(*)::int n from auth.users where email like '%@contoh.invalid' and banned_until='infinity'")).rows[0].n;
    assert.equal(banned, 6);
    await assert.rejects(db.exec(await sql("manual/contoh-isi.sql")), /sudah terpasang/);
    await db.exec("rollback;");

    await db.exec(await sql("manual/contoh-hapus.sql"));
    const left = (await db.query<{ n: number }>(`select (select count(*) from org.periods where code='CONTOH')+(select count(*) from identity.accounts where email like '%@contoh.invalid')
      +(select count(*) from auth.users where email like '%@contoh.invalid')+(select count(*) from content.managed_items)+(select count(*) from work.tasks)+(select count(*) from intake.cases)
      +(select count(*) from org.positions where code like 'CONTOH%')+(select count(*) from org.divisions where code like 'CONTOH%') n`)).rows[0].n;
    assert.equal(left, 0);
    const official = (await db.query<{ status: string }>("select status from org.periods where code='2026_2027'")).rows[0];
    assert.equal(official.status, "PLANNED", "periode resmi tidak tersentuh");
    await db.exec(await sql("manual/contoh-isi.sql"));
  } finally { await db.close(); }
});
