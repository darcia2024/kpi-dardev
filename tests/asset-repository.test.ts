import assert from "node:assert/strict";
import test from "node:test";
import { TestAssetRepository } from "../src/platform/storage/asset-repository";

const upload = { documentKey: "panduan-uji", fileName: "Panduan uji.pdf", mimeType: "application/pdf", sizeBytes: 4_000, classification: "INTERNAL" as const, ownerAccountId: "00000000-0000-4000-8000-000000000101", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };

test("a TEST asset becomes available only after the scan step", async () => {
  const repository = new TestAssetRepository();
  const pending = await repository.register(upload);
  assert.equal(pending.status, "PENDING");
  const available = await repository.completeScan(pending.id);
  assert.equal(available?.status, "AVAILABLE");
  assert.deepEqual(repository.listAudit(pending.id).map((event) => event.action), ["ASSET_REGISTERED", "ASSET_SCAN_COMPLETED"]);
});

test("unsafe files are quarantined and a later version does not replace an available record", async () => {
  const repository = new TestAssetRepository();
  const first = await repository.register(upload);
  await repository.completeScan(first.id);
  const unsafe = await repository.register({ ...upload, fileName: "Panduan uji.exe", mimeType: "application/octet-stream", sizeBytes: 4_100 });
  assert.equal(unsafe.status, "QUARANTINED");
  assert.equal(unsafe.version, 2);
  assert.equal(repository.currentAvailableVersion(upload.documentKey, upload.organizationCode, upload.periodCode)?.id, first.id);
  assert.equal((await repository.completeScan(first.id))?.status, "AVAILABLE");
});

test("revoking a recipient removes that recipient from the visible registry", async () => {
  const repository = new TestAssetRepository();
  const visibleBefore = await repository.listVisible("00000000-0000-4000-8000-000000000102");
  assert.ok(visibleBefore.length > 0);
  await repository.revokeDownload(visibleBefore[0].id, "00000000-0000-4000-8000-000000000102", visibleBefore[0].ownerAccountId);
  const visibleAfter = await repository.listVisible("00000000-0000-4000-8000-000000000102");
  assert.equal(visibleAfter.some((asset) => asset.id === visibleBefore[0].id), false);
  assert.equal(repository.listAudit(visibleBefore[0].id).at(-1)?.action, "ASSET_ACCESS_REVOKED");
});
