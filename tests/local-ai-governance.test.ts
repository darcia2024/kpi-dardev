import assert from "node:assert/strict";
import test from "node:test";
import { LocalRecordDatabase } from "@/platform/data/local-record-store";
import { LocalAiGovernanceService } from "@/platform/ai/local-ai-governance";

const author = "00000000-0000-4000-8000-000000000101";
const other = "00000000-0000-4000-8000-000000000102";

test("provider candidates are versioned, author-scoped and never activate a provider", () => {
  const database = new LocalRecordDatabase(":memory:");
  try {
    const service = new LocalAiGovernanceService(database);
    const draft = service.saveProvider({ providerName: "", modelId: "", processingRegion: "", promptVersion: "" }, author);
    assert.ok(draft);
    assert.equal(service.submitProvider(draft.id, draft.version, author), null);
    assert.equal(service.saveProvider({ providerName: "Candidate", modelId: "model", processingRegion: "region", promptVersion: "p1" }, other, draft.id, draft.version), null);
    const revised = service.saveProvider({ providerName: "Candidate", modelId: "model", processingRegion: "region", promptVersion: "p1" }, author, draft.id, draft.version);
    assert.equal(revised?.version, 2);
    assert.equal(service.submitProvider(draft.id, 1, author), null);
    const submitted = service.submitProvider(draft.id, 2, author);
    assert.equal(submitted?.status, "IN_REVIEW");
    assert.equal(service.saveProvider({ providerName: "Changed", modelId: "model", processingRegion: "region", promptVersion: "p2" }, author, draft.id, 2), null);
    assert.equal(new LocalAiGovernanceService(database).listProviders()[0]?.status, "IN_REVIEW");
    assert.equal(service.readiness().enabled, false);
  } finally { database.close(); }
});

test("policy drafts require data classes, region, retention and human review before submission", () => {
  const service = new LocalAiGovernanceService();
  const draft = service.savePolicy({ allowedDataClasses: [], processingRegion: "", retentionDays: null, humanReviewRequired: true }, author);
  assert.ok(draft);
  assert.equal(service.submitPolicy(draft.id, draft.version, author), null);
  const revised = service.savePolicy({ allowedDataClasses: ["public", "public"], processingRegion: "region", retentionDays: 0, humanReviewRequired: false }, author, draft.id, 1);
  assert.deepEqual(revised?.allowedDataClasses, ["public"]);
  assert.equal(service.submitPolicy(draft.id, 2, author), null);
  const ready = service.savePolicy({ allowedDataClasses: ["public"], processingRegion: "region", retentionDays: 0, humanReviewRequired: true }, author, draft.id, 2);
  assert.equal(service.submitPolicy(draft.id, 3, other), null);
  assert.equal(service.submitPolicy(draft.id, ready!.version, author)?.status, "IN_REVIEW");
  assert.equal(service.readiness().enabled, false);
  assert.ok(service.readiness().blockers.length > 0);
});
