import assert from "node:assert/strict";
import test from "node:test";
import { TestFinanceService } from "@/platform/governance/finance-service";

const admin = "00000000-0000-4000-8000-000000000101";
const pengurus = "00000000-0000-4000-8000-000000000102";
const ketua = "00000000-0000-4000-8000-000000000103";
const evidence = "00000000-0000-4000-8000-000000002001";
const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };

function submitted(service: TestFinanceService, amountMinor: number) {
  const record = service.create({ ...scope, title: "Cetak buletin · TEST", currency: "TEST", amountMinor, requesterAccountId: pengurus });
  return service.submit(record.id, pengurus, evidence)!;
}

test("without a KPI threshold every request needs the chair after the treasurer check", () => {
  const service = new TestFinanceService();
  const record = submitted(service, 10_000);
  assert.equal(service.approve(record.id, admin, true)?.status, "PENDING_FINAL");
  assert.equal(service.markPaid(record.id, admin), null, "cannot pay before final approval");
  assert.equal(service.approveFinal(record.id, admin, true), null, "level-1 checker cannot also give final approval");
  assert.equal(service.approveFinal(record.id, pengurus, true), null, "requester cannot approve");
  const approved = service.approveFinal(record.id, ketua, true);
  assert.equal(approved?.status, "APPROVED");
  assert.deepEqual(approved?.approvals?.map((approval) => [approval.level, approval.approverAccountId]), [[1, admin], [2, ketua]]);
  assert.deepEqual(service.listEvents(record.id).map((event) => event.action), ["CREATED", "SUBMITTED", "CHECKED", "APPROVED"]);
});

test("with a threshold only amounts above it go to the chair", () => {
  const service = new TestFinanceService();
  service.setFinalApprovalThreshold(scope.organizationCode, scope.periodCode, ketua, 50_000);
  assert.equal(service.approve(submitted(service, 50_000).id, admin, true)?.status, "APPROVED");
  assert.equal(service.approve(submitted(service, 50_001).id, admin, true)?.status, "PENDING_FINAL");
});

test("the chair's rejection needs a reason and invalid thresholds are refused", () => {
  const service = new TestFinanceService();
  const record = submitted(service, 90_000);
  service.approve(record.id, admin, true);
  assert.equal(service.approveFinal(record.id, ketua, false), null);
  assert.equal(service.approveFinal(record.id, ketua, false, "Di atas pagu pos publikasi")?.status, "REJECTED");
  assert.equal(service.setFinalApprovalThreshold(scope.organizationCode, scope.periodCode, ketua, -1), null);
  assert.equal(service.setFinalApprovalThreshold(scope.organizationCode, scope.periodCode, ketua, 1.5), null);
});
