import assert from "node:assert/strict";
import test from "node:test";
import { taskAssignmentNotices } from "../src/platform/notifications/inbox-service";
import type { TaskRecord } from "../src/platform/work/task-service";
import type { BusinessAuditRecord } from "../src/platform/audit/local-business-audit-service";

const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };
const baseTask: TaskRecord = { id: "task-1", title: "Tinjau laporan", ...scope, ownerAccountId: "recipient", createdByAccountId: "sender", status: "IN_PROGRESS", progress: 0, updatedAt: "2026-09-23T08:00:00.000Z" };
const audit: BusinessAuditRecord[] = [{ id: "event-1", action: "TASK_CREATED", module: "task", entityType: "task", entityId: "task-1", actorAccountId: "sender", result: "SUCCESS", requestId: "local:task-1", createdAt: "2026-09-22T08:00:00.000Z" }];

test("inbox includes only tasks assigned to the signed-in recipient in the right period", () => {
  const tasks = [baseTask, { ...baseTask, id: "task-2", ownerAccountId: "another" }, { ...baseTask, id: "task-3", periodCode: "old" }, { ...baseTask, id: "task-4", createdByAccountId: "recipient" }];
  const notices = taskAssignmentNotices(tasks, audit, "recipient", scope.organizationCode, scope.periodCode);
  assert.equal(notices.length, 1);
  assert.equal(notices[0].recipientAccountId, "recipient");
  assert.equal(notices[0].description, "Tinjau laporan");
  assert.equal(notices[0].createdAt, "2026-09-22T08:00:00.000Z");
  assert.equal(taskAssignmentNotices(tasks, audit, "another", scope.organizationCode, scope.periodCode).length, 1);
});
