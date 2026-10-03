import { hasHostedPermission, type HostedAccess } from "./hosted-access";
import type { Permission } from "./permissions";
import type { HostedTaskScope } from "@/platform/work/hosted-task-contract";

export function hostedScopes(access: HostedAccess, permission: Permission): HostedTaskScope[] {
  const candidates: HostedTaskScope[] = [...(access.systemAdmin ? access.managedScopes || [] : []), ...access.memberships.flatMap(item => [
    { organizationCode: item.organizationCode, periodCode: item.periodCode, divisionCode: null },
    ...(item.divisionCode ? [{ organizationCode: item.organizationCode, periodCode: item.periodCode, divisionCode: item.divisionCode }] : [])
  ])];
  const unique = new Map<string, HostedTaskScope>();
  for (const scope of candidates) if (hasHostedPermission(access, permission, { ...scope, divisionCode: scope.divisionCode || undefined }) || (["ASSET_READ", "CASE_READ", "FINANCE_READ", "EVALUATION_READ", "HANDOVER_READ", "AI_READ"].includes(permission) && access.grants.some(grant => grant.objectId && hasHostedPermission(access, permission, { ...scope, divisionCode: scope.divisionCode || undefined, objectId: grant.objectId })))) unique.set(JSON.stringify(scope), scope);
  return [...unique.values()];
}
