import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getLocalAspirationService } from "@/platform/intake/aspiration-service";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

const actionSchema = z.object({ caseId: z.string().regex(/^KPI-TST-[A-F0-9]{8}$/), action: z.enum(["START", "UPDATE", "CLOSE", "REOPEN"]), publicUpdate: z.string().trim().min(3).max(1_000), internalNote: z.string().trim().min(3).max(2_000) });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "ASPIRATION_TRIAGE", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = actionSchema.parse(await request.json());
    const service = getLocalAspirationService();
    if (service.getCaseDetail(input.caseId)?.periodCode !== testScope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const detail = service.advanceCase({ ...input, actorAccountId: identity.accountId });
    return detail ? Response.json({ detail }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
