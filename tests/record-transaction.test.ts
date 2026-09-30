import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { getLocalRecordDatabase, RecordConflictError } from "../src/platform/data/local-record-store";
import { withRecordTransaction, type RecordStoreGateway } from "../src/platform/data/record-transaction";
import { SnapshotRecordDatabase, type RecordChange, type StoredRecord } from "../src/platform/data/snapshot-record-database";
import { TestTaskService } from "../src/platform/work/task-service";
import { getLocalTaskService } from "../src/platform/work/task-service";

const owner = "00000000-0000-4000-8000-00000000c001";
const creator = "00000000-0000-4000-8000-00000000c002";
const scope = { organizationCode: "KPI_PPMI_MESIR", periodCode: "2026_2027" };

class MemoryGateway implements RecordStoreGateway {
  loads: Array<{ skip: readonly string[]; include: readonly string[] }> = [];
  commits: RecordChange[][] = [];
  constructor(private readonly records: StoredRecord[] = [], private readonly failWith?: Error) {}
  async load(_organizationId: string, skip: readonly string[], include: readonly string[]): Promise<StoredRecord[]> {
    this.loads.push({ skip, include });
    return this.records;
  }
  async commit(_organizationId: string, _actorId: string | null, changes: RecordChange[]): Promise<void> {
    if (this.failWith) throw this.failWith;
    this.commits.push(changes);
  }
}

test("services inside a transaction use the request snapshot and commit once", async () => {
  const gateway = new MemoryGateway();
  const task = await withRecordTransaction(gateway, { organizationId: "org", actorId: creator }, () => {
    assert.ok(getLocalRecordDatabase() instanceof SnapshotRecordDatabase);
    return getLocalTaskService().create({ title: "Tugas pertama", ...scope, ownerAccountId: owner, createdByAccountId: creator });
  });
  assert.deepEqual(gateway.loads, [{ skip: ["business-audit"], include: [] }]);
  assert.equal(gateway.commits.length, 1);
  assert.deepEqual(gateway.commits[0].map((change) => change.namespace).sort(), ["business-audit", "tasks"]);
  assert.equal(gateway.commits[0].find((change) => change.namespace === "tasks")?.id, task.id);
});

test("requested write-only namespaces are loaded", async () => {
  const gateway = new MemoryGateway();
  await withRecordTransaction(gateway, { organizationId: "org", include: ["business-audit"] }, () => undefined);
  assert.deepEqual(gateway.loads, [{ skip: [], include: ["business-audit"] }]);
});

test("nothing is committed when the handler throws, and read-only requests commit nothing", async () => {
  const gateway = new MemoryGateway();
  await assert.rejects(withRecordTransaction(gateway, { organizationId: "org" }, () => {
    getLocalTaskService().create({ title: "Tidak jadi", ...scope, ownerAccountId: owner, createdByAccountId: creator });
    throw new Error("handler failed");
  }), /handler failed/);
  await withRecordTransaction(gateway, { organizationId: "org" }, () => getLocalTaskService().list());
  assert.equal(gateway.commits.length, 0);
});

test("a failed commit surfaces as an error instead of a silent success", async () => {
  const gateway = new MemoryGateway([], new RecordConflictError());
  await assert.rejects(withRecordTransaction(gateway, { organizationId: "org" }, () => getLocalTaskService().create({ title: "Bentrok", ...scope, ownerAccountId: owner, createdByAccountId: creator })), RecordConflictError);
});

// End-to-end against the real SQL functions (the same migration applied in Supabase).
class PgliteGateway implements RecordStoreGateway {
  constructor(private readonly db: PGlite) {}
  async load(organizationId: string, skip: readonly string[], include: readonly string[]): Promise<StoredRecord[]> {
    const result = await this.db.query<{ records: StoredRecord[] }>("select public.kpi_load_records($1, $2, $3) as records", [organizationId, [...skip], [...include]]);
    return result.rows[0].records;
  }
  async commit(organizationId: string, actorId: string | null, changes: RecordChange[]): Promise<void> {
    try {
      await this.db.query("select public.kpi_commit_records($1, $2, $3::jsonb)", [organizationId, actorId, JSON.stringify(changes)]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("RECORD_CONFLICT")) throw new RecordConflictError();
      throw error;
    }
  }
}

async function migratedDatabase(): Promise<{ db: PGlite; organizationId: string }> {
  const db = await PGlite.create({ extensions: { pgcrypto } });
  await db.exec("create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;");
  const dir = join(process.cwd(), "supabase", "migrations");
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".sql")).sort()) await db.exec(readFileSync(join(dir, file), "utf8"));
  const organizationId = (await db.query<{ id: string }>("insert into org.organizations (code, name) values ('KPI_PPMI_MESIR', 'KPI') returning id")).rows[0].id;
  return { db, organizationId };
}

test("task workflow persists through the SQL record store and concurrent edits conflict", async () => {
  const { db, organizationId } = await migratedDatabase();
  try {
    const gateway = new PgliteGateway(db);
    const created = await withRecordTransaction(gateway, { organizationId, actorId: creator }, () =>
      getLocalTaskService().create({ title: "Susun laporan kegiatan", ...scope, ownerAccountId: owner, createdByAccountId: creator }));

    const reloaded = await withRecordTransaction(gateway, { organizationId }, () => getLocalTaskService().get(created.id));
    assert.equal(reloaded?.title, "Susun laporan kegiatan");

    // Two requests load the same revision; the second one to commit must lose.
    let releaseFirst!: () => void;
    const firstLoaded = new Promise<void>((resolve) => { releaseFirst = resolve; });
    let continueFirst!: () => void;
    const firstMayCommit = new Promise<void>((resolve) => { continueFirst = resolve; });
    const first = withRecordTransaction(gateway, { organizationId, actorId: owner }, async () => {
      const result = new TestTaskService(getLocalRecordDatabase()).addSubtask(created.id, owner, "Kumpulkan foto");
      releaseFirst();
      await firstMayCommit;
      return result;
    });
    await firstLoaded;
    await withRecordTransaction(gateway, { organizationId, actorId: owner }, () => getLocalTaskService().start(created.id, owner));
    continueFirst();
    await assert.rejects(first, RecordConflictError);

    const final = await withRecordTransaction(gateway, { organizationId, include: ["business-audit"] }, () => ({ task: getLocalTaskService().get(created.id), audit: getLocalTaskService().listAudit(created.id).map((event) => event.action) }));
    assert.ok(final.task?.startedAt, "the committed edit is kept");
    assert.equal(final.task?.subtasks, undefined, "the conflicting edit is discarded entirely");
    assert.deepEqual(final.audit, ["TASK_CREATED", "TASK_STARTED"], "audit rows of the failed request are rolled back too");
  } finally { await db.close(); }
});
