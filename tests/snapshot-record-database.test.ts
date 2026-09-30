import test from "node:test";
import assert from "node:assert/strict";
import { PersistentRecords, RecordConflictError } from "../src/platform/data/local-record-store";
import { NamespaceNotLoadedError, SnapshotRecordDatabase } from "../src/platform/data/snapshot-record-database";
import { TestTaskService } from "../src/platform/work/task-service";

const owner = "00000000-0000-4000-8000-00000000b001";
const creator = "00000000-0000-4000-8000-00000000b002";

test("snapshot reads loaded records sorted by id and never applies fixtures", () => {
  const db = new SnapshotRecordDatabase([
    { namespace: "tasks", id: "b", revision: 2, payload: { title: "B" } },
    { namespace: "tasks", id: "a", revision: 1, payload: { title: "A" } }
  ]);
  const records = new PersistentRecords<{ title: string }>(db, "tasks", [["fixture", { title: "TEST fixture" }]]);
  assert.deepEqual(Array.from(records.values()).map((record) => record.title), ["A", "B"]);
  assert.equal(records.get("fixture"), undefined, "seed data must not leak into production");
  assert.deepEqual(db.changes(), []);
});

test("stale writes are rejected and repeated writes keep the loaded base revision", () => {
  const db = new SnapshotRecordDatabase([{ namespace: "tasks", id: "t1", revision: 4, payload: { n: 0 } }]);
  assert.throws(() => db.write("tasks", "t1", { n: 1 }, 3), RecordConflictError);
  assert.equal(db.write("tasks", "t1", { n: 1 }, 4), 5);
  assert.equal(db.write("tasks", "t1", { n: 2 }, 5), 6);
  assert.deepEqual(db.changes(), [{ namespace: "tasks", id: "t1", expectedRevision: 4, payload: { n: 2 } }]);
  assert.deepEqual(JSON.parse(db.read("tasks", "t1")!.payload), { n: 2 });
});

test("payloads are stored as JSON, dropping undefined fields like the local store", () => {
  const db = new SnapshotRecordDatabase([]);
  db.write("tasks", "t1", { title: "X", note: undefined }, 0);
  assert.deepEqual(db.changes()[0].payload, { title: "X" });
});

test("write-only namespaces accept new records but cannot be read or updated", () => {
  const db = new SnapshotRecordDatabase([], new Set(["business-audit"]));
  assert.throws(() => db.read("business-audit", "a1"), NamespaceNotLoadedError);
  assert.throws(() => db.entries("business-audit"), NamespaceNotLoadedError);
  assert.equal(db.write("business-audit", "a1", { action: "X" }, 0), 1);
  assert.throws(() => db.write("business-audit", "a1", { action: "Y" }, 0), RecordConflictError);
  assert.throws(() => db.write("business-audit", "a2", { action: "Y" }, 1), RecordConflictError);
  assert.deepEqual(db.changes(), [{ namespace: "business-audit", id: "a1", expectedRevision: 0, payload: { action: "X" } }]);
});

test("the task service runs unchanged on a snapshot and queues its audit event", () => {
  const db = new SnapshotRecordDatabase([], new Set(["business-audit"]));
  const tasks = new TestTaskService(db);
  assert.deepEqual(tasks.list(), [], "production snapshot starts without TEST fixtures");
  const task = tasks.create({ title: "Siapkan agenda rapat", organizationCode: "KPI_PPMI_MESIR", periodCode: "2026_2027", ownerAccountId: owner, createdByAccountId: creator });
  assert.equal(tasks.start(task.id, owner)?.startedAt !== undefined, true);
  const changes = db.changes();
  assert.deepEqual(changes.filter((change) => change.namespace === "tasks").map((change) => [change.id, change.expectedRevision]), [[task.id, 0]]);
  assert.equal(changes.filter((change) => change.namespace === "business-audit").length, 2);
});
