import type { Permission, PermissionScope } from "@/platform/authorization/permissions";
import type { Role, TestIdentity } from "@/platform/identity/test-auth";
import type { LocalAuthorizationRepository } from "@/platform/authorization/local-authorization-repository";
import { adminScopedPermissions, adminUnrestrictedPermissions, pengurusScopedPermissions } from "@/platform/authorization/test-personas";

/**
 * Provisional role baseline for hosted accounts until KPI approves the official
 * permission matrix (question K17). It mirrors the reviewed preview personas:
 * Admin Sistem (Q03: Ketua and Sekretaris) and Pengurus. Anything beyond it
 * must be an explicit, audited grant.
 */
export const productionRoleBaseline: Record<Role, readonly Permission[]> = {
  ADMIN_SISTEM: [...adminUnrestrictedPermissions, ...adminScopedPermissions],
  PENGURUS: [...pengurusScopedPermissions]
};

/**
 * Baseline permissions apply inside the production organization (any period,
 * division or object in it). Explicit grants keep their own scope and expiry.
 */
export function hasProductionPermission(
  identity: TestIdentity,
  permission: Permission,
  requested: PermissionScope,
  organizationCode: string,
  grants: Pick<LocalAuthorizationRepository, "has">
): boolean {
  const inOrganization = !requested.organizationCode || requested.organizationCode === organizationCode;
  if (inOrganization && identity.roles.some((role) => productionRoleBaseline[role].includes(permission))) return true;
  return grants.has(identity, permission, requested);
}
