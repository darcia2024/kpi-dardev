import assert from "node:assert/strict";
import test from "node:test";
import { getSupabaseConfiguration, getSupabaseIntegrationStatus } from "../src/platform/config/integrations";
import { hasTestPermission } from "../src/platform/authorization/permissions";
import { evaluateUpload } from "../src/platform/storage/upload-policy";
import { canApproveContent, canTransitionContent } from "../src/platform/workflow/content-lifecycle";
import { createAuditEvent } from "../src/platform/audit/event";

test("does not treat incomplete Supabase settings as a usable integration", () => {
  assert.equal(getSupabaseIntegrationStatus({}), "NOT_CONFIGURED");
  assert.equal(getSupabaseIntegrationStatus({ KPI_SUPABASE_URL: "https://example.supabase.co" }), "INVALID_CONFIGURATION");
  assert.equal(getSupabaseConfiguration({ KPI_SUPABASE_URL: "mailto:invalid", KPI_SUPABASE_SERVICE_ROLE_KEY: "key" }), null);

  assert.deepEqual(
    getSupabaseConfiguration({ KPI_SUPABASE_URL: "https://example.supabase.co/", KPI_SUPABASE_SERVICE_ROLE_KEY: "key" }),
    { url: "https://example.supabase.co", serviceRoleKey: "key" }
  );
});

test("keeps business capabilities ungranted for local TEST roles", () => {
  const admin = { accountId: "admin", email: "admin.test@kpi.local", name: "Admin", roles: ["ADMIN_SISTEM", "PENGURUS"] as const };
  const pengurus = { accountId: "pengurus", email: "pengurus.test@kpi.local", name: "Pengurus", roles: ["PENGURUS"] as const };
  assert.equal(hasTestPermission(admin, "SYSTEM_CONFIGURATION_READ"), true);
  assert.equal(hasTestPermission(admin, "CONTENT_PUBLISH"), false);
  assert.equal(hasTestPermission(pengurus, "SYSTEM_CONFIGURATION_READ"), false);
  assert.equal(hasTestPermission(pengurus, "WORKSPACE_READ"), false);
  assert.equal(hasTestPermission(pengurus, "WORKSPACE_READ", { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" }), true);
  assert.equal(hasTestPermission(pengurus, "WORKSPACE_READ", { organizationCode: "KPI_TEST", periodCode: "2025_2026_TEST" }), false);
});

test("requires a policy before files can enter storage", () => {
  const candidate = { fileName: "laporan.pdf", mimeType: "application/pdf", sizeBytes: 1024 };
  assert.deepEqual(evaluateUpload(candidate, { maxBytes: 25_000_000, allowedMimeTypes: null }), { allowed: false, reason: "POLICY_REQUIRED" });
  assert.deepEqual(
    evaluateUpload({ ...candidate, fileName: "installer.exe" }, { maxBytes: 25_000_000, allowedMimeTypes: ["application/pdf"] }),
    { allowed: false, reason: "UNSAFE_EXTENSION" }
  );
  assert.deepEqual(evaluateUpload(candidate, { maxBytes: 25_000_000, allowedMimeTypes: ["application/pdf"] }), { allowed: true });
});

test("workflow requires a valid transition and a separate reviewer", () => {
  assert.equal(canTransitionContent("DRAFT", "IN_REVIEW"), true);
  assert.equal(canTransitionContent("DRAFT", "PUBLISHED"), false);
  assert.equal(canApproveContent({ authorAccountId: "author", reviewerAccountId: "author", hasReviewPermission: true }), false);
  assert.equal(canApproveContent({ authorAccountId: "author", reviewerAccountId: "reviewer", hasReviewPermission: true }), true);
});

test("audit metadata never retains obvious credentials", () => {
  const event = createAuditEvent({
    action: "CONTENT_UPDATED",
    module: "content",
    entityType: "entry",
    result: "SUCCESS",
    requestId: "request-1",
    metadata: { title: "Panduan", token: "secret", cookie: "session", nested: { Authorization: "Bearer hidden", safe: "ok", items: [{ serviceRoleKey: "hidden", count: 2 }] } }
  });
  assert.deepEqual(event.metadata, { title: "Panduan", nested: { safe: "ok", items: [{ count: 2 }] } });
});
