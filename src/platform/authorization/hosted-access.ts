import { z } from "zod";
import type { Permission, PermissionScope } from "./permissions";

const membershipSchema = z.object({ organizationCode: z.string().min(1), periodCode: z.string().min(1), divisionCode: z.string().nullable(), position: z.string().min(1) });
const grantSchema = z.object({ permission: z.string().min(1), organizationCode: z.string().min(1), periodCode: z.string().min(1), divisionCode: z.string().nullable(), objectId: z.string().uuid().nullable(), expiresAt: z.string().datetime({ offset: true }).nullable() });
const contextSchema = z.object({ accountId: z.string().uuid(), authUserId: z.string().uuid(), email: z.string().email(), name: z.string().min(1), roles: z.array(z.string().min(1)).min(1), memberships: z.array(membershipSchema), grants: z.array(grantSchema), systemAdmin: z.boolean().optional(), managedScopes: z.array(z.object({ organizationCode: z.string().min(1), periodCode: z.string().min(1), divisionCode: z.null() })).optional() });

export type HostedAccess = z.infer<typeof contextSchema>;

export function parseHostedAccess(value: unknown, authUserId: string, email: string): HostedAccess | null {
  const parsed = contextSchema.safeParse(value);
  if (!parsed.success || parsed.data.authUserId !== authUserId || parsed.data.email.toLowerCase() !== email.toLowerCase()) return null;
  return parsed.data;
}

export function hasHostedPermission(access: HostedAccess, permission: Permission, scope: PermissionScope, at = Date.now()): boolean {
  if (!scope.organizationCode || !scope.periodCode) return false;
  if (access.systemAdmin === true && ["SYSTEM_CONFIGURATION_READ", "IDENTITY_READ", "IDENTITY_MANAGE"].includes(permission) && access.managedScopes?.some(item => item.organizationCode === scope.organizationCode && item.periodCode === scope.periodCode)) return true;
  return access.grants.some((grant) => access.memberships.some(item => item.organizationCode === grant.organizationCode && item.periodCode === grant.periodCode && (!grant.divisionCode || item.divisionCode === grant.divisionCode))
    && grant.permission === permission
    && grant.organizationCode === scope.organizationCode && grant.periodCode === scope.periodCode
    && (!grant.divisionCode || grant.divisionCode === scope.divisionCode)
    && (!grant.objectId || grant.objectId === scope.objectId)
    && (grant.expiresAt !== null && Date.parse(grant.expiresAt) > at));
}
