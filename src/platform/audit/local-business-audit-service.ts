import { randomUUID } from "node:crypto";
import { createAuditEvent, type AuditResult } from "@/platform/audit/event";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";

export type BusinessAuditRecord = {
  id: string;
  action: string;
  module: string;
  entityType: string;
  entityId?: string;
  actorAccountId?: string;
  reason?: string;
  result: AuditResult;
  requestId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export class LocalBusinessAuditService {
  private readonly records: RecordCollection<BusinessAuditRecord>;

  constructor(database?: LocalRecordDatabase) {
    this.records = database ? new PersistentRecords(database, "business-audit", []) : new Map();
  }

  record(input: Omit<BusinessAuditRecord, "id" | "createdAt">): BusinessAuditRecord {
    const sanitized = createAuditEvent(input);
    const record: BusinessAuditRecord = { id: randomUUID(), ...sanitized, createdAt: new Date().toISOString() };
    this.records.set(record.id, record);
    return clone(record);
  }

  list(entityId?: string): BusinessAuditRecord[] {
    return Array.from(this.records.values())
      .filter((record) => !entityId || record.entityId === entityId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(clone);
  }
}

export function getLocalBusinessAuditService(): LocalBusinessAuditService {
  return new LocalBusinessAuditService(getLocalRecordDatabase());
}

function clone(record: BusinessAuditRecord): BusinessAuditRecord {
  return { ...record, metadata: record.metadata ? { ...record.metadata } : undefined };
}
