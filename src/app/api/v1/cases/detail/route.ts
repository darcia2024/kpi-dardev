import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getLocalAspirationService } from "@/platform/intake/aspiration-service";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

const caseIdSchema = z.string().regex(/^KPI-TST-[A-F0-9]{8}$/);

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "ASPIRATION_TRIAGE", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const caseId = caseIdSchema.parse(new URL(request.url).searchParams.get("caseId"));
    const detail = getLocalAspirationService().getCaseDetail(caseId);
    return detail?.periodCode === testScope.periodCode ? Response.json({ detail }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 404);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
