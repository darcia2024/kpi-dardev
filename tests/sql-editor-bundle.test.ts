import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const root = process.cwd();
// Line endings differ between checkouts (CRLF on Windows); Postgres treats them the same.
const read = (...parts: string[]) => readFileSync(join(root, ...parts), "utf8").replace(/\r\n/g, "\n");
const bundle = read("supabase", "sql-editor", "01-struktur-database.sql");
const organizationStep = read("supabase", "sql-editor", "02-organisasi-dan-periode.sql");

test("the SQL Editor bundle contains every migration, unchanged and in order, and no TEST data", () => {
  const migrations = readdirSync(join(root, "supabase", "migrations")).filter((name) => name.endsWith(".sql")).sort();
  let cursor = 0;
  for (const name of migrations) {
    const body = read("supabase", "migrations", name).trim();
    const at = bundle.indexOf(body, cursor);
    assert.ok(at >= cursor, `${name} is missing or out of order; regenerate supabase/sql-editor/01-struktur-database.sql`);
    cursor = at + body.length;
  }
  assert.ok(!/KPI_TEST|admin\.test@|pengurus\.test@/.test(bundle), "TEST fixtures must never reach the KPI database");
});

async function supabaseLike(): Promise<PGlite> {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec("create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;");
  return db;
}

test("the organization step refuses to run until the period dates are filled in", async () => {
  const db = await supabaseLike();
  try {
    await db.exec(bundle);
    await assert.rejects(db.exec(organizationStep), /invalid input syntax for type date/);
  } finally { await db.close(); }
});

test("both steps together create the KPI organization with one active period", async () => {
  const db = await supabaseLike();
  try {
    await db.exec(bundle);
    const filled = organizationStep.replace("ISI-TANGGAL-MULAI", "2026-09-01").replace("ISI-TANGGAL-SELESAI", "2027-08-31");
    await db.exec(filled);
    await db.exec(filled); // running it twice changes nothing
    const rows = (await db.query<{ code: string; status: string }>("select p.code, p.status from org.periods p join org.organizations o on o.id = p.organization_id where o.code = 'KPI_PPMI_MESIR'")).rows;
    assert.deepEqual(rows, [{ code: "2026_2027", status: "ACTIVE" }]);
    await db.exec("set role service_role");
    const organization = (await db.query<{ code: string }>("select * from public.kpi_get_organization('KPI_PPMI_MESIR')")).rows;
    assert.equal(organization[0]?.code, "KPI_PPMI_MESIR");
  } finally { await db.close(); }
});
