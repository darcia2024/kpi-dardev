import assert from "node:assert/strict";
import test from "node:test";
import { TestHandoverService } from "../src/platform/governance/handover-service";

test("handover access preflight reports source access without changing grants", () => {
  const service = new TestHandoverService();
  const record = service.list()[0];
  const before = service.listAudit(record.id).length;
  const plan = service.accessPlan(record.id);
  assert.equal(plan?.handoverId, record.id);
  assert.equal(plan?.sources.length, record.sourceAssetIds.length);
  assert.equal(plan?.executable, false);
  assert.equal(service.listAudit(record.id).length, before);
  assert.equal(service.accessPlan("00000000-0000-4000-8000-000000000000"), null);
});
