// Runs the real hosted portal against an in-memory database so tutorial screenshots show real screens with sample data.
// Nothing here reaches production: Supabase traffic goes to this process, and no real account or key is used.
import { spawn } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const backendPort = 54399;
const appPort = Number(process.env.TUTORIAL_PORT ?? 3100);
const serviceKey = "tutorial-capture-service-role";
const admin = "093b761f-d1c7-433c-8153-0f271e85664c";

const sql = (file) => readFileSync(join(root, "supabase", file), "utf8");
const db = await PGlite.create();
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb,aud text,role text,banned_until timestamptz);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);`);
const names = readdirSync(join(root, "supabase", "migrations")).filter((n) => /^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300|^20261005003100|^20261006003[23]00|^202611/.test(n)).sort();
for (const file of ["migrations/20260921000000_platform.sql", "manual/paket-2-install.sql", ...names.map((n) => `migrations/${n}`)]) {
  let text = sql(file).replace("create extension if not exists pgcrypto;", "");
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
 insert into identity.system_administrators(account_id,approved_reason) values('${admin}','Tutorial capture');
 insert into org.organizations(code,name) values('KPI_PPMI_MESIR','KPI PPMI Mesir');
 insert into org.periods(organization_id,code,starts_on,ends_on,status) select id,'2026_2027',current_date-15,current_date+350,'PLANNED' from org.organizations;
 insert into identity.super_administrators(account_id,organization_id,approved_reference) select '${admin}',id,'Tutorial capture' from org.organizations;`);
await db.exec(sql("manual/contoh-isi.sql"));
await db.exec(readFileSync(join(here, "seed.sql"), "utf8"));
await db.exec("reset role;");

const literal = (value) => value === null || value === undefined ? "null"
  : typeof value === "number" || typeof value === "boolean" ? String(value)
  : `'${(typeof value === "string" ? value : JSON.stringify(value)).replaceAll("'", "''")}'`;
const accountOf = (token) => { try { return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).sub; } catch { return null; } };
let queue = Promise.resolve();
const exclusive = (work) => { const run = queue.then(work, work); queue = run.catch(() => undefined); return run; };
async function rpc(name, args, token) {
  if (!/^[a-z_0-9]+$/.test(name)) throw Object.assign(new Error("bad function"), { code: "42883" });
  const call = `public.${name}(${Object.entries(args).map(([k, v]) => `${k} => ${literal(v)}`).join(",")})`;
  return exclusive(async () => {
    try {
      await db.exec("begin");
      if (token === serviceKey) await db.exec("set local role service_role");
      else { const sub = accountOf(token); await db.exec(`set local role ${sub ? "authenticated" : "anon"}`); await db.query("select set_config('request.jwt.claim.sub',$1,true)", [sub ?? ""]); }
      const result = await db.query(`select ${call} as value`);
      await db.exec("commit");
      return result.rows[0]?.value ?? null;
    } catch (error) { await db.exec("rollback"); throw error; }
  });
}
async function userOf(token) {
  const id = accountOf(token);
  if (!id) return null;
  return exclusive(async () => {
    const found = await db.query("select u.id,u.email,u.email_confirmed_at,u.raw_app_meta_data,a.display_name from auth.users u left join identity.accounts a on a.auth_user_id=u.id where u.id=$1", [id]);
    const row = found.rows[0];
    return row ? { id: row.id, aud: "authenticated", role: "authenticated", email: row.email, email_confirmed_at: row.email_confirmed_at, app_metadata: row.raw_app_meta_data, user_metadata: { display_name: row.display_name }, created_at: "2026-01-01T00:00:00Z" } : null;
  });
}
const backend = createServer(async (request, response) => {
  const send = (status, body) => { response.writeHead(status, { "content-type": "application/json" }); response.end(JSON.stringify(body)); };
  const chunks = []; for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString();
  const path = request.url.split("?")[0];
  const token = (request.headers.authorization ?? "").replace(/^Bearer /, "");
  try {
    if (path === "/auth/v1/user") { const user = await userOf(token); return user ? send(200, user) : send(401, { code: 401, msg: "invalid" }); }
    if (path === "/auth/v1/.well-known/jwks.json") return send(200, { keys: [] });
    if (path.startsWith("/storage/v1/")) return send(200, { Key: path });
    if (path.startsWith("/rest/v1/rpc/")) return send(200, await rpc(path.slice(13), raw ? JSON.parse(raw) : {}, token));
    return send(404, { message: "not provided by the capture stand-in" });
  } catch (error) { return send(error.code === "42501" ? 403 : 400, { code: error.code ?? "XX000", message: error.message, details: null, hint: null }); }
});
await new Promise((resolve) => backend.listen(backendPort, "127.0.0.1", resolve));
console.log(`capture backend ready on ${backendPort}`);

const next = spawn(process.execPath, [join(root, "node_modules", "next", "dist", "bin", "next"), "dev", "--port", String(appPort)], {
  cwd: root, stdio: "inherit",
  env: { ...process.env, KPI_APP_ENV: "staging", KPI_APP_NAME: "kpi-ppmi-mesir", KPI_REQUEST_ID_HEADER: "x-request-id", KPI_TEST_AUTH_ENABLED: "false", KPI_AUTH_PROVIDER: "supabase",
    KPI_SUPABASE_URL: "https://tutorial.supabase.invalid", KPI_SUPABASE_PUBLISHABLE_KEY: "tutorial-capture-publishable", KPI_SUPABASE_SERVICE_ROLE_KEY: serviceKey, KPI_DEFAULT_ORGANIZATION_CODE: "KPI_PPMI_MESIR",
    TUTORIAL_BACKEND_URL: `http://127.0.0.1:${backendPort}`, NODE_OPTIONS: `--import ${pathToFileURL(join(here, "preload.mjs")).href}` }
});
next.on("exit", (code) => process.exit(code ?? 0));
