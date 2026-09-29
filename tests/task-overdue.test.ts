import assert from "node:assert/strict";
import test from "node:test";
import { isTaskOverdue } from "../src/platform/work/task-overdue";

test("overdue count excludes completed tasks and uses timestamp boundaries", () => {
  const now = Date.parse("2026-09-23T08:00:00.000Z");
  assert.equal(isTaskOverdue({ status: "IN_PROGRESS", dueAt: "2026-09-23T07:59:59.000Z" }, now), true);
  assert.equal(isTaskOverdue({ status: "IN_REVIEW", dueAt: "2026-09-23T07:59:59.000Z" }, now), true);
  assert.equal(isTaskOverdue({ status: "IN_PROGRESS", dueAt: "2026-09-23T08:00:00.000Z" }, now), false);
  assert.equal(isTaskOverdue({ status: "ACCEPTED", dueAt: "2026-09-22T00:00:00.000Z" }, now), false);
  assert.equal(isTaskOverdue({ status: "ARCHIVED", dueAt: "2026-09-22T00:00:00.000Z" }, now), false);
  assert.equal(isTaskOverdue({ status: "BLOCKED" }, now), false);
});
