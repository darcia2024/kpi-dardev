import assert from "node:assert/strict";
import test from "node:test";
import { buildWorkspaceActivity } from "../src/platform/work/workspace-activity";
import type { BusinessAuditRecord } from "../src/platform/audit/local-business-audit-service";

function event(id: string, module: string, entityId: string, actorAccountId: string, result: BusinessAuditRecord["result"] = "SUCCESS"): BusinessAuditRecord {
  return { id, action: "UPDATED", module, entityType: module, entityId, actorAccountId, result, requestId: id, createdAt: `2026-09-23T00:00:0${id}.000Z` };
}

test("workspace feed includes only successful events for visible tasks and meetings", () => {
  const result = buildWorkspaceActivity(
    [event("1", "task", "mine", "me"), event("2", "task", "private", "other"), event("3", "meeting", "attending", "other"), event("4", "meeting", "attending", "other", "DENIED")],
    new Map([["mine", "Tugas saya"]]),
    new Map([["attending", "Rapat saya"]]),
    "me"
  );
  assert.deepEqual(result.map(({ id, isMine, title }) => ({ id, isMine, title })), [
    { id: "3", isMine: false, title: "Rapat saya" },
    { id: "1", isMine: true, title: "Tugas saya" }
  ]);
});
