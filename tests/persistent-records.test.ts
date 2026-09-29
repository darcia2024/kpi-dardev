import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { LocalRecordDatabase, PersistentRecords, RecordConflictError } from "../src/platform/data/local-record-store";
import { TestTaskService } from "../src/platform/work/task-service";
import { TestAssetRepository } from "../src/platform/storage/asset-repository";
import { TestAspirationService } from "../src/platform/intake/aspiration-service";
import { TestContentRepository } from "../src/platform/content/content-repository";
import { TestMeetingService } from "../src/platform/work/meeting-service";

const admin = "00000000-0000-4000-8000-000000000101";
const pengurus = "00000000-0000-4000-8000-000000000102";

test("committed tasks survive database reopen and seeding never overwrites them", () => {
  const folder = mkdtempSync(join(tmpdir(), "kpi-db-"));
  const path = join(folder, "test.sqlite");
  try {
    const db = new LocalRecordDatabase(path);
    try {
      const tasks = new TestTaskService(db);
      const task = tasks.list()[0];
      assert.equal(tasks.submit(task.id, task.ownerAccountId, "00000000-0000-4000-8000-000000002001")?.status, "IN_REVIEW");
      assert.equal(db.auditCount("tasks"), 1);
    } finally { db.close(); }
    const reopened = new LocalRecordDatabase(path);
    try { assert.equal(new TestTaskService(reopened).list()[0].status, "IN_REVIEW"); }
    finally { reopened.close(); }
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

test("stale updates are rejected without writing a second audit event", () => {
  const db = new LocalRecordDatabase(":memory:");
  try {
    const first = new PersistentRecords(db, "test", [["one", { value: 1 }]]);
    const second = new PersistentRecords<{ value: number }>(db, "test", []);
    first.get("one"); second.get("one");
    first.set("one", { value: 2 });
    assert.throws(() => second.set("one", { value: 3 }), RecordConflictError);
    assert.equal(second.get("one")?.value, 2);
    assert.equal(db.auditCount(), 1);
  } finally { db.close(); }
});

test("tasks reject missing, pending, wrong-scope and revoked evidence", async () => {
  const assets = new TestAssetRepository();
  const tasks = new TestTaskService(undefined, assets);
  const task = tasks.list()[0];
  assert.equal(tasks.submit(task.id, task.ownerAccountId, "missing"), null);
  assert.equal(tasks.submit(task.id, task.ownerAccountId, "00000000-0000-4000-8000-000000002003"), null);
  const available = "00000000-0000-4000-8000-000000002001";
  assert.equal(assets.canUseEvidence(available, task.ownerAccountId, "OTHER", task.periodCode), false);
  await assets.revokeDownload(available, task.ownerAccountId, "00000000-0000-4000-8000-000000000101");
  assert.equal(tasks.submit(task.id, task.ownerAccountId, available), null);
});

test("CMS, aspiration, and meeting TEST workflows retain committed state after reopen", async () => {
  const folder = mkdtempSync(join(tmpdir(), "kpi-workflow-"));
  const path = join(folder, "test.sqlite");
  const key = "00000000-0000-4000-8000-000000009001";
  try {
    const first = new LocalRecordDatabase(path);
    let trackingToken = "";
    try {
      const content = new TestContentRepository(first);
      const draft = await content.createDraft({ title: "Draft TEST", description: "Deskripsi TEST yang cukup untuk validasi.", type: "Panduan", meta: "TEST", href: "/publik", accent: "red", locale: "id", slug: "draft-test", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", authorAccountId: admin });
      assert.equal((await content.setState(draft.id, "IN_REVIEW"))?.version, 2);
      const aspirations = new TestAspirationService(first);
      trackingToken = aspirations.submit({ kind: "SARAN", subject: "Subjek TEST", description: "Deskripsi aspirasi sintetis yang cukup panjang.", idempotencyKey: key }).trackingToken;
      const meetings = new TestMeetingService(first);
      assert.equal(meetings.finalizeMinutes(meetings.list()[0].id)?.minutesState, "FINAL");
      assert.equal(meetings.castVote({ meetingId: meetings.list()[0].id, round: 1, voterAccountId: pengurus, choice: "SETUJU" }), "SETUJU");
    } finally { first.close(); }
    const reopened = new LocalRecordDatabase(path);
    try {
      assert.equal((await new TestContentRepository(reopened).listAll()).find((record) => record.slug === "draft-test")?.state, "IN_REVIEW");
      assert.equal(new TestAspirationService(reopened).track(trackingToken)?.status, "RECEIVED");
      assert.equal(new TestMeetingService(reopened).list()[0].minutesState, "FINAL");
    } finally { reopened.close(); }
  } finally { rmSync(folder, { recursive: true, force: true }); }
});
