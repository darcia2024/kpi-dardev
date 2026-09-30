import assert from "node:assert/strict";
import test from "node:test";
import { boardColumn, moveIntent, type BoardTask } from "../src/lib/task-board";
import { TestTaskService } from "@/platform/work/task-service";

const owner = "owner";
const reviewer = "reviewer";
const fresh: BoardTask = { status: "IN_PROGRESS", ownerAccountId: owner, progress: 0 };
const ownerContext = { accountId: owner, canSubmit: true, canReview: false, dependenciesAccepted: true };
const reviewerContext = { accountId: reviewer, canSubmit: false, canReview: true, dependenciesAccepted: true };

test("cards land in the right column", () => {
  assert.equal(boardColumn(fresh), "todo");
  assert.equal(boardColumn({ ...fresh, startedAt: "2026-09-30T08:00:00Z" }), "doing");
  assert.equal(boardColumn({ ...fresh, progress: 45 }), "doing", "older tasks with progress count as started");
  assert.equal(boardColumn({ ...fresh, status: "BLOCKED" }), "doing");
  assert.equal(boardColumn({ ...fresh, status: "IN_REVIEW" }), "review");
  assert.equal(boardColumn({ ...fresh, status: "ACCEPTED" }), "done");
  assert.equal(boardColumn({ ...fresh, status: "ARCHIVED" }), null);
});

test("stages cannot be skipped and each move belongs to the right person", () => {
  assert.deepEqual(moveIntent(fresh, "doing", ownerContext), { ok: true, action: "START" });
  assert.equal(moveIntent(fresh, "doing", reviewerContext).ok, false);
  assert.match((moveIntent(fresh, "review", ownerContext) as { reason: string }).reason, /dilompati/);
  const doing = { ...fresh, startedAt: "x" };
  assert.match((moveIntent(doing, "done", ownerContext) as { reason: string }).reason, /dilompati/);
  assert.deepEqual(moveIntent(doing, "review", ownerContext), { ok: true, action: "SUBMIT", needs: "evidence" });
  assert.equal(moveIntent(doing, "todo", ownerContext).ok, false, "started work does not go back to todo");
  const review = { ...fresh, status: "IN_REVIEW" as const, submittedByAccountId: owner };
  assert.equal(moveIntent(review, "done", ownerContext).ok, false, "owners cannot accept their own work");
  assert.deepEqual(moveIntent(review, "done", reviewerContext), { ok: true, action: "ACCEPT" });
  assert.deepEqual(moveIntent(review, "doing", reviewerContext), { ok: true, action: "RETURN", needs: "reason" });
});

test("submission waits for subtasks, prerequisites, and an unblocked task", () => {
  const doing = { ...fresh, startedAt: "x" };
  assert.match((moveIntent({ ...doing, subtasks: [{ done: false }] }, "review", ownerContext) as { reason: string }).reason, /sub-tugas/);
  assert.match((moveIntent(doing, "review", { ...ownerContext, dependenciesAccepted: false }) as { reason: string }).reason, /Prasyarat/);
  assert.match((moveIntent({ ...doing, status: "BLOCKED" }, "review", ownerContext) as { reason: string }).reason, /terhambat/);
});

test("service start and block actions follow the same ownership rules", () => {
  const service = new TestTaskService();
  const task = service.create({ title: "Susun materi sosialisasi · TEST", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", ownerAccountId: "00000000-0000-4000-8000-000000000102", createdByAccountId: "00000000-0000-4000-8000-000000000101" });
  assert.equal(boardColumn(task), "todo");
  assert.equal(service.start(task.id, "00000000-0000-4000-8000-000000000101"), null);
  const started = service.start(task.id, "00000000-0000-4000-8000-000000000102")!;
  assert.equal(boardColumn(started), "doing");
  assert.equal(service.start(task.id, "00000000-0000-4000-8000-000000000102"), null, "cannot start twice");
  assert.equal(service.setBlocked(task.id, "00000000-0000-4000-8000-000000000102", true), null, "blocking needs a reason");
  assert.equal(service.setBlocked(task.id, "00000000-0000-4000-8000-000000000102", true, "Menunggu data peserta")?.status, "BLOCKED");
  assert.equal(service.submit(task.id, "00000000-0000-4000-8000-000000000102", "00000000-0000-4000-8000-000000002001"), null, "blocked tasks cannot be submitted");
  const resumed = service.setBlocked(task.id, "00000000-0000-4000-8000-000000000102", false)!;
  assert.deepEqual([resumed.status, resumed.blockedReason], ["IN_PROGRESS", undefined]);
});
