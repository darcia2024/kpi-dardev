import assert from "node:assert/strict";
import test from "node:test";
import { queryBusinessAudit } from "@/platform/audit/audit-query";
import type { BusinessAuditRecord } from "@/platform/audit/local-business-audit-service";

const actor = "00000000-0000-4000-8000-000000000101";
const entity = "00000000-0000-4000-8000-000000003001";
const records: BusinessAuditRecord[] = [
  { id: "a", action: "TASK_CREATED", module: "task", entityType: "task", entityId: entity, actorAccountId: actor, result: "SUCCESS", requestId: "local:a", createdAt: "2026-09-24T01:00:00Z" },
  { id: "b", action: "TASK_SUBMITTED", module: "task", entityType: "task", entityId: entity, actorAccountId: "other", result: "SUCCESS", requestId: "local:b", createdAt: "2026-09-24T02:00:00Z" },
  { id: "c", action: "OTHER", module: "meeting", entityType: "meeting", entityId: "elsewhere", actorAccountId: actor, result: "SUCCESS", requestId: "local:c", createdAt: "2026-09-24T03:00:00Z" }
];

test("audit lookup filters the full history before limiting newest results", () => {
  assert.deepEqual(queryBusinessAudit(records, { actor, limit: 1 }).map((record) => record.id), ["c"]);
  assert.deepEqual(queryBusinessAudit(records, { actor, entity, limit: 1 }).map((record) => record.id), ["a"]);
  assert.deepEqual(queryBusinessAudit(records, { module: "task", limit: 10 }).map((record) => record.id), ["b", "a"]);
});
