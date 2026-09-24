import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import type { FinanceRecord } from "@/platform/governance/finance-service";

export type BudgetLine = { id: string; name: string; amountMinor: number };
export type BudgetPlan = {
  id: string;
  organizationCode: string;
  periodCode: string;
  currency: "TEST";
  version: number;
  state: "DRAFT" | "APPROVED";
  lines: BudgetLine[];
  createdByAccountId: string;
  approvedByAccountId?: string;
  sourcePlanId?: string;
  updatedAt: string;
};

export class BudgetService {
  private readonly records: RecordCollection<BudgetPlan>;
  private readonly financeRecords: RecordCollection<FinanceRecord>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase) {
    this.records = database ? new PersistentRecords(database, "budget-plans", []) : new Map();
    this.financeRecords = database ? new PersistentRecords(database, "finance", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  list(organizationCode: string, periodCode: string): BudgetPlan[] {
    return Array.from(this.records.values()).filter((plan) => plan.organizationCode === organizationCode && plan.periodCode === periodCode).map(clone).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  create(input: Pick<BudgetPlan, "organizationCode" | "periodCode" | "createdByAccountId">): BudgetPlan {
    if (this.list(input.organizationCode, input.periodCode).some((plan) => plan.state === "DRAFT")) throw new Error("A budget draft already exists for this period.");
    const previous = this.list(input.organizationCode, input.periodCode).find((item) => item.state === "APPROVED");
    const plan: BudgetPlan = { ...input, id: randomUUID(), currency: "TEST", version: 1, state: "DRAFT", lines: previous?.lines.map((line) => ({ ...line })) ?? [], sourcePlanId: previous?.id, updatedAt: new Date().toISOString() };
    this.records.set(plan.id, plan);
    this.audit.record({ action: "BUDGET_DRAFT_CREATED", module: "finance", entityType: "budget_plan", entityId: plan.id, actorAccountId: input.createdByAccountId, result: "SUCCESS", requestId: `local:${plan.id}`, metadata: { version: plan.version, periodCode: plan.periodCode } });
    return clone(plan);
  }

  addLine(id: string, actorAccountId: string, expectedVersion: number, name: string, amountMinor: number): BudgetPlan | null {
    const plan = this.records.get(id);
    if (!plan || plan.state !== "DRAFT" || plan.createdByAccountId !== actorAccountId || plan.version !== expectedVersion || name.trim().length < 3 || !Number.isSafeInteger(amountMinor) || amountMinor <= 0 || !Number.isSafeInteger(plan.lines.reduce((sum, line) => sum + line.amountMinor, amountMinor))) return null;
    const updated = { ...plan, version: plan.version + 1, lines: [...plan.lines, { id: randomUUID(), name: name.trim(), amountMinor }], updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "BUDGET_LINE_ADDED", module: "finance", entityType: "budget_plan", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { previousVersion: plan.version, nextVersion: updated.version, lineCount: updated.lines.length } });
    return clone(updated);
  }

  updateLine(id: string, actorAccountId: string, expectedVersion: number, lineId: string, name: string, amountMinor: number): BudgetPlan | null {
    const plan = this.records.get(id);
    if (!plan || plan.state !== "DRAFT" || plan.createdByAccountId !== actorAccountId || plan.version !== expectedVersion || !plan.lines.some((line) => line.id === lineId) || name.trim().length < 3 || !Number.isSafeInteger(amountMinor) || amountMinor <= 0) return null;
    const lines = plan.lines.map((line) => line.id === lineId ? { ...line, name: name.trim(), amountMinor } : line);
    if (!Number.isSafeInteger(lines.reduce((sum, line) => sum + line.amountMinor, 0))) return null;
    const updated = { ...plan, lines, version: plan.version + 1, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "BUDGET_LINE_UPDATED", module: "finance", entityType: "budget_plan", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { lineId, previousVersion: plan.version, nextVersion: updated.version } });
    return clone(updated);
  }

  approve(id: string, actorAccountId: string, expectedVersion: number): BudgetPlan | null {
    const plan = this.records.get(id);
    if (!plan || plan.state !== "DRAFT" || plan.createdByAccountId === actorAccountId || plan.version !== expectedVersion || plan.lines.length === 0) return null;
    if (summarizeBudget(plan, Array.from(this.financeRecords.values())).some((line) => line.remainingMinor < 0)) return null;
    const updated: BudgetPlan = { ...plan, state: "APPROVED", version: plan.version + 1, approvedByAccountId: actorAccountId, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "BUDGET_APPROVED", module: "finance", entityType: "budget_plan", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { previousVersion: plan.version, nextVersion: updated.version, amountMinor: updated.lines.reduce((sum, line) => sum + line.amountMinor, 0) } });
    return clone(updated);
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

export function getLocalBudgetService(): BudgetService { return new BudgetService(getLocalRecordDatabase()); }
function clone(plan: BudgetPlan): BudgetPlan { return { ...plan, lines: plan.lines.map((line) => ({ ...line })) }; }

export type BudgetLineUsage = { lineId: string; name: string; allocatedMinor: number; spentMinor: number; remainingMinor: number };

export function summarizeBudget(plan: BudgetPlan, records: FinanceRecord[]): BudgetLineUsage[] {
  const paid = records.filter((record) => record.organizationCode === plan.organizationCode && record.periodCode === plan.periodCode && (record.status === "PAID" || record.status === "RECONCILED"));
  return plan.lines.map((line) => {
    const spentMinor = paid.filter((record) => record.budgetLineId === line.id).reduce((sum, record) => sum + record.amountMinor, 0);
    return { lineId: line.id, name: line.name, allocatedMinor: line.amountMinor, spentMinor, remainingMinor: line.amountMinor - spentMinor };
  });
}
