import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalHandoverService } from "@/platform/governance/handover-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "HANDOVER_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const { handoverId } = z.object({ handoverId: z.string().uuid() }).parse({ handoverId: new URL(request.url).searchParams.get("handoverId") });
    const service = getLocalHandoverService();
    const item = service.list().find((candidate) => candidate.id === handoverId && candidate.organizationCode === scope.organizationCode && candidate.periodCode === scope.periodCode && (candidate.outgoingOwnerAccountId === identity.accountId || candidate.successorAccountId === identity.accountId));
    if (!item) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    return Response.json({ plan: service.accessPlan(handoverId) }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("INTERNAL_ERROR", requestId, 500);
  }
}
