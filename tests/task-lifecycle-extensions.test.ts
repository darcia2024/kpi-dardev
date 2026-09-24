import assert from "node:assert/strict";
import test from "node:test";
import { TestTaskService } from "../src/platform/work/task-service";

const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };

test("task deadline extension requires its creator, a later date, and an audit reason", () => {
  const service = new TestTaskService();
  const firstDueAt = new Date(Date.now() + 24 * 60 * 60_000).toISOString();
  const nextDueAt = new Date(Date.now() + 48 * 60 * 60_000).toISOString();
  const task = service.create({ ...scope, title: "Periksa laporan", ownerAccountId: "owner", createdByAccountId: "creator", dueAt: firstDueAt });
  assert.equal(service.extendDeadline(task.id, "owner", nextDueAt, "Butuh waktu tambahan"), null);
  assert.equal(service.extendDeadline(task.id, "creator", firstDueAt, "Butuh waktu tambahan"), null);
  assert.equal(service.extendDeadline(task.id, "creator", nextDueAt, ""), null);
  assert.equal(service.extendDeadline(task.id, "creator", nextDueAt, "Butuh waktu tambahan")?.dueAt, nextDueAt);
  assert.equal(service.listAudit(task.id).at(-1)?.action, "TASK_DEADLINE_EXTENDED");
});

test("task cancellation archives only an open task with an accountable reason", () => {
  const service = new TestTaskService();
  const task = service.create({ ...scope, title: "Tugas sementara", ownerAccountId: "owner", createdByAccountId: "creator" });
  assert.equal(service.close(task.id, "owner", "CANCEL", "Kegiatan berubah"), null);
  assert.equal(service.close(task.id, "creator", "CANCEL", ""), null);
  assert.equal(service.close(task.id, "creator", "ARCHIVE", "Kegiatan berubah"), null);
  assert.equal(service.close(task.id, "creator", "CANCEL", "Kegiatan berubah")?.status, "ARCHIVED");
  assert.equal(service.close(task.id, "creator", "CANCEL", "Dua kali"), null);
  assert.equal(service.listAudit(task.id).at(-1)?.action, "TASK_CANCELLED");
});

test("delegation changes submit ownership and records the previous owner", () => {
  const service = new TestTaskService();
  const task = service.create({ ...scope, title: "Koordinasi divisi", ownerAccountId: "owner", createdByAccountId: "creator" });
  assert.equal(service.delegate(task.id, "owner", "successor", "Pergantian penanggung jawab"), null);
  assert.equal(service.delegate(task.id, "creator", "owner", "Pergantian penanggung jawab"), null);
  assert.equal(service.delegate(task.id, "creator", "successor", ""), null);
  assert.equal(service.delegate(task.id, "creator", "successor", "Pergantian penanggung jawab")?.ownerAccountId, "successor");
  assert.equal(service.submit(task.id, "owner", "evidence"), null);
  assert.equal(service.listAudit(task.id).at(-1)?.action, "TASK_DELEGATED");
  assert.equal(service.listAudit(task.id).at(-1)?.metadata?.previousOwnerAccountId, "owner");
});
