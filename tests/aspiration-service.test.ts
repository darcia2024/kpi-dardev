import assert from "node:assert/strict";
import test from "node:test";
import { TestAspirationService } from "../src/platform/intake/aspiration-service";

const submission = { kind: "SARAN" as const, subject: "Saran TEST yang jelas", description: "Uraian sintetis yang cukup panjang untuk menguji antrean aspirasi lokal.", idempotencyKey: "00000000-0000-4000-8000-000000009001" };

test("aspiration submissions are idempotent and trackable without exposing internal notes", () => {
  const service = new TestAspirationService();
  const first = service.submit(submission);
  const repeated = service.submit(submission);
  assert.equal(first.trackingToken, repeated.trackingToken);
  assert.equal(first.tracking.caseId, repeated.tracking.caseId);
  assert.equal(service.track(first.trackingToken)?.status, "RECEIVED");
});

test("complaint tracking identifies the TEST complaint without exposing case details", () => {
  const service = new TestAspirationService();
  const submitted = service.submit({ ...submission, kind: "PENGADUAN", idempotencyKey: "00000000-0000-4000-8000-000000009111" });
  assert.equal(service.getCaseDetail(submitted.tracking.caseId)?.kind, "PENGADUAN");
  assert.match(service.track(submitted.trackingToken)?.latestUpdate ?? "", /^Pengaduan TEST/);
  assert.equal(JSON.stringify(service.track(submitted.trackingToken)).includes(submission.description), false);
});

test("triage keeps internal notes outside the reporter tracking response and queues one notification", () => {
  const service = new TestAspirationService();
  const submitted = service.submit(submission);
  const tracked = service.triage({ caseId: submitted.tracking.caseId, actorAccountId: "00000000-0000-4000-8000-000000000101", ownerAccountId: "00000000-0000-4000-8000-000000000101", urgency: "NORMAL", reason: "Perlu pemeriksaan awal", internalNote: "Catatan internal TEST.", publicUpdate: "Aspirasi TEST sedang ditinjau.", idempotencyKey: "00000000-0000-4000-8000-000000009002" });
  assert.deepEqual(tracked, { ...submitted.tracking, status: "TRIAGED", latestUpdate: "Aspirasi TEST sedang ditinjau." });
  assert.equal(JSON.stringify(service.track(submitted.trackingToken)).includes("internal"), false);
  service.triage({ caseId: submitted.tracking.caseId, actorAccountId: "00000000-0000-4000-8000-000000000101", ownerAccountId: "00000000-0000-4000-8000-000000000101", urgency: "NORMAL", reason: "Perlu pemeriksaan awal", internalNote: "Berulang.", publicUpdate: "Berulang.", idempotencyKey: "00000000-0000-4000-8000-000000009002" });
  assert.equal(service.listNotifications().filter((notification) => notification.event === "CASE_TRIAGED").length, 1);
  assert.deepEqual(service.listAudit(submitted.tracking.caseId).map((event) => event.action), ["ASPIRATION_RECEIVED", "CASE_TRIAGED"]);
  assert.equal(JSON.stringify(service.listAudit(submitted.tracking.caseId)).includes("Catatan internal TEST"), false);
});

test("a queued TEST notification is claimed, retried with backoff, then marked sent", () => {
  const service = new TestAspirationService();
  service.submit(submission);
  const queued = service.listNotifications()[0];
  const clock = new Date("2099-09-22T10:00:00.000Z");
  const firstClaim = service.claimNextNotification(clock);
  assert.equal(firstClaim?.status, "DELIVERING");
  const retry = service.retryNotification(queued.id, firstClaim!.claimToken!, "Provider TEST tidak merespons.", clock);
  assert.equal(retry?.status, "QUEUED");
  assert.equal(service.claimNextNotification(clock), null);
  const secondClaim = service.claimNextNotification(new Date(retry!.nextAttemptAt));
  assert.equal(secondClaim?.attempts, 2);
  assert.equal(service.markNotificationSent(queued.id, firstClaim!.claimToken!), null);
  assert.equal(service.markNotificationSent(queued.id, secondClaim!.claimToken!, new Date(retry!.nextAttemptAt))?.status, "SENT");
  assert.equal(service.markNotificationSent(queued.id, secondClaim!.claimToken!), null);
});

