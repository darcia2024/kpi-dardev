import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalHandoverService } from "@/platform/governance/handover-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

const schema = z.object({ handoverId: z.string().uuid() });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "HANDOVER_ACCEPT", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const { handoverId } = schema.parse(await request.json());
    const service = getLocalHandoverService();
    const record = service.list().find((item) => item.id === handoverId && item.organizationCode === scope.organizationCode && item.periodCode === scope.periodCode);
    if (!record) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const item = service.archive(handoverId, identity.accountId);
    return item ? Response.json({ item }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
