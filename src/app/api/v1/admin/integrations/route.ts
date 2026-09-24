import { cookies } from "next/headers";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getSupabaseIntegrationStatus } from "@/platform/config/integrations";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ")) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);

    return Response.json(
      { integrations: { database: getSupabaseIntegrationStatus(process.env), storage: "PENDING_DATABASE_CONNECTION" } },
      { headers: { "x-request-id": requestId } }
    );
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