test("an expired notification claim is reclaimed without accepting the old worker", () => {
  const service = new TestAspirationService();
  service.submit({ ...submission, idempotencyKey: "00000000-0000-4000-8000-000000009099" });
  const firstAt = new Date("2099-09-22T10:00:00.000Z");
  const first = service.claimNextNotification(firstAt)!;
  assert.equal(JSON.stringify(service.listNotifications()).includes(first.claimToken!), false);
  assert.equal(service.claimNextNotification(new Date(firstAt.getTime() + 4 * 60_000)), null);
  const second = service.claimNextNotification(new Date(firstAt.getTime() + 6 * 60_000))!;
  assert.equal(second.id, first.id);
  assert.notEqual(second.claimToken, first.claimToken);
  assert.equal(service.markNotificationSent(first.id, first.claimToken!), null);
  assert.equal(service.markNotificationSent(second.id, second.claimToken!)?.status, "SENT");
});

test("case lifecycle preserves public and internal timelines separately", () => {
  const service = new TestAspirationService();
  const submitted = service.submit({ ...submission, idempotencyKey: "00000000-0000-4000-8000-000000009101" });
  const caseId = submitted.tracking.caseId;
  const actorAccountId = "00000000-0000-4000-8000-000000000101";
  assert.equal(service.advanceCase({ caseId, actorAccountId, action: "START", publicUpdate: "Mulai", internalNote: "Internal" }), null);
  assert.equal(service.triage({ caseId, actorAccountId, ownerAccountId: actorAccountId, urgency: "HIGH", reason: "Perlu tindak lanjut petugas", publicUpdate: "Sedang ditinjau", internalNote: "Catatan petugas", idempotencyKey: "00000000-0000-4000-8000-000000009102" })?.status, "TRIAGED");
  assert.equal(service.advanceCase({ caseId, actorAccountId, action: "START", publicUpdate: "Penanganan dimulai", internalNote: "Diserahkan ke petugas" })?.status, "IN_PROGRESS");
  assert.equal(service.advanceCase({ caseId, actorAccountId, action: "CLOSE", publicUpdate: "Selesai ditangani", internalNote: "Bukti lengkap" })?.status, "CLOSED");
  assert.equal(service.advanceCase({ caseId, actorAccountId, action: "REOPEN", publicUpdate: "Dibuka kembali", internalNote: "Ada informasi baru" })?.status, "IN_PROGRESS");
  assert.equal(service.track(submitted.trackingToken)?.latestUpdate, "Dibuka kembali");
  assert.equal(JSON.stringify(service.track(submitted.trackingToken)).includes("Ada informasi baru"), false);
  assert.equal(service.getCaseDetail(caseId)?.events.some((event) => event.visibility === "INTERNAL" && event.message === "Ada informasi baru"), true);
});

test("case queues remain isolated by selected period", () => {
  const service = new TestAspirationService();
  const first = service.submit({ ...submission, periodCode: "2026_2027_TEST", idempotencyKey: "00000000-0000-4000-8000-000000009201" });
  const second = service.submit({ ...submission, periodCode: "2028_2029_TEST", idempotencyKey: "00000000-0000-4000-8000-000000009202" });
  assert.deepEqual(service.listCases("2026_2027_TEST").map((item) => item.caseId), [first.tracking.caseId]);
  assert.deepEqual(service.listCases("2028_2029_TEST").map((item) => item.caseId), [second.tracking.caseId]);
  assert.equal(service.listNotifications("2026_2027_TEST").length, 1);
});
