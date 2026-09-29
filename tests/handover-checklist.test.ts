import assert from "node:assert/strict";
import test from "node:test";
import { HandoverChecklistService } from "../src/platform/governance/handover-checklist-service";

test("checklist items need an owner, future follow-up date, and owner completion", () => {
  const service = new HandoverChecklistService();
  const dueAt = new Date(Date.now() + 24 * 60 * 60_000).toISOString();
  assert.throws(() => service.create({ organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", title: "Periksa akses pengurus", ownerAccountId: "", dueAt, createdByAccountId: "creator" }));
  const item = service.create({ organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", title: "Periksa akses pengurus", ownerAccountId: "owner", dueAt, createdByAccountId: "creator" });
  assert.equal(service.list("KPI_TEST", "OTHER").length, 0);
  assert.equal(service.list("KPI_TEST", "2026_2027_TEST").length, 1);
  assert.equal(service.complete(item.id, "creator", "Sudah diperiksa"), null);
  assert.equal(service.complete(item.id, "owner", ""), null);
  assert.equal(service.complete(item.id, "owner", "Sudah diperiksa")?.status, "DONE");
  assert.equal(service.complete(item.id, "owner", "Dua kali"), null);
  assert.equal(service.listAudit(item.id).at(-1)?.action, "HANDOVER_CHECKLIST_COMPLETED");
});
