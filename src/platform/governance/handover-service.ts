import { createHash } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalAssetRepository, TestAssetRepository } from "@/platform/storage/asset-repository";

export type HandoverRecord = {
  id: string;
  organizationCode: string;
  periodCode: string;
  title: string;
  outgoingOwnerAccountId: string;
  successorAccountId: string;
  sourceAssetIds: string[];
  status: "PENDING" | "ACCEPTED" | "ARCHIVED";
  acceptedByAccountId?: string;
  archivedAt?: string;
  archiveSha256?: string;
  updatedAt: string;
};
export type HandoverAccessPlan = { handoverId: string; status: HandoverRecord["status"]; sources: { assetId: string; status: string; successorCanRead: boolean; outgoingCanRead: boolean }[]; proposedActions: string[]; executable: false };

export class TestHandoverService {
  private readonly records: RecordCollection<HandoverRecord>;
  private readonly audit: LocalBusinessAuditService;
  constructor(database?: LocalRecordDatabase, private readonly assets = new TestAssetRepository()) {
    const seed = new Map<string, HandoverRecord>();
    if (process.env.NODE_TEST_CONTEXT) seed.set("00000000-0000-4000-8000-000000007001", { id: "00000000-0000-4000-8000-000000007001", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", title: "Paket tugas berjalan · TEST", outgoingOwnerAccountId: "00000000-0000-4000-8000-000000000101", successorAccountId: "00000000-0000-4000-8000-000000000102", sourceAssetIds: ["00000000-0000-4000-8000-000000002001"], status: "PENDING", updatedAt: "2026-09-22T08:00:00.000Z" });
    this.records = database ? new PersistentRecords(database, "handover", seed) : seed;
    this.audit = new LocalBusinessAuditService(database);
  }

  list(): HandoverRecord[] { return Array.from(this.records.values(), cloneRecord); }

  accessPlan(id: string): HandoverAccessPlan | null {
    const record = this.records.get(id);
    if (!record) return null;
    const sources = record.sourceAssetIds.map((assetId) => ({ assetId, status: this.assets.getVisible(assetId, record.outgoingOwnerAccountId)?.status ?? this.assets.getVisible(assetId, record.successorAccountId)?.status ?? "NOT_VISIBLE", successorCanRead: this.assets.canUseEvidence(assetId, record.successorAccountId, record.organizationCode, record.periodCode), outgoingCanRead: this.assets.canUseEvidence(assetId, record.outgoingOwnerAccountId, record.organizationCode, record.periodCode) }));
    return { handoverId: id, status: record.status, sources, proposedActions: ["Periksa kembali akses penerus ke setiap sumber.", "Tetapkan persetujuan perpindahan kepemilikan dan waktu pencabutan akses lama.", "Catat eksekusi dan audit setelah kebijakan disetujui."], executable: false };
  }

  accept(id: string, successorAccountId: string): HandoverRecord | null {
    const record = this.records.get(id);
    if (!record || record.status !== "PENDING" || record.successorAccountId !== successorAccountId) return null;
    if (!record.sourceAssetIds.length || record.sourceAssetIds.some((id) => !this.assets.canUseEvidence(id, successorAccountId, record.organizationCode, record.periodCode))) return null;
    const updated = { ...record, status: "ACCEPTED" as const, acceptedByAccountId: successorAccountId, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "HANDOVER_ACCEPTED", module: "handover", entityType: "handover", entityId: id, actorAccountId: successorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { sourceAssetCount: record.sourceAssetIds.length } });
    return cloneRecord(updated);
  }

  archive(id: string, outgoingOwnerAccountId: string): HandoverRecord | null {
    const record = this.records.get(id);
    if (!record || record.status !== "ACCEPTED" || record.outgoingOwnerAccountId !== outgoingOwnerAccountId || !record.acceptedByAccountId) return null;
    const sourceVersions = record.sourceAssetIds.map((assetId) => {
      const source = this.assets.getVisible(assetId, record.successorAccountId);
      return source && this.assets.canUseEvidence(assetId, record.successorAccountId, record.organizationCode, record.periodCode) ? { id: assetId, version: source.version } : null;
    });
    if (sourceVersions.some((source) => !source)) return null;
    const archiveSha256 = createHash("sha256").update(JSON.stringify({ id: record.id, periodCode: record.periodCode, outgoingOwnerAccountId, successorAccountId: record.successorAccountId, acceptedByAccountId: record.acceptedByAccountId, sourceVersions })).digest("hex");
    const updated: HandoverRecord = { ...record, status: "ARCHIVED", archivedAt: new Date().toISOString(), archiveSha256, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "HANDOVER_ARCHIVED", module: "handover", entityType: "handover", entityId: id, actorAccountId: outgoingOwnerAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { archiveSha256, sourceCount: sourceVersions.length } });
    return cloneRecord(updated);
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

export function getLocalHandoverService(): TestHandoverService { return new TestHandoverService(getLocalRecordDatabase(), getLocalAssetRepository()); }
function cloneRecord(record: HandoverRecord): HandoverRecord { return { ...record, sourceAssetIds: [...record.sourceAssetIds] }; }
