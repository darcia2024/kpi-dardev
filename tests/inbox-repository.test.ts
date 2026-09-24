import assert from "node:assert/strict";
import test from "node:test";
import { LocalRecordDatabase } from "../src/platform/data/local-record-store";
import { LocalInboxRepository } from "../src/platform/notifications/inbox-repository";

test("inbox read receipts persist per recipient without changing another account", () => {
  const database = new LocalRecordDatabase(":memory:");
  const first = new LocalInboxRepository(database);
  const receipt = first.markRead("account-a", "task-assigned:task-1", new Date("2026-09-23T00:00:00.000Z"));
  const second = new LocalInboxRepository(database);
  assert.equal(second.get("account-a", "task-assigned:task-1")?.readAt, receipt.readAt);
  assert.equal(second.get("account-b", "task-assigned:task-1"), null);
  assert.equal(second.markRead("account-a", "task-assigned:task-1", new Date("2026-09-24T00:00:00.000Z")).readAt, receipt.readAt);
  database.close();
});
