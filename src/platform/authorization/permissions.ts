import type { TestIdentity } from "@/platform/identity/test-auth";
import { getLocalAuthorizationRepository } from "@/platform/authorization/local-authorization-repository";
import { ketuaScopedPermissions } from "@/platform/authorization/test-personas";

import { permissions, type Permission } from "./permission-catalog";
export { permissions, type Permission } from "./permission-catalog";

export type PermissionScope = {
  organizationCode?: string;
  periodCode?: string;
  divisionCode?: string;
  objectId?: string;
};

type TestPermissionGrant = PermissionScope & {
  email: string;
  permission: Permission;
};

const testPermissionGrants: TestPermissionGrant[] = [
  { email: "admin.test@kpi.local", permission: "SYSTEM_CONFIGURATION_READ" },
  { email: "admin.test@kpi.local", permission: "IDENTITY_READ" },
  { email: "admin.test@kpi.local", permission: "WORKSPACE_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "CONTENT_DRAFT_WRITE", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "CONTENT_PUBLISH", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "ASSET_UPLOAD", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "ASSET_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "ASSET_DOWNLOAD", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "ASPIRATION_TRIAGE", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "NOTIFICATION_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "TASK_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "TASK_CREATE", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "TASK_REVIEW", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "MEETING_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "MEETING_MANAGE", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "FINANCE_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "FINANCE_MANAGE", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "EVALUATION_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "EVALUATION_WRITE", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "KNOWLEDGE_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "KNOWLEDGE_WRITE", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "HANDOVER_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "HANDOVER_ACCEPT", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "AI_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "admin.test@kpi.local", permission: "AI_ACTION_CONFIRM", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "WORKSPACE_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "TASK_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "TASK_SUBMIT", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "MEETING_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "FINANCE_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "EVALUATION_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "KNOWLEDGE_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "KNOWLEDGE_REVIEW", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "NOTIFICATION_TEMPLATE_REVIEW", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "HANDOVER_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "HANDOVER_ACCEPT", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "AI_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "CONTENT_REVIEW", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "ASSET_READ", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  { email: "pengurus.test@kpi.local", permission: "ASSET_DOWNLOAD", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" },
  ...ketuaScopedPermissions.map((permission) => ({ email: "ketua.test@kpi.local", permission, organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" }))
];

/**
 * Local TEST sessions deliberately receive only system-read capabilities.
 * Real content and file grants must come from KPI-managed account, role, and
 * assignment records after their authorization policy is approved.
 */
export function hasTestPermission(identity: TestIdentity, permission: Permission, scope: PermissionScope = {}): boolean {
  if (process.env.KPI_APP_ENV === "local" && process.env.KPI_TEST_AUTH_ENABLED === "true") {
    return getLocalAuthorizationRepository().has(identity, permission, scope);
  }
  return testPermissionGrants.some((grant) => grant.email === identity.email && grant.permission === permission && scopeMatches(grant, scope));
}

function scopeMatches(grant: TestPermissionGrant, requested: PermissionScope): boolean {
  return matchesScopeValue(grant.organizationCode, requested.organizationCode)
    && matchesScopeValue(grant.periodCode, requested.periodCode)
    && matchesScopeValue(grant.divisionCode, requested.divisionCode)
    && matchesScopeValue(grant.objectId, requested.objectId);
}

function matchesScopeValue(granted: string | undefined, requested: string | undefined): boolean {
  if (!granted) return true;
  return granted === requested;
}
