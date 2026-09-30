import test from "node:test";
import assert from "node:assert/strict";
import { hasProductionPermission, productionRoleBaseline } from "../src/platform/authorization/production-authorization";
import { productionOrganizationCode, selectPortalPeriod } from "../src/platform/identity/portal-context";
import { SupabaseRecordStore } from "../src/platform/data/supabase-record-store";
import { SupabaseRequestError, SupabaseRestClient } from "../src/platform/data/supabase-rest";
import { RecordConflictError } from "../src/platform/data/local-record-store";
import type { PeriodRecord } from "../src/platform/data/organization-repository";

const noGrants = { has: () => false };
const admin = { accountId: "a", email: "admin@kpi.org", name: "Admin", roles: ["ADMIN_SISTEM", "PENGURUS"] as const };
const pengurus = { accountId: "p", email: "p@kpi.org", name: "Pengurus", roles: ["PENGURUS"] as const };
const org = "KPI_PPMI_MESIR";

test("role baseline gives Pengurus work permissions but not creation or review", () => {
  const identity = { ...pengurus, roles: [...pengurus.roles] };
  assert.equal(hasProductionPermission(identity, "TASK_READ", { organizationCode: org, periodCode: "2026_2027" }, org, noGrants), true);
  assert.equal(hasProductionPermission(identity, "TASK_SUBMIT", { organizationCode: org }, org, noGrants), true);
  assert.equal(hasProductionPermission(identity, "TASK_CREATE", { organizationCode: org }, org, noGrants), false);
  assert.equal(hasProductionPermission(identity, "TASK_REVIEW", { organizationCode: org }, org, noGrants), false);
  assert.equal(hasProductionPermission(identity, "IDENTITY_MANAGE", {}, org, noGrants), false);
});

test("Admin Sistem baseline includes task management and system configuration", () => {
  const identity = { ...admin, roles: [...admin.roles] };
  for (const permission of ["TASK_CREATE", "TASK_REVIEW", "TASK_SUBMIT", "SYSTEM_CONFIGURATION_READ"] as const) {
    assert.equal(hasProductionPermission(identity, permission, { organizationCode: org }, org, noGrants), true, permission);
  }
  assert.ok(!productionRoleBaseline.ADMIN_SISTEM.includes("FINANCE_APPROVE_FINAL"), "final finance approval is never automatic");
});

test("baseline never reaches another organization; explicit grants still can", () => {
  const identity = { ...admin, roles: [...admin.roles] };
  assert.equal(hasProductionPermission(identity, "TASK_READ", { organizationCode: "OTHER" }, org, noGrants), false);
  const grants = { has: (_identity: unknown, permission: string, scope: { organizationCode?: string }) => permission === "TASK_READ" && scope.organizationCode === "OTHER" };
  assert.equal(hasProductionPermission(identity, "TASK_READ", { organizationCode: "OTHER" }, org, grants), true);
  const withGrant = { has: (_identity: unknown, permission: string) => permission === "FINANCE_APPROVE_FINAL" };
  assert.equal(hasProductionPermission(identity, "FINANCE_APPROVE_FINAL", { organizationCode: org }, org, withGrant), true);
});

test("period selection prefers the requested open period, then the active one, never a closed one", () => {
  const period = (code: string, status: PeriodRecord["status"]): PeriodRecord => ({ id: code, organizationId: "o", code, startsOn: "2026-01-01", endsOn: "2026-12-31", status });
  const periods = [period("2027_2028", "PLANNED"), period("2026_2027", "ACTIVE"), period("2025_2026", "CLOSED")];
  assert.equal(selectPortalPeriod(periods, "2027_2028")?.code, "2027_2028");
  assert.equal(selectPortalPeriod(periods, "2025_2026")?.code, "2026_2027");
  assert.equal(selectPortalPeriod(periods)?.code, "2026_2027");
  assert.equal(selectPortalPeriod([period("2025_2026", "CLOSED")]), undefined);
});

test("production organization code defaults to KPI and can be configured", () => {
  assert.equal(productionOrganizationCode({}), "KPI_PPMI_MESIR");
  assert.equal(productionOrganizationCode({ KPI_ORGANIZATION_CODE: " kpi_lain " }), "KPI_LAIN");
});

function fakeClient(status: number, body: unknown, calls: Array<{ url: string; init?: RequestInit }> = []): SupabaseRestClient {
  const fetcher = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  return new SupabaseRestClient({ url: "https://kpi.supabase.co", serviceRoleKey: "service-key" }, fetcher);
}

test("record store calls the server-only functions and maps conflicts", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const store = new SupabaseRecordStore(fakeClient(200, [{ namespace: "tasks", id: "t1", revision: 1, payload: { a: 1 } }], calls));
  assert.deepEqual(await store.load("org", ["business-audit"], []), [{ namespace: "tasks", id: "t1", revision: 1, payload: { a: 1 } }]);
  assert.equal(calls[0].url, "https://kpi.supabase.co/rest/v1/rpc/kpi_load_records");
  assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { p_organization_id: "org", p_skip: ["business-audit"], p_include: [] });

  const conflicting = new SupabaseRecordStore(fakeClient(400, { code: "P0001", message: "RECORD_CONFLICT" }));
  await assert.rejects(conflicting.commit("org", null, [{ namespace: "tasks", id: "t1", expectedRevision: 1, payload: {} }]), RecordConflictError);

  const broken = new SupabaseRecordStore(fakeClient(500, { message: "boom" }));
  await assert.rejects(broken.commit("org", null, []), (error: unknown) => error instanceof SupabaseRequestError && error.status === 500 && !error.message.includes("boom"));

  const malformed = new SupabaseRecordStore(fakeClient(200, { not: "an array" }));
  await assert.rejects(malformed.load("org", [], []), /Unexpected record store response/);
});
