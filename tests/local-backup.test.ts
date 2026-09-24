import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { LocalRecordDatabase } from "../src/platform/data/local-record-store";
import { LocalBackupService } from "../src/platform/governance/local-backup-service";
import { TestAssetRepository } from "../src/platform/storage/asset-repository";
import { LocalPrivateBlobStore } from "../src/platform/storage/local-private-blob-store";

test("backup restores a readable SQLite snapshot and verifies private asset hashes", async () => {
  const root = await mkdtemp(join(tmpdir(), "kpi-backup-"));
  const database = new LocalRecordDatabase(join(root, "records.sqlite"));
  try {
    const ownerAccountId = "00000000-0000-4000-8000-000000000101";
    const assets = new TestAssetRepository(database);
    const asset = await assets.register({ documentKey: "arsip-uji", fileName: "Arsip.pdf", mimeType: "application/pdf", sizeBytes: 8, classification: "INTERNAL", ownerAccountId, organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" });
    const blobRoot = join(root, "private-assets");
    const hash = await new LocalPrivateBlobStore(blobRoot).save(asset.id, Buffer.from("%PDF-1.7"));
    await assets.attachContent(asset.id, ownerAccountId, hash);
    const service = new LocalBackupService(database, blobRoot, join(root, "backups"));
    const run = await service.createAndVerify(ownerAccountId);
    assert.equal(run.status, "VERIFIED");
    assert.equal(run.assetCount, 1);
    assert.ok(run.recordCount >= 1);
    assert.equal(service.list()[0].id, run.id);
    assert.deepEqual((await readdir(join(root, "backups"))).filter((name) => !name.startsWith(".")), [run.id]);
  } finally { database.close(); await rm(root, { recursive: true, force: true }); }
});
