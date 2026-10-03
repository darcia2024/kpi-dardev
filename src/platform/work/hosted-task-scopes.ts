import { hasHostedPermission, type HostedAccess } from "@/platform/authorization/hosted-access";
import type { HostedTaskScope } from "./hosted-task-contract";

export function hostedTaskScopes(identity: HostedAccess): HostedTaskScope[] {
  const candidates = [...(identity.systemAdmin ? identity.managedScopes || [] : []), ...identity.memberships.flatMap(item => [
    { organizationCode: item.organizationCode, periodCode: item.periodCode, divisionCode: null },
    ...(item.divisionCode ? [{ organizationCode: item.organizationCode, periodCode: item.periodCode, divisionCode: item.divisionCode }] : [])
  ])];
  const distinct = new Map<string, HostedTaskScope>();
  for (const scope of candidates) if (hasHostedPermission(identity,"TASK_READ",{ ...scope, divisionCode: scope.divisionCode || undefined })) distinct.set(JSON.stringify(scope),scope);
  return [...distinct.values()];
}
