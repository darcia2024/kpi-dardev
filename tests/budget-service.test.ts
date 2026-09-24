import assert from "node:assert/strict";
import test from "node:test";
import { BudgetService, summarizeBudget } from "../src/platform/governance/budget-service";
import { TestFinanceService, type FinanceRecord } from "../src/platform/governance/finance-service";
import { LocalRecordDatabase } from "../src/platform/data/local-record-store";

test("budget draft revisions require the creator and approval requires another actor", () => {
  const service = new BudgetService();
  const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };
  const draft = service.create({ ...scope, createdByAccountId: "author" });
  assert.equal(service.list("OTHER", scope.periodCode).length, 0);
  assert.throws(() => service.create({ ...scope, createdByAccountId: "author" }));
  assert.equal(service.addLine(draft.id, "other", 1, "Kegiatan", 1000), null);
  assert.equal(service.addLine(draft.id, "author", 2, "Kegiatan", 1000), null);
  const revised = service.addLine(draft.id, "author", 1, "Kegiatan", 1000);
  assert.equal(revised?.version, 2);
  assert.equal(service.approve(draft.id, "author", 2), null);
  assert.equal(service.approve(draft.id, "other", 1), null);
  assert.equal(service.approve(draft.id, "other", 2)?.state, "APPROVED");
  assert.equal(service.addLine(draft.id, "author", 3, "Pos baru", 500), null);
  assert.equal(service.listAudit(draft.id).at(-1)?.action, "BUDGET_APPROVED");
});

test("approved lines link transactions and a revision cannot undercut paid spending", () => {
  const database = new LocalRecordDatabase(":memory:");
  const budget = new BudgetService(database);
  const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };
  const first = budget.create({ ...scope, createdByAccountId: "author" });
  const linePlan = budget.addLine(first.id, "author", 1, "Program kerja", 1000);
  assert.ok(linePlan);
  const approved = budget.approve(first.id, "reviewer", 2);
  assert.ok(approved);
  const finance = new TestFinanceService(database);
  assert.throws(() => finance.create({ ...scope, title: "Tanpa pos", currency: "TEST", amountMinor: 100, requesterAccountId: "requester" }), /Budget line is required/);
  const linked = finance.create({ ...scope, title: "Kegiatan", currency: "TEST", amountMinor: 400, requesterAccountId: "requester", budgetLineId: approved.lines[0].id });
  const paid: FinanceRecord = { ...linked, status: "PAID" };
  database.write("finance", linked.id, paid, 1);
  assert.deepEqual(summarizeBudget(approved, new TestFinanceService(database).list()).map(({ allocatedMinor, spentMinor, remainingMinor }) => ({ allocatedMinor, spentMinor, remainingMinor })), [{ allocatedMinor: 1000, spentMinor: 400, remainingMinor: 600 }]);
  const second = new TestFinanceService(database).create({ ...scope, title: "Kegiatan tambahan", currency: "TEST", amountMinor: 700, requesterAccountId: "requester", budgetLineId: approved.lines[0].id });
  database.write("finance", second.id, { ...second, status: "APPROVED" }, 1);
  assert.equal(new TestFinanceService(database).markPaid(second.id, "reviewer"), null);
  const revision = budget.create({ ...scope, createdByAccountId: "author" });
  assert.equal(revision.sourcePlanId, approved.id);
  assert.equal(revision.lines[0].id, approved.lines[0].id);
  const lowered = budget.updateLine(revision.id, "author", 1, revision.lines[0].id, "Program kerja", 300);
  assert.ok(lowered);
  assert.equal(budget.approve(revision.id, "reviewer", 2), null);
  database.close();
});
