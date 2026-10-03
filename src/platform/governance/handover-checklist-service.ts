import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";

export type HandoverChecklistItem = {
  id: string;
  organizationCode: string;
  periodCode: string;
  title: string;
  ownerAccountId: string;
  dueAt: string;
  status: "OPEN" | "DONE";
  createdByAccountId: string;
  completedByAccountId?: string;
  completedAt?: string;
  updatedAt: string;
};

export class HandoverChecklistService {
  private readonly records: RecordCollection<HandoverChecklistItem>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase) {
    this.records = database ? new PersistentRecords(database, "handover-checklist", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  list(organizationCode: string, periodCode: string): HandoverChecklistItem[] {
    return Array.from(this.records.values()).filter((item) => item.organizationCode === organizationCode && item.periodCode === periodCode).map((item) => ({ ...item })).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  }

  create(input: Pick<HandoverChecklistItem, "organizationCode" | "periodCode" | "title" | "ownerAccountId" | "dueAt" | "createdByAccountId">): HandoverChecklistItem {
    const dueAt = Date.parse(input.dueAt);
    if (input.title.trim().length < 3 || !input.ownerAccountId.trim() || !Number.isFinite(dueAt) || dueAt <= Date.now()) throw new Error("Checklist item needs a title, owner, and future due date.");
    const now = new Date().toISOString();
    const item: HandoverChecklistItem = { ...input, id: randomUUID(), title: input.title.trim(), dueAt: new Date(dueAt).toISOString(), status: "OPEN", updatedAt: now };
    this.records.set(item.id, item);
    this.audit.record({ action: "HANDOVER_CHECKLIST_CREATED", module: "handover", entityType: "handover_checklist", entityId: item.id, actorAccountId: input.createdByAccountId, result: "SUCCESS", requestId: `local:${item.id}`, metadata: { ownerAccountId: item.ownerAccountId, dueAt: item.dueAt } });
    return { ...item };
  }

  complete(id: string, actorAccountId: string, reason: string): HandoverChecklistItem | null {
    const item = this.records.get(id);
    if (!item || item.status !== "OPEN" || item.ownerAccountId !== actorAccountId || reason.trim().length < 3) return null;
    const now = new Date().toISOString();
    const updated: HandoverChecklistItem = { ...item, status: "DONE", completedByAccountId: actorAccountId, completedAt: now, updatedAt: now };
    this.records.set(id, updated);
    this.audit.record({ action: "HANDOVER_CHECKLIST_COMPLETED", module: "handover", entityType: "handover_checklist", entityId: id, actorAccountId, reason: reason.trim(), result: "SUCCESS", requestId: `local:${id}`, metadata: { ownerAccountId: item.ownerAccountId } });
    return { ...updated };
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

export function getLocalHandoverChecklistService(): HandoverChecklistService {
  return new HandoverChecklistService(getLocalRecordDatabase());
}
