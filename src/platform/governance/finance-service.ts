import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type RecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalAssetRepository, TestAssetRepository } from "@/platform/storage/asset-repository";
import { BudgetService, summarizeBudget } from "@/platform/governance/budget-service";

// PENDING_FINAL: checked by the treasurer (level 1), waiting for the chair (level 2).
export type FinanceStatus = "DRAFT" | "PENDING_APPROVAL" | "PENDING_FINAL" | "APPROVED" | "PAID" | "RECONCILED" | "REJECTED";
export type FinanceApproval = { level: 1 | 2; approverAccountId: string; at: string };
// Until KPI sets a threshold every request needs both levels; with one, only amounts above it do.
export type FinanceSettings = { id: string; organizationCode: string; periodCode: string; finalApprovalAboveMinor?: number; updatedByAccountId: string; updatedAt: string };

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
  approvals?: FinanceApproval[];
  reconciledByAccountId?: string;
  paidByAccountId?: string;
  updatedAt: string;
};

export type FinanceEvent = { id: string; recordId: string; action: "CREATED" | "SUBMITTED" | "CHECKED" | "APPROVED" | "REJECTED" | "PAID" | "RECONCILED"; actorAccountId: string; status: FinanceStatus; reason?: string; createdAt: string };

export class TestFinanceService {
  private readonly records: RecordCollection<FinanceRecord>;
  private readonly events: RecordCollection<FinanceEvent>;
  private readonly settings: RecordCollection<FinanceSettings>;
  private readonly audit: LocalBusinessAuditService;
  private readonly budgets: BudgetService;
  constructor(database?: RecordDatabase, private readonly assets = new TestAssetRepository()) {
    const seed = new Map<string, FinanceRecord>();
    if (process.env.NODE_TEST_CONTEXT) seed.set("00000000-0000-4000-8000-000000005001", { id: "00000000-0000-4000-8000-000000005001", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", title: "Operasional kegiatan · TEST", currency: "TEST", amountMinor: 1250000, requesterAccountId: "00000000-0000-4000-8000-000000000102", status: "DRAFT", updatedAt: "2026-09-22T08:00:00.000Z" });
    this.records = database ? new PersistentRecords(database, "finance", seed) : seed;
    this.events = database ? new PersistentRecords(database, "finance-events", []) : new Map();
    this.settings = database ? new PersistentRecords(database, "finance-settings", []) : new Map();
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

  getSettings(organizationCode: string, periodCode: string): FinanceSettings | null {
    const settings = this.settings.get(`${organizationCode}:${periodCode}`);
    return settings ? { ...settings } : null;
  }

  setFinalApprovalThreshold(organizationCode: string, periodCode: string, actorAccountId: string, amountMinor: number | null): FinanceSettings | null {
    if (amountMinor !== null && (!Number.isSafeInteger(amountMinor) || amountMinor < 0)) return null;
    const settings: FinanceSettings = { id: `${organizationCode}:${periodCode}`, organizationCode, periodCode, finalApprovalAboveMinor: amountMinor ?? undefined, updatedByAccountId: actorAccountId, updatedAt: new Date().toISOString() };
    this.settings.set(settings.id, settings);
    this.audit.record({ action: "FINANCE_THRESHOLD_SET", module: "finance", entityType: "finance_settings", entityId: settings.id, actorAccountId, result: "SUCCESS", requestId: `local:${settings.id}`, metadata: { finalApprovalAboveMinor: amountMinor } });
    return { ...settings };
  }

  needsFinalApproval(record: Pick<FinanceRecord, "organizationCode" | "periodCode" | "amountMinor">): boolean {
    const threshold = this.getSettings(record.organizationCode, record.periodCode)?.finalApprovalAboveMinor;
    return threshold === undefined || record.amountMinor > threshold;
  }

  // Level 1 (treasurer check). Amounts that need the chair move to PENDING_FINAL instead of APPROVED.
  approve(id: string, reviewerAccountId: string, approved: boolean, reason?: string): FinanceRecord | null {
    const record = this.records.get(id);
    if (!record || record.status !== "PENDING_APPROVAL" || record.requesterAccountId === reviewerAccountId) return null;
    if (!approved && (!reason || reason.trim().length < 3)) return null;
    if (approved && (!record.evidenceAssetId || !this.assets.canUseEvidence(record.evidenceAssetId, reviewerAccountId, record.organizationCode, record.periodCode))) return null;
    if (!approved) return this.replace(id, { ...record, status: "REJECTED", approvedByAccountId: reviewerAccountId }, "REJECTED", reviewerAccountId, reason?.trim());
    const approvals: FinanceApproval[] = [{ level: 1, approverAccountId: reviewerAccountId, at: new Date().toISOString() }];
    if (this.needsFinalApproval(record)) return this.replace(id, { ...record, status: "PENDING_FINAL", approvals }, "CHECKED", reviewerAccountId);
    return this.replace(id, { ...record, status: "APPROVED", approvedByAccountId: reviewerAccountId, approvals }, "APPROVED", reviewerAccountId);
  }

  // Level 2 (chair). Must differ from both the requester and the level-1 checker.
  approveFinal(id: string, approverAccountId: string, approved: boolean, reason?: string): FinanceRecord | null {
    const record = this.records.get(id);
    if (!record || record.status !== "PENDING_FINAL" || record.requesterAccountId === approverAccountId || record.approvals?.some((approval) => approval.approverAccountId === approverAccountId)) return null;
    if (!approved && (!reason || reason.trim().length < 3)) return null;
    if (!approved) return this.replace(id, { ...record, status: "REJECTED" }, "REJECTED", approverAccountId, reason?.trim());
    const approvals: FinanceApproval[] = [...(record.approvals ?? []), { level: 2, approverAccountId, at: new Date().toISOString() }];
    return this.replace(id, { ...record, status: "APPROVED", approvedByAccountId: approverAccountId, approvals }, "APPROVED", approverAccountId);
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
function cloneRecord(record: FinanceRecord): FinanceRecord { return { ...record, approvals: record.approvals?.map((approval) => ({ ...approval })) }; }
