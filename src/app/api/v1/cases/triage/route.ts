import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getLocalAspirationService } from "@/platform/intake/aspiration-service";
import { getTestSession, isTestAuthEnabled, listTestIdentities, sessionCookieName } from "@/platform/identity/test-auth";

const triageSchema = z.object({ caseId: z.string().regex(/^KPI-TST-[A-F0-9]{8}$/), ownerAccountId: z.string().uuid(), urgency: z.enum(["LOW", "NORMAL", "HIGH"]), reason: z.string().trim().min(10).max(500), internalNote: z.string().trim().min(3).max(2_000), publicUpdate: z.string().trim().min(3).max(1_000), idempotencyKey: z.string().uuid() });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "ASPIRATION_TRIAGE", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = triageSchema.parse(await request.json());
    const service = getLocalAspirationService();
    if (service.getCaseDetail(input.caseId)?.periodCode !== testScope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const owner = listTestIdentities().find((candidate) => candidate.accountId === input.ownerAccountId);
    if (!owner || !hasTestPermission(owner, "ASPIRATION_TRIAGE", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const tracking = service.triage({ ...input, actorAccountId: identity.accountId });
    if (!tracking) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    return Response.json({ tracking }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
