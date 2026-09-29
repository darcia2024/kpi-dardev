import assert from "node:assert/strict";
import test from "node:test";
import { LocalRecordDatabase } from "../src/platform/data/local-record-store";
import { LocalLegalHoldRepository } from "../src/platform/governance/local-legal-hold";
import { TestAssetRepository } from "../src/platform/storage/asset-repository";

test("active legal hold prevents archive until a reasoned release", async () => {
  const database = new LocalRecordDatabase(":memory:");
  try {
    const owner = "00000000-0000-4000-8000-000000000101";
    const asset = await new TestAssetRepository(database).register({ documentKey: "hold-check", fileName: "Bukti.pdf", mimeType: "application/pdf", sizeBytes: 10, classification: "INTERNAL", ownerAccountId: owner, organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" });
    const holds = new LocalLegalHoldRepository(database);
    const hold = holds.place(asset.id, "Dokumen masih diperlukan untuk pemeriksaan.", owner);
    assert.ok(hold);
    assert.equal(await new TestAssetRepository(database).archive(asset.id, owner), null);
    assert.equal(holds.release(hold.id, "Pemeriksaan sudah selesai dan dicatat.", owner)?.releasedByAccountId, owner);
    assert.equal((await new TestAssetRepository(database).archive(asset.id, owner))?.status, "REVOKED");
  } finally { database.close(); }
});
