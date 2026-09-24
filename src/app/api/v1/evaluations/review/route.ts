import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalEvaluationKnowledgeService } from "@/platform/governance/evaluation-knowledge-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

const inputSchema = z.object({ evaluationId: z.string().uuid(), value: z.number().finite().nullable(), evidenceAssetIds: z.array(z.string().uuid()).max(20), reason: z.string().trim().min(10).max(500) });
export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "EVALUATION_WRITE", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = inputSchema.parse(await request.json());
    const service = getLocalEvaluationKnowledgeService();
    if (!service.listEvaluations().some((item) => item.id === input.evaluationId && item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode)) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const evaluation = service.reviewEvaluation(input.evaluationId, identity.accountId, input.value, input.evidenceAssetIds, input.reason);
    return evaluation ? Response.json({ evaluation }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
