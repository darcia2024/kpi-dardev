import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { LocalLegalHoldRepository } from "@/platform/governance/local-legal-hold";
import { evaluateUpload, type UploadCandidate } from "@/platform/storage/upload-policy";

export type AssetClassification = "INTERNAL" | "RESTRICTED";
export type AssetStatus = "PENDING" | "AVAILABLE" | "QUARANTINED" | "REVOKED";

export type AssetRecord = {
  id: string;
  documentKey: string;
  version: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  classification: AssetClassification;
  status: AssetStatus;
  organizationCode: string;
  periodCode: string;
  ownerAccountId: string;
  downloadAccountIds: string[];
  downloadExpiresAt?: Record<string, string>;
  createdAt: string;
  contentSha256?: string;
};

export type RegisterAssetInput = UploadCandidate & {
  documentKey: string;
  classification: AssetClassification;
  ownerAccountId: string;
  organizationCode: string;
  periodCode: string;
};

const testUploadPolicy = {
  maxBytes: 25_000_000,
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "application/zip"
  ]
} as const;

export class TestAssetRepository {
  private readonly records: RecordCollection<AssetRecord>;
  private readonly audit: LocalBusinessAuditService;
  private readonly holds: LocalLegalHoldRepository;

  constructor(database?: LocalRecordDatabase) {
    const seed = new Map<string, AssetRecord>();
    if (process.env.NODE_TEST_CONTEXT) {
      const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };
      const ownerAccountId = "00000000-0000-4000-8000-000000000101";
      const downloadAccountIds = ["00000000-0000-4000-8000-000000000102"];
      seed.set("00000000-0000-4000-8000-000000002001", { id: "00000000-0000-4000-8000-000000002001", documentKey: "panduan-kerja-pengurus", version: 1, fileName: "Panduan kerja pengurus · TEST.pdf", mimeType: "application/pdf", sizeBytes: 2_400_000, classification: "INTERNAL", status: "AVAILABLE", ...scope, ownerAccountId, downloadAccountIds, createdAt: "2026-09-01T09:00:00.000Z" });
      seed.set("00000000-0000-4000-8000-000000002002", { id: "00000000-0000-4000-8000-000000002002", documentKey: "notulen-rapat-persiapan", version: 1, fileName: "Notulen rapat persiapan · TEST.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", sizeBytes: 840_000, classification: "RESTRICTED", status: "AVAILABLE", ...scope, ownerAccountId, downloadAccountIds, createdAt: "2026-09-02T09:00:00.000Z" });
      seed.set("00000000-0000-4000-8000-000000002003", { id: "00000000-0000-4000-8000-000000002003", documentKey: "lampiran-pemeriksaan", version: 2, fileName: "Lampiran belum diperiksa · TEST.zip", mimeType: "application/zip", sizeBytes: 4_100_000, classification: "INTERNAL", status: "PENDING", ...scope, ownerAccountId, downloadAccountIds, createdAt: "2026-09-03T09:00:00.000Z" });
    }
    this.records = database ? new PersistentRecords(database, "assets", seed) : seed;
    this.audit = new LocalBusinessAuditService(database);
    this.holds = new LocalLegalHoldRepository(database);
  }

  canUseEvidence(id: string, accountId: string, organizationCode: string, periodCode: string): boolean {
    const asset = this.records.get(id);
    return !!asset && asset.status === "AVAILABLE"
      && asset.organizationCode === organizationCode && asset.periodCode === periodCode
      && hasAccess(asset, accountId);
  }

  getVisible(id: string, accountId: string): AssetRecord | null {
    const asset = this.records.get(id);
    return asset && hasAccess(asset, accountId) ? clone(asset) : null;
  }

  currentAvailableVersion(documentKey: string, organizationCode: string, periodCode: string): AssetRecord | null {
    const versions = Array.from(this.records.values()).filter((record) => record.documentKey === documentKey && record.organizationCode === organizationCode && record.periodCode === periodCode && record.status === "AVAILABLE");
    const current = versions.sort((a, b) => b.version - a.version)[0];
    return current ? clone(current) : null;
  }

  async listVisible(accountId: string): Promise<AssetRecord[]> {
    return Array.from(this.records.values())
      .filter((record) => hasAccess(record, accountId))
      .map(clone)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async register(input: RegisterAssetInput): Promise<AssetRecord> {
    const decision = evaluateUpload(input, testUploadPolicy);
    const matchingVersions = Array.from(this.records.values()).filter((record) => record.documentKey === input.documentKey && record.organizationCode === input.organizationCode && record.periodCode === input.periodCode);
    const version = Math.max(0, ...matchingVersions.map((record) => record.version)) + 1;
    const record: AssetRecord = {
      id: randomUUID(),
      documentKey: input.documentKey,
      version,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      classification: input.classification,
      status: decision.allowed ? "PENDING" : "QUARANTINED",
      organizationCode: input.organizationCode,
      periodCode: input.periodCode,
      ownerAccountId: input.ownerAccountId,
      downloadAccountIds: [],
      createdAt: new Date().toISOString()
    };
    this.records.set(record.id, record);
    this.audit.record({ action: "ASSET_REGISTERED", module: "asset", entityType: "asset", entityId: record.id, actorAccountId: input.ownerAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { status: record.status, version: record.version, classification: record.classification } });
    return clone(record);
  }

  async completeScan(id: string, actorAccountId?: string): Promise<AssetRecord | null> {
    const existing = this.records.get(id);
    if (!existing) return null;
    if (existing.status !== "PENDING") return clone(existing);
    const updated = { ...existing, status: "AVAILABLE" as const };
    this.records.set(id, updated);
    this.audit.record({ action: "ASSET_SCAN_COMPLETED", module: "asset", entityType: "asset", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { previousStatus: existing.status, nextStatus: updated.status } });
    return clone(updated);
  }

  async attachContent(id: string, actorAccountId: string, sha256: string): Promise<AssetRecord | null> {
    const existing = this.records.get(id);
    if (!existing || existing.ownerAccountId !== actorAccountId || existing.status !== "PENDING" || existing.contentSha256 || !/^[0-9a-f]{64}$/.test(sha256)) return null;
    const updated = { ...existing, contentSha256: sha256 };
    this.records.set(id, updated);
    this.audit.record({ action: "ASSET_BYTES_STORED", module: "asset", entityType: "asset", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { sizeBytes: updated.sizeBytes } });
    return clone(updated);
  }

  async grantDownload(id: string, accountId: string, actorAccountId: string, expiresAt: string): Promise<AssetRecord | null> {
    const existing = this.records.get(id);
    if (!existing || existing.ownerAccountId !== actorAccountId || existing.status !== "AVAILABLE" || !accountId || accountId === actorAccountId || !Number.isFinite(Date.parse(expiresAt)) || Date.parse(expiresAt) <= Date.now()) return null;
    const updated = { ...existing, downloadAccountIds: [...new Set([...existing.downloadAccountIds, accountId])], downloadExpiresAt: { ...existing.downloadExpiresAt, [accountId]: expiresAt } };
    this.records.set(id, updated);
    this.audit.record({ action: "ASSET_ACCESS_GRANTED", module: "asset", entityType: "asset", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { recipientAccountId: accountId } });
    return clone(updated);
  }

  async recordDownload(id: string, actorAccountId: string, disposition: "inline" | "attachment"): Promise<void> {
    this.audit.record({ action: "ASSET_BYTES_ACCESSED", module: "asset", entityType: "asset", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { disposition } });
  }

  async archive(id: string, actorAccountId: string): Promise<AssetRecord | null> {
    const existing = this.records.get(id);
    if (!existing || existing.ownerAccountId !== actorAccountId || existing.status === "REVOKED" || this.holds.hasActive(id)) return null;
    const updated = { ...existing, status: "REVOKED" as const, downloadAccountIds: [], downloadExpiresAt: {} };
    this.records.set(id, updated);
    this.audit.record({ action: "ASSET_ARCHIVED", module: "asset", entityType: "asset", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { previousStatus: existing.status } });
    return clone(updated);
  }

  async revokeDownload(id: string, accountId: string, actorAccountId: string): Promise<AssetRecord | null> {
    const existing = this.records.get(id);
    if (!existing || existing.ownerAccountId !== actorAccountId) return null;
    const downloadExpiresAt = { ...existing.downloadExpiresAt };
    delete downloadExpiresAt[accountId];
    const updated = { ...existing, downloadAccountIds: existing.downloadAccountIds.filter((recipientId) => recipientId !== accountId), downloadExpiresAt };
    if (updated.downloadAccountIds.length === existing.downloadAccountIds.length) return clone(existing);
    this.records.set(id, updated);
    this.audit.record({ action: "ASSET_ACCESS_REVOKED", module: "asset", entityType: "asset", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { recipientAccountId: accountId } });
    return clone(updated);
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

export function getLocalAssetRepository(): TestAssetRepository {
  return new TestAssetRepository(getLocalRecordDatabase());
}

function clone(record: AssetRecord): AssetRecord {
  return { ...record, downloadAccountIds: [...record.downloadAccountIds], downloadExpiresAt: { ...record.downloadExpiresAt } };
}

function hasAccess(asset: AssetRecord, accountId: string): boolean {
  if (asset.ownerAccountId === accountId) return true;
  if (!asset.downloadAccountIds.includes(accountId)) return false;
  const expiresAt = asset.downloadExpiresAt?.[accountId];
  return !expiresAt || Date.parse(expiresAt) > Date.now();
}
