import { randomUUID } from "node:crypto";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";

export type LegalHold = { id: string; assetId: string; reason: string; placedByAccountId: string; placedAt: string; releasedByAccountId?: string; releasedAt?: string; releaseReason?: string };

export class LocalLegalHoldRepository {
  private readonly records: RecordCollection<LegalHold>;
  private readonly audit: LocalBusinessAuditService;
  constructor(database?: LocalRecordDatabase) {
    this.records = database ? new PersistentRecords(database, "legal-holds", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }
  list(): LegalHold[] { return Array.from(this.records.values()).map((hold) => ({ ...hold })).sort((a, b) => b.placedAt.localeCompare(a.placedAt)); }
  hasActive(assetId: string): boolean { return this.list().some((hold) => hold.assetId === assetId && !hold.releasedAt); }
  place(assetId: string, reason: string, actorAccountId: string): LegalHold | null {
    if (this.hasActive(assetId) || reason.trim().length < 10) return null;
    const hold: LegalHold = { id: randomUUID(), assetId, reason: reason.trim(), placedByAccountId: actorAccountId, placedAt: new Date().toISOString() };
    this.records.set(hold.id, hold);
    this.audit.record({ action: "ASSET_LEGAL_HOLD_PLACED", module: "legal_hold", entityType: "asset", entityId: assetId, actorAccountId, result: "SUCCESS", requestId: `local:${hold.id}`, metadata: { holdId: hold.id } });
    return { ...hold };
  }
  release(id: string, reason: string, actorAccountId: string): LegalHold | null {
    const current = this.records.get(id);
    if (!current || current.releasedAt || reason.trim().length < 10) return null;
    const updated = { ...current, releasedAt: new Date().toISOString(), releasedByAccountId: actorAccountId, releaseReason: reason.trim() };
    this.records.set(id, updated);
    this.audit.record({ action: "ASSET_LEGAL_HOLD_RELEASED", module: "legal_hold", entityType: "asset", entityId: current.assetId, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { holdId: id } });
    return { ...updated };
  }
}

export function getLocalLegalHoldRepository(): LocalLegalHoldRepository { return new LocalLegalHoldRepository(getLocalRecordDatabase()); }
