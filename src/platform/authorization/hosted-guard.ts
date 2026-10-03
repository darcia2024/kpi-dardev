import type { Permission, PermissionScope } from "./permissions";
import { hasHostedPermission } from "./hosted-access";
import { getHostedIdentity } from "@/platform/identity/hosted-auth";
import { errorResponse } from "@/platform/http/response";

export async function requireHostedPermission(permission: Permission, scope: PermissionScope, requestId: string) {
  const identity = await getHostedIdentity();
  if (!identity) return { identity: null, response: errorResponse("AUTHENTICATION_REQUIRED", requestId, 401) };
  if (!hasHostedPermission(identity, permission, scope)) return { identity: null, response: errorResponse("AUTHORIZATION_DENIED", requestId, 403) };
  return { identity, response: null };
}
