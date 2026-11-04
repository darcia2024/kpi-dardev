import { hasHostedPermission, type HostedAccess } from "./hosted-access";
import type { Permission } from "./permissions";
import type { HostedTaskScope } from "@/platform/work/hosted-task-contract";

// Super admins can read periods that are not running yet or have ended; nothing else can be done in them.
export function isReadOnlyScope(access: HostedAccess, scope: HostedTaskScope): boolean {
  return access.superAdminScopes?.some(item => item.organizationCode === scope.organizationCode && item.periodCode === scope.periodCode && !item.operational) === true;
}

export function scopeLabel(access: HostedAccess, scope: HostedTaskScope): string {
  return `${scope.organizationCode} · ${scope.periodCode}${scope.divisionCode ? ` · ${scope.divisionCode}` : ""}${isReadOnlyScope(access, scope) ? " · Baca saja" : ""}`;
}

// Invited members without the meeting permission can still open the Rapat page and see their internal meetings.
export function hostedMeetingScopes(access: HostedAccess): HostedTaskScope[] {
  const unique = new Map<string, HostedTaskScope>();
  for (const scope of [...hostedScopes(access, "MEETING_READ"), ...access.memberships.map(item => ({ organizationCode: item.organizationCode, periodCode: item.periodCode, divisionCode: null }))]) unique.set(JSON.stringify(scope), scope);
  return [...unique.values()];
}

export function hostedScopes(access: HostedAccess, permission: Permission): HostedTaskScope[] {
  const candidates: HostedTaskScope[] = [...(access.systemAdmin ? access.managedScopes || [] : []), ...(access.systemAdmin && access.superAdmin ? (access.superAdminScopes || []).map(({organizationCode,periodCode,divisionCode})=>({organizationCode,periodCode,divisionCode})) : []), ...access.memberships.flatMap(item => [
    { organizationCode: item.organizationCode, periodCode: item.periodCode, divisionCode: null },
    ...(item.divisionCode ? [{ organizationCode: item.organizationCode, periodCode: item.periodCode, divisionCode: item.divisionCode }] : [])
  ])];
  const unique = new Map<string, HostedTaskScope>();
  for (const scope of candidates) if (hasHostedPermission(access, permission, { ...scope, divisionCode: scope.divisionCode || undefined }) || (["ASSET_READ", "CASE_READ", "FINANCE_READ", "EVALUATION_READ", "HANDOVER_READ", "AI_READ"].includes(permission) && access.grants.some(grant => grant.objectId && hasHostedPermission(access, permission, { ...scope, divisionCode: scope.divisionCode || undefined, objectId: grant.objectId })))) unique.set(JSON.stringify(scope), scope);
  return [...unique.values()];
}
