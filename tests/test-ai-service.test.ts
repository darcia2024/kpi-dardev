import assert from "node:assert/strict";
import test from "node:test";
import { TestAiService } from "@/platform/ai/test-ai-service";
import { TestAssetRepository } from "@/platform/storage/asset-repository";
const account = "00000000-0000-4000-8000-000000000102";

test("TEST AI preview reports missing sources without calling a provider", () => {
  const service = new TestAiService();
  const answer = service.answer("Apa hasil rapat handover TEST?", account);
  assert.equal(answer.providerStatus, "NOT_CONFIGURED");
  assert.equal(answer.citations.length, 0);
  assert.match(answer.answer, /belum ada dokumen/i);
});

test("TEST AI action requires a matching, unexpired preview version before confirmation", () => {
  const service = new TestAiService();
  const preview = service.prepareAction("Task TEST", account);
  assert.equal(service.confirmAction(preview.id, "different-version", account), null);
  assert.equal(service.confirmAction(preview.id, preview.payloadVersion, "another-account"), null);
  assert.equal(service.confirmAction(preview.id, preview.payloadVersion, account, Date.now(), { organizationCode: "KPI_TEST", periodCode: "different-period" }), null);
  assert.equal(service.confirmAction(preview.id, preview.payloadVersion, account, Date.parse(preview.expiresAt)), null);
  assert.equal(service.confirmAction(preview.id, preview.payloadVersion, account)?.status, "CONFIRMED");
  assert.equal(service.confirmAction(preview.id, preview.payloadVersion, account), null);
  assert.deepEqual(service.listAudit(preview.id).map((event) => event.action), ["AI_ACTION_PREPARED", "AI_ACTION_CONFIRMED"]);
  assert.equal(JSON.stringify(service.listAudit(preview.id)).includes("Task TEST"), false);
});

test("AI does not invent citations when documents are unavailable", async () => {
  const assets = new TestAssetRepository();
  const service = new TestAiService(assets);
  assert.equal(service.answer("rapat", "unknown").citations.length, 0);
  await assets.revokeDownload("00000000-0000-4000-8000-000000002002", account, "00000000-0000-4000-8000-000000000101");
  const answer = service.answer("rapat", account);
  assert.equal(answer.citations.length, 0);
  assert.ok(!JSON.stringify(answer).includes("Notulen rapat"));
});

test("AI citation resolution checks the exact version and current source grant", async () => {
  const assets = new TestAssetRepository();
  const service = new TestAiService(assets);
  const sourceId = "00000000-0000-4000-8000-000000002001";
  assert.equal(service.resolveCitation(sourceId, 2, account, "KPI_TEST", "2026_2027_TEST"), null);
  assert.equal(service.resolveCitation(sourceId, 1, account, "OTHER", "2026_2027_TEST"), null);
  assert.equal(service.resolveCitation(sourceId, 1, account, "KPI_TEST", "2026_2027_TEST")?.version, 1);
  await assets.revokeDownload(sourceId, account, "00000000-0000-4000-8000-000000000101");
  assert.equal(service.resolveCitation(sourceId, 1, account, "KPI_TEST", "2026_2027_TEST"), null);
});
