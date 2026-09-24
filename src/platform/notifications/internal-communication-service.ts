import { randomUUID } from "node:crypto";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import type { InboxNotice } from "@/platform/notifications/inbox-service";

export type InternalMessage = {
  id: string;
  kind: "ANNOUNCEMENT" | "DIRECT";
  title: string;
  body: string;
  recipientAccountIds: string[];
  organizationCode: string;
  periodCode: string;
  authorAccountId: string;
  reviewerAccountId?: string;
  status: "DRAFT" | "IN_REVIEW" | "DELIVERED";
  createdAt: string;
  deliveredAt?: string;
};

export class LocalInternalCommunicationService {
  private readonly records: RecordCollection<InternalMessage>;
  private readonly audit: LocalBusinessAuditService;
  constructor(database?: LocalRecordDatabase) {
    this.records = database ? new PersistentRecords(database, "internal-messages", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }
  listForOperator(organizationCode: string, periodCode: string): InternalMessage[] {
    return Array.from(this.records.values()).filter((record) => record.organizationCode === organizationCode && record.periodCode === periodCode).map(clone).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  get(id: string): InternalMessage | null { const record = this.records.get(id); return record ? clone(record) : null; }
  create(input: Omit<InternalMessage, "id" | "status" | "createdAt" | "reviewerAccountId" | "deliveredAt">): InternalMessage {
    if (input.kind === "DIRECT" && input.recipientAccountIds.length !== 1) throw new Error("Directed message needs one recipient.");
    if (input.recipientAccountIds.length === 0 || new Set(input.recipientAccountIds).size !== input.recipientAccountIds.length || input.recipientAccountIds.includes(input.authorAccountId)) throw new Error("Invalid recipients.");
    const record: InternalMessage = { ...input, recipientAccountIds: [...input.recipientAccountIds], id: randomUUID(), status: "DRAFT", createdAt: new Date().toISOString() };
    this.records.set(record.id, record);
    this.audit.record({ action: "INTERNAL_MESSAGE_DRAFTED", module: "communication", entityType: "internal_message", entityId: record.id, actorAccountId: input.authorAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { kind: record.kind, recipientCount: record.recipientAccountIds.length } });
    return clone(record);
  }
  submit(id: string, actorAccountId: string): InternalMessage | null {
    const record = this.records.get(id);
    if (!record || record.authorAccountId !== actorAccountId || record.status !== "DRAFT") return null;
    const updated: InternalMessage = { ...record, status: "IN_REVIEW" };
    this.records.set(id, updated);
    this.audit.record({ action: "INTERNAL_MESSAGE_SUBMITTED", module: "communication", entityType: "internal_message", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { recipientCount: record.recipientAccountIds.length } });
    return clone(updated);
  }
  approveAndDeliver(id: string, reviewerAccountId: string): InternalMessage | null {
    const record = this.records.get(id);
    if (!record || record.status !== "IN_REVIEW" || record.authorAccountId === reviewerAccountId) return null;
    const updated: InternalMessage = { ...record, status: "DELIVERED", reviewerAccountId, deliveredAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "INTERNAL_MESSAGE_DELIVERED", module: "communication", entityType: "internal_message", entityId: id, actorAccountId: reviewerAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { kind: record.kind, recipientCount: record.recipientAccountIds.length } });
    return clone(updated);
  }
  inbox(accountId: string, organizationCode: string, periodCode: string): InboxNotice[] {
    return this.listForOperator(organizationCode, periodCode)
      .filter((record) => record.status === "DELIVERED" && record.recipientAccountIds.includes(accountId))
      .map((record) => ({ id: `message:${record.id}`, recipientAccountId: accountId, title: record.title, description: record.body, href: "/portal/notifikasi", createdAt: record.deliveredAt ?? record.createdAt }));
  }
  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

function clone(record: InternalMessage): InternalMessage { return { ...record, recipientAccountIds: [...record.recipientAccountIds] }; }
export function getLocalInternalCommunicationService(): LocalInternalCommunicationService { return new LocalInternalCommunicationService(getLocalRecordDatabase()); }
