import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const migrationsDir = join(process.cwd(), "supabase", "migrations");

async function freshDatabase(): Promise<{ db: PGlite; organizationId: string }> {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  // Supabase ships these roles; the migrations must lock them out.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
  `);
  for (const file of readdirSync(migrationsDir).filter((name) => name.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(migrationsDir, file), "utf8"));
  }
  const result = await db.query<{ id: string }>("insert into org.organizations (code, name) values ('KPI_SQL_TEST', 'KPI SQL TEST') returning id");
  return { db, organizationId: result.rows[0].id };
}

type Change = { namespace: string; id: string; expectedRevision: number; payload: unknown };

async function commit(db: PGlite, organizationId: string, changes: Change[] | unknown, actorId: string | null = null): Promise<number> {
  const result = await db.query<{ kpi_commit_records: number }>("select public.kpi_commit_records($1, $2, $3::jsonb)", [organizationId, actorId, JSON.stringify(changes)]);
  return result.rows[0].kpi_commit_records;
}

type LoadedRecord = { namespace: string; id: string; revision: number; payload: Record<string, unknown> };

async function load(db: PGlite, organizationId: string, skip: string[] = [], include: string[] = []): Promise<LoadedRecord[]> {
  const result = await db.query<{ records: LoadedRecord[] }>("select public.kpi_load_records($1, $2, $3) as records", [organizationId, skip, include]);
  return result.rows[0].records;
}

test("commit inserts and updates records, then load returns the latest revision", async () => {
  const { db, organizationId } = await freshDatabase();
  try {
    const actor = "00000000-0000-4000-8000-00000000a001";
    assert.equal(await commit(db, organizationId, [{ namespace: "tasks", id: "t1", expectedRevision: 0, payload: { title: "Satu" } }], actor), 1);
    assert.equal(await commit(db, organizationId, [{ namespace: "tasks", id: "t1", expectedRevision: 1, payload: { title: "Satu revisi" } }], actor), 1);
    const rows = await load(db, organizationId);
    assert.deepEqual(rows.map((row) => [row.namespace, row.id, row.revision, row.payload.title]), [["tasks", "t1", 2, "Satu revisi"]]);
    const history = await db.query<{ revision: number; actor_id: string }>("select revision, actor_id from platform.record_revisions order by sequence");
    assert.deepEqual(history.rows.map((row) => [row.revision, row.actor_id]), [[1, actor], [2, actor]]);
  } finally { await db.close(); }
});

test("a stale revision aborts the whole change set", async () => {
  const { db, organizationId } = await freshDatabase();
  try {
    await commit(db, organizationId, [{ namespace: "tasks", id: "t1", expectedRevision: 0, payload: { title: "Awal" } }]);
    await assert.rejects(
      commit(db, organizationId, [
        { namespace: "business-audit", id: "a1", expectedRevision: 0, payload: { action: "X" } },
        { namespace: "tasks", id: "t1", expectedRevision: 5, payload: { title: "Basi" } }
      ]),
      /RECORD_CONFLICT/
    );
    const rows = await load(db, organizationId);
    assert.deepEqual(rows.map((row) => [row.namespace, row.id, row.revision]), [["tasks", "t1", 1]], "the audit row from the failed set must not persist");
    const history = await db.query("select * from platform.record_revisions");
    assert.equal(history.rows.length, 1);
  } finally { await db.close(); }
});

test("creating a record that already exists is a conflict, not an overwrite", async () => {
  const { db, organizationId } = await freshDatabase();
  try {
    await commit(db, organizationId, [{ namespace: "tasks", id: "t1", expectedRevision: 0, payload: { title: "Pertama" } }]);
    await assert.rejects(commit(db, organizationId, [{ namespace: "tasks", id: "t1", expectedRevision: 0, payload: { title: "Kedua" } }]), /RECORD_CONFLICT/);
    assert.equal((await load(db, organizationId))[0].payload.title, "Pertama");
  } finally { await db.close(); }
});

test("malformed change sets are rejected", async () => {
  const { db, organizationId } = await freshDatabase();
  try {
    await assert.rejects(commit(db, organizationId, { namespace: "tasks" }), /INVALID_CHANGESET/);
    await assert.rejects(commit(db, organizationId, [{ namespace: "tasks", id: "t1", expectedRevision: "0", payload: {} }]), /INVALID_CHANGESET/);
    await assert.rejects(commit(db, organizationId, [{ namespace: "tasks", id: "t1", expectedRevision: -1, payload: {} }]), /INVALID_CHANGESET/);
    await assert.rejects(commit(db, organizationId, [{ namespace: "Tasks!", id: "t1", expectedRevision: 0, payload: {} }]), /records_namespace_format/);
  } finally { await db.close(); }
});

test("load skips heavy namespaces unless they are requested", async () => {
  const { db, organizationId } = await freshDatabase();
  try {
    await commit(db, organizationId, [
      { namespace: "tasks", id: "t1", expectedRevision: 0, payload: {} },
      { namespace: "business-audit", id: "a1", expectedRevision: 0, payload: {} }
    ]);
    assert.deepEqual((await load(db, organizationId, ["business-audit"])).map((row) => row.namespace), ["tasks"]);
    assert.deepEqual((await load(db, organizationId, ["business-audit"], ["business-audit"])).map((row) => row.namespace), ["business-audit", "tasks"]);
  } finally { await db.close(); }
});

test("load returns more than the API's default 1000-row cap in a single value", async () => {
  const { db, organizationId } = await freshDatabase();
  try {
    const changes = Array.from({ length: 1_200 }, (_, index) => ({ namespace: "tasks", id: `t${String(index).padStart(5, "0")}`, expectedRevision: 0, payload: { index } }));
    assert.equal(await commit(db, organizationId, changes), 1_200);
    const rows = await load(db, organizationId);
    assert.equal(rows.length, 1_200);
    assert.equal(rows[0].id, "t00000");
    assert.equal(rows[1_199].id, "t01199");
  } finally { await db.close(); }
});

test("records of another organization are never loaded", async () => {
  const { db, organizationId } = await freshDatabase();
  try {
    const other = (await db.query<{ id: string }>("insert into org.organizations (code, name) values ('KPI_OTHER', 'Lain') returning id")).rows[0].id;
    await commit(db, other, [{ namespace: "tasks", id: "t1", expectedRevision: 0, payload: { secret: true } }]);
    assert.deepEqual(await load(db, organizationId), []);
  } finally { await db.close(); }
});

test("record history cannot be edited, deleted or truncated", async () => {
  const { db, organizationId } = await freshDatabase();
  try {
    await commit(db, organizationId, [{ namespace: "tasks", id: "t1", expectedRevision: 0, payload: {} }]);
    await assert.rejects(db.exec("update platform.record_revisions set payload = '{}'::jsonb"), /RECORD_HISTORY_IMMUTABLE/);
    await assert.rejects(db.exec("delete from platform.record_revisions"), /RECORD_HISTORY_IMMUTABLE/);
    await assert.rejects(db.exec("truncate platform.record_revisions"), /RECORD_HISTORY_IMMUTABLE/);
  } finally { await db.close(); }
});

test("browser roles cannot read tables or call the record functions; the service role can", async () => {
  const { db, organizationId } = await freshDatabase();
  try {
    await commit(db, organizationId, [{ namespace: "tasks", id: "t1", expectedRevision: 0, payload: {} }]);
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.query("select * from platform.records"), /permission denied/, `${role} must not read records`);
      await assert.rejects(db.query("select public.kpi_load_records($1)", [organizationId]), /permission denied/, `${role} must not load records`);
      await assert.rejects(db.query("select public.kpi_commit_records($1, null, '[]'::jsonb)", [organizationId]), /permission denied/, `${role} must not commit records`);
      await assert.rejects(db.query("select * from public.kpi_get_organization('KPI_SQL_TEST')"), /permission denied/, `${role} must not read organizations`);
      await db.exec("reset role");
    }
    await db.exec("set role service_role");
    assert.equal((await db.query<{ records: unknown[] }>("select public.kpi_load_records($1) as records", [organizationId])).rows[0].records.length, 1);
    assert.equal((await db.query<{ code: string }>("select * from public.kpi_get_organization(' kpi_sql_test ')")).rows[0].code, "KPI_SQL_TEST");
    await db.exec("reset role");
  } finally { await db.close(); }
});

test("period lookup returns the organization's periods newest first", async () => {
  const { db, organizationId } = await freshDatabase();
  try {
    await db.query("insert into org.periods (organization_id, code, starts_on, ends_on, status) values ($1, '2025_2026', '2025-09-01', '2026-08-31', 'CLOSED'), ($1, '2026_2027', '2026-09-01', '2027-08-31', 'ACTIVE')", [organizationId]);
    const rows = (await db.query<{ code: string; status: string }>("select * from public.kpi_list_periods($1)", [organizationId])).rows;
    assert.deepEqual(rows.map((row) => [row.code, row.status]), [["2026_2027", "ACTIVE"], ["2025_2026", "CLOSED"]]);
  } finally { await db.close(); }
});
