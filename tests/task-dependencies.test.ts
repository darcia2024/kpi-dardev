import assert from "node:assert/strict";
import test from "node:test";
import { TestTaskService } from "@/platform/work/task-service";

const admin = "00000000-0000-4000-8000-000000000101";
const pengurus = "00000000-0000-4000-8000-000000000102";
const evidence = "00000000-0000-4000-8000-000000002001";

test("a dependent task cannot enter review before every prerequisite is accepted", () => {
  const service = new TestTaskService();
  const prerequisite = service.list()[0];
  const dependent = service.create({ title: "Tindak lanjut bergantung · TEST", organizationCode: prerequisite.organizationCode, periodCode: prerequisite.periodCode, ownerAccountId: pengurus, createdByAccountId: admin, dependencyTaskIds: [prerequisite.id] });
  assert.equal(service.submit(dependent.id, pengurus, evidence), null);
  assert.equal(service.submit(prerequisite.id, pengurus, evidence)?.status, "IN_REVIEW");
  assert.equal(service.review(prerequisite.id, admin, true)?.status, "ACCEPTED");
  assert.equal(service.submit(dependent.id, pengurus, evidence)?.status, "IN_REVIEW");
});

test("returned tasks require a reason and preserve it in the audit trail", () => {
  const service = new TestTaskService();
  const task = service.list()[0];
  assert.equal(service.submit(task.id, pengurus, evidence)?.status, "IN_REVIEW");
  assert.equal(service.review(task.id, admin, false), null);
  assert.equal(service.review(task.id, admin, false, "Bukti perlu diperjelas")?.status, "IN_PROGRESS");
  assert.equal(service.listAudit(task.id).at(-1)?.reason, "Bukti perlu diperjelas");
});

test("dependencies cannot point to another period", () => {
  const service = new TestTaskService();
  const task = service.list()[0];
  assert.throws(() => service.create({ title: "Lintas periode", organizationCode: task.organizationCode, periodCode: "PERIODE_LAIN", ownerAccountId: pengurus, createdByAccountId: admin, dependencyTaskIds: [task.id] }));
});
