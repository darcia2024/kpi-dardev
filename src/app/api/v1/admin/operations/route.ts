import { cookies } from "next/headers";
import { getLocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { queryBusinessAudit } from "@/platform/audit/audit-query";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getSupabaseIntegrationStatus } from "@/platform/config/integrations";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { z } from "zod";

const querySchema = z.object({ module: z.string().max(80).optional(), actor: z.string().uuid().optional(), entity: z.string().uuid().optional(), limit: z.coerce.number().int().min(1).max(500).default(100) });

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ")) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const params = new URL(request.url).searchParams;
    const query = querySchema.parse({ module: params.get("module") || undefined, actor: params.get("actor") || undefined, entity: params.get("entity") || undefined, limit: params.get("limit") || undefined });
    const events = queryBusinessAudit(getLocalBusinessAuditService().list(), query);
    return Response.json({ events, integrations: { databaseConfiguration: getSupabaseIntegrationStatus(process.env), storage: "NOT_CONNECTED", notificationProvider: "NOT_CONFIGURED", aiProvider: "NOT_CONFIGURED" } }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
