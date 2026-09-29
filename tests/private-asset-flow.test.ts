import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { TestAssetRepository } from "../src/platform/storage/asset-repository";
import { LocalPrivateBlobStore } from "../src/platform/storage/local-private-blob-store";

const owner = "00000000-0000-4000-8000-000000000101";
const recipient = "00000000-0000-4000-8000-000000000102";
const input = { documentKey: "dokumen-privat", fileName: "Dokumen.pdf", mimeType: "application/pdf", sizeBytes: 8, classification: "INTERNAL" as const, ownerAccountId: owner, organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };

test("private bytes, expiring grants, revocation, and archive remain consistent", async () => {
  const directory = await mkdtemp(join(tmpdir(), "kpi-private-"));
  try {
    const repository = new TestAssetRepository();
    const blobStore = new LocalPrivateBlobStore(directory);
    const asset = await repository.register(input);
    const bytes = Buffer.from("%PDF-1.7");
    const sha256 = await blobStore.save(asset.id, bytes);
    assert.equal((await blobStore.read(asset.id))?.toString(), bytes.toString());
    assert.equal((await repository.attachContent(asset.id, owner, sha256))?.status, "PENDING");
    assert.equal(repository.canUseEvidence(asset.id, owner, input.organizationCode, input.periodCode), false);
    assert.equal(await repository.grantDownload(asset.id, recipient, recipient, new Date(Date.now() + 60_000).toISOString()), null);
    assert.equal(await repository.grantDownload(asset.id, recipient, owner, new Date(Date.now() - 60_000).toISOString()), null);
    assert.equal(await repository.grantDownload(asset.id, recipient, owner, new Date(Date.now() + 60_000).toISOString()), null);
    assert.equal((await repository.completeScan(asset.id))?.status, "AVAILABLE");
    assert.ok(await repository.grantDownload(asset.id, recipient, owner, new Date(Date.now() + 60_000).toISOString()));
    assert.ok(repository.getVisible(asset.id, recipient));
    assert.equal(await repository.revokeDownload(asset.id, recipient, recipient), null);
    assert.ok(await repository.revokeDownload(asset.id, recipient, owner));
    assert.equal(repository.getVisible(asset.id, recipient), null);
    assert.ok(await repository.archive(asset.id, owner));
    assert.equal(await repository.grantDownload(asset.id, recipient, owner, new Date(Date.now() + 60_000).toISOString()), null);
    assert.deepEqual(repository.listAudit(asset.id).map((event) => event.action).sort(), ["ASSET_REGISTERED", "ASSET_BYTES_STORED", "ASSET_SCAN_COMPLETED", "ASSET_ACCESS_GRANTED", "ASSET_ACCESS_REVOKED", "ASSET_ARCHIVED"].sort());
  } finally { await rm(directory, { recursive: true, force: true }); }
});
