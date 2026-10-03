import { createHash, randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalAssetRepository, TestAssetRepository } from "@/platform/storage/asset-repository";

// NOT_READY → READY (outgoing) → ACCEPTED or CLARIFICATION (successor); CLARIFICATION → READY once answered.
export type HandoverItemStatus = "NOT_READY" | "READY" | "CLARIFICATION" | "ACCEPTED";
export type HandoverItem = { id: string; title: string; detail?: string; mandatory: boolean; status: HandoverItemStatus; clarificationRequest?: string; clarificationResponse?: string; updatedAt: string };

export type HandoverRecord = {
  id: string;
  organizationCode: string;
  periodCode: string;
  title: string;
  outgoingOwnerAccountId: string;
  successorAccountId: string;
  sourceAssetIds: string[];
  items?: HandoverItem[];
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
  get(id: string): HandoverRecord | null { const record = this.records.get(id); return record ? cloneRecord(record) : null; }

  accessPlan(id: string): HandoverAccessPlan | null {
    const record = this.records.get(id);
    if (!record) return null;
    const sources = record.sourceAssetIds.map((assetId) => ({ assetId, status: this.assets.getVisible(assetId, record.outgoingOwnerAccountId)?.status ?? this.assets.getVisible(assetId, record.successorAccountId)?.status ?? "NOT_VISIBLE", successorCanRead: this.assets.canUseEvidence(assetId, record.successorAccountId, record.organizationCode, record.periodCode), outgoingCanRead: this.assets.canUseEvidence(assetId, record.outgoingOwnerAccountId, record.organizationCode, record.periodCode) }));
    return { handoverId: id, status: record.status, sources, proposedActions: ["Periksa kembali akses penerus ke setiap sumber.", "Tetapkan persetujuan perpindahan kepemilikan dan waktu pencabutan akses lama.", "Catat eksekusi dan audit setelah kebijakan disetujui."], executable: false };
  }

  create(input: Pick<HandoverRecord, "title" | "organizationCode" | "periodCode" | "outgoingOwnerAccountId" | "successorAccountId">): HandoverRecord | null {
    const title = input.title.trim();
    if (title.length < 3 || input.outgoingOwnerAccountId === input.successorAccountId) return null;
    const record: HandoverRecord = { id: randomUUID(), ...input, title, sourceAssetIds: [], items: [], status: "PENDING", updatedAt: new Date().toISOString() };
    this.records.set(record.id, record);
    this.audit.record({ action: "HANDOVER_CREATED", module: "handover", entityType: "handover", entityId: record.id, actorAccountId: input.outgoingOwnerAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { successorAccountId: input.successorAccountId } });
    return cloneRecord(record);
  }

  addItem(id: string, outgoingOwnerAccountId: string, input: { title: string; detail?: string; mandatory: boolean }): HandoverRecord | null {
    const record = this.records.get(id);
    const title = input.title.trim();
    if (!record || record.status !== "PENDING" || record.outgoingOwnerAccountId !== outgoingOwnerAccountId || title.length < 2 || (record.items?.length ?? 0) >= 50) return null;
    const item: HandoverItem = { id: randomUUID(), title, detail: input.detail?.trim() || undefined, mandatory: input.mandatory, status: "NOT_READY", updatedAt: new Date().toISOString() };
    return this.saveItems(record, [...(record.items ?? []), item], outgoingOwnerAccountId, "HANDOVER_ITEM_ADDED", item.id);
  }

  // Outgoing owner marks an item ready; answering a clarification is required when one is open.
  markItemReady(id: string, outgoingOwnerAccountId: string, itemId: string, response?: string): HandoverRecord | null {
    const record = this.records.get(id);
    const item = record?.items?.find((candidate) => candidate.id === itemId);
    if (!record || !item || record.status !== "PENDING" || record.outgoingOwnerAccountId !== outgoingOwnerAccountId || !["NOT_READY", "CLARIFICATION"].includes(item.status)) return null;
    if (item.status === "CLARIFICATION" && !response?.trim()) return null;
    const next: HandoverItem = { ...item, status: "READY", clarificationResponse: item.status === "CLARIFICATION" ? response!.trim() : item.clarificationResponse, updatedAt: new Date().toISOString() };
    return this.saveItems(record, record.items!.map((candidate) => candidate.id === itemId ? next : candidate), outgoingOwnerAccountId, "HANDOVER_ITEM_READY", itemId);
  }

  reviewItem(id: string, successorAccountId: string, itemId: string, decision: "ACCEPT" | "CLARIFY", question?: string): HandoverRecord | null {
    const record = this.records.get(id);
    const item = record?.items?.find((candidate) => candidate.id === itemId);
    if (!record || !item || record.status !== "PENDING" || record.successorAccountId !== successorAccountId || item.status !== "READY") return null;
    if (decision === "CLARIFY" && !question?.trim()) return null;
    const next: HandoverItem = decision === "ACCEPT"
      ? { ...item, status: "ACCEPTED", updatedAt: new Date().toISOString() }
      : { ...item, status: "CLARIFICATION", clarificationRequest: question!.trim(), clarificationResponse: undefined, updatedAt: new Date().toISOString() };
    return this.saveItems(record, record.items!.map((candidate) => candidate.id === itemId ? next : candidate), successorAccountId, decision === "ACCEPT" ? "HANDOVER_ITEM_ACCEPTED" : "HANDOVER_ITEM_CLARIFICATION", itemId, decision === "CLARIFY" ? question!.trim() : undefined);
  }

  private saveItems(record: HandoverRecord, items: HandoverItem[], actorAccountId: string, action: string, itemId: string, reason?: string): HandoverRecord {
    const updated: HandoverRecord = { ...record, items, updatedAt: new Date().toISOString() };
    this.records.set(record.id, updated);
    this.audit.record({ action, module: "handover", entityType: "handover", entityId: record.id, actorAccountId, reason, result: "SUCCESS", requestId: `local:${record.id}:${itemId}`, metadata: { itemId } });
    return cloneRecord(updated);
  }

  accept(id: string, successorAccountId: string): HandoverRecord | null {
    const record = this.records.get(id);
    if (!record || record.status !== "PENDING" || record.successorAccountId !== successorAccountId) return null;
    if (!record.sourceAssetIds.length && !record.items?.length) return null;
    if (record.sourceAssetIds.some((id) => !this.assets.canUseEvidence(id, successorAccountId, record.organizationCode, record.periodCode))) return null;
    // A package cannot close while any mandatory item is still unaccepted.
    if ((record.items ?? []).some((item) => item.mandatory && item.status !== "ACCEPTED")) return null;
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
    const archiveSha256 = createHash("sha256").update(JSON.stringify({ id: record.id, periodCode: record.periodCode, outgoingOwnerAccountId, successorAccountId: record.successorAccountId, acceptedByAccountId: record.acceptedByAccountId, sourceVersions, items: (record.items ?? []).map((item) => ({ id: item.id, title: item.title, mandatory: item.mandatory, status: item.status })) })).digest("hex");
    const updated: HandoverRecord = { ...record, status: "ARCHIVED", archivedAt: new Date().toISOString(), archiveSha256, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "HANDOVER_ARCHIVED", module: "handover", entityType: "handover", entityId: id, actorAccountId: outgoingOwnerAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { archiveSha256, sourceCount: sourceVersions.length } });
    return cloneRecord(updated);
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

export function getLocalHandoverService(): TestHandoverService { return new TestHandoverService(getLocalRecordDatabase(), getLocalAssetRepository()); }
function cloneRecord(record: HandoverRecord): HandoverRecord { return { ...record, sourceAssetIds: [...record.sourceAssetIds], items: record.items?.map((item) => ({ ...item })) }; }
