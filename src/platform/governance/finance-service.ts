import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalAssetRepository, TestAssetRepository } from "@/platform/storage/asset-repository";
import { BudgetService, summarizeBudget } from "@/platform/governance/budget-service";

export type FinanceStatus = "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "PAID" | "RECONCILED" | "REJECTED";

export type FinanceRecord = {
  id: string;
  organizationCode: string;
  periodCode: string;
  title: string;
  currency: "TEST";
  amountMinor: number;
  budgetLineId?: string;
  requesterAccountId: string;
  status: FinanceStatus;
  evidenceAssetId?: string;
  approvedByAccountId?: string;
  reconciledByAccountId?: string;
  paidByAccountId?: string;
  updatedAt: string;
};

export type FinanceEvent = { id: string; recordId: string; action: "CREATED" | "SUBMITTED" | "APPROVED" | "REJECTED" | "PAID" | "RECONCILED"; actorAccountId: string; status: FinanceStatus; reason?: string; createdAt: string };

export class TestFinanceService {
  private readonly records: RecordCollection<FinanceRecord>;
  private readonly events: RecordCollection<FinanceEvent>;
  private readonly audit: LocalBusinessAuditService;
  private readonly budgets: BudgetService;
  constructor(database?: LocalRecordDatabase, private readonly assets = new TestAssetRepository()) {
    const seed = new Map<string, FinanceRecord>();
    if (process.env.NODE_TEST_CONTEXT) seed.set("00000000-0000-4000-8000-000000005001", { id: "00000000-0000-4000-8000-000000005001", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", title: "Operasional kegiatan · TEST", currency: "TEST", amountMinor: 1250000, requesterAccountId: "00000000-0000-4000-8000-000000000102", status: "DRAFT", updatedAt: "2026-09-22T08:00:00.000Z" });
    this.records = database ? new PersistentRecords(database, "finance", seed) : seed;
    this.events = database ? new PersistentRecords(database, "finance-events", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
    this.budgets = new BudgetService(database);
  }

  list(): FinanceRecord[] { return Array.from(this.records.values(), cloneRecord); }

  create(input: Omit<FinanceRecord, "id" | "status" | "updatedAt" | "approvedByAccountId" | "reconciledByAccountId" | "paidByAccountId">): FinanceRecord {
    if (!Number.isSafeInteger(input.amountMinor) || input.amountMinor <= 0) throw new Error("Amount must be a positive safe integer in minor units.");
    const approved = this.budgets.list(input.organizationCode, input.periodCode).find((plan) => plan.state === "APPROVED");
    if (approved && !input.budgetLineId) throw new Error("Budget line is required when a budget exists for this period.");
    if (input.budgetLineId) {
      if (!approved?.lines.some((line) => line.id === input.budgetLineId)) throw new Error("Budget line is not approved for this period.");
    }
    const record: FinanceRecord = { ...input, id: randomUUID(), status: "DRAFT", updatedAt: new Date().toISOString() };
    this.records.set(record.id, record);
    this.recordEvent(record, "CREATED", record.requesterAccountId);
    this.audit.record({ action: "FINANCE_CREATED", module: "finance", entityType: "finance_record", entityId: record.id, actorAccountId: record.requesterAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { status: record.status, currency: record.currency } });
    return cloneRecord(record);
  }

  submit(id: string, requesterAccountId: string, evidenceAssetId: string): FinanceRecord | null {
    const record = this.records.get(id);
    if (!record || record.requesterAccountId !== requesterAccountId || record.status !== "DRAFT" || !evidenceAssetId) return null;
    if (!this.assets.canUseEvidence(evidenceAssetId, requesterAccountId, record.organizationCode, record.periodCode)) return null;
    return this.replace(id, { ...record, evidenceAssetId, status: "PENDING_APPROVAL" }, "SUBMITTED", requesterAccountId);
  }

  approve(id: string, reviewerAccountId: string, approved: boolean, reason?: string): FinanceRecord | null {
    const record = this.records.get(id);
    if (!record || record.status !== "PENDING_APPROVAL" || record.requesterAccountId === reviewerAccountId) return null;
    if (!approved && (!reason || reason.trim().length < 3)) return null;
    if (approved && (!record.evidenceAssetId || !this.assets.canUseEvidence(record.evidenceAssetId, reviewerAccountId, record.organizationCode, record.periodCode))) return null;
    return this.replace(id, { ...record, status: approved ? "APPROVED" : "REJECTED", approvedByAccountId: reviewerAccountId }, approved ? "APPROVED" : "REJECTED", reviewerAccountId, reason?.trim());
  }

  markPaid(id: string, actorAccountId: string): FinanceRecord | null {
    const record = this.records.get(id);
    if (!record || record.status !== "APPROVED" || record.requesterAccountId === actorAccountId) return null;
    const approvedPlan = this.budgets.list(record.organizationCode, record.periodCode).find((plan) => plan.state === "APPROVED");
    if (approvedPlan) {
      if (!record.budgetLineId) return null;
      const usage = summarizeBudget(approvedPlan, this.list()).find((line) => line.lineId === record.budgetLineId);
      if (!usage || record.amountMinor > usage.remainingMinor) return null;
    }
    return this.replace(id, { ...record, status: "PAID", paidByAccountId: actorAccountId }, "PAID", actorAccountId);
  }

  reconcile(id: string, reviewerAccountId: string): FinanceRecord | null {
    const record = this.records.get(id);
    if (!record || record.status !== "PAID" || record.requesterAccountId === reviewerAccountId) return null;
    return this.replace(id, { ...record, status: "RECONCILED", reconciledByAccountId: reviewerAccountId }, "RECONCILED", reviewerAccountId);
  }

  listEvents(recordId: string): FinanceEvent[] { return Array.from(this.events.values()).filter((event) => event.recordId === recordId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((event) => ({ ...event })); }
  listAudit(entityId?: string) { return this.audit.list(entityId); }

  private replace(id: string, record: FinanceRecord, action: FinanceEvent["action"], actorAccountId: string, reason?: string): FinanceRecord {
    const previousStatus = this.records.get(id)?.status;
    const updated = { ...record, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.recordEvent(updated, action, actorAccountId, reason);
    this.audit.record({ action: `FINANCE_${action}`, module: "finance", entityType: "finance_record", entityId: id, actorAccountId, reason, result: "SUCCESS", requestId: `local:${id}`, metadata: { previousStatus, nextStatus: updated.status } });
    return cloneRecord(updated);
  }

  private recordEvent(record: FinanceRecord, action: FinanceEvent["action"], actorAccountId: string, reason?: string): void {
    const event: FinanceEvent = { id: randomUUID(), recordId: record.id, action, actorAccountId, reason, status: record.status, createdAt: new Date().toISOString() };
    this.events.set(event.id, event);
  }
}

export function getLocalFinanceService(): TestFinanceService { return new TestFinanceService(getLocalRecordDatabase(), getLocalAssetRepository()); }
function cloneRecord(record: FinanceRecord): FinanceRecord { return { ...record }; }
