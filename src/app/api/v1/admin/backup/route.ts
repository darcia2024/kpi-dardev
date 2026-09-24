import { cookies } from "next/headers";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalBackupService } from "@/platform/governance/local-backup-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

export const runtime = "nodejs";

async function account(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return { requestId, error: errorResponse("TEST_AUTH_DISABLED", requestId, 503) };
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return { requestId, error: errorResponse("AUTHENTICATION_REQUIRED", requestId, 401) };
  if (!hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ")) return { requestId, error: errorResponse("AUTHORIZATION_DENIED", requestId, 403) };
  return { requestId, accountId: identity.accountId };
}

export async function GET(request: Request): Promise<Response> {
  const access = await account(request);
  if (access.error) return access.error;
  try { return Response.json({ runs: getLocalBackupService().list() }, { headers: { "x-request-id": access.requestId } }); }
  catch { return errorResponse("INTERNAL_ERROR", access.requestId, 500); }
}

export async function POST(request: Request): Promise<Response> {
  const access = await account(request);
  if (access.error || !access.accountId) return access.error ?? errorResponse("AUTHORIZATION_DENIED", access.requestId, 403);
  try { const run = await getLocalBackupService().createAndVerify(access.accountId); return Response.json({ run }, { status: 201, headers: { "x-request-id": access.requestId } }); }
  catch { return errorResponse("INTERNAL_ERROR", access.requestId, 500); }
}
