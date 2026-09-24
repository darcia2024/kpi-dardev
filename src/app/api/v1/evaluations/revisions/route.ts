import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalEvaluationKnowledgeService } from "@/platform/governance/evaluation-knowledge-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";


export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "EVALUATION_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const evaluationId = z.string().uuid().safeParse(new URL(request.url).searchParams.get("evaluationId"));
    if (!evaluationId.success) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    const service = getLocalEvaluationKnowledgeService();
    if (!service.listEvaluations().some((item) => item.id === evaluationId.data && item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode && (hasTestPermission(identity, "EVALUATION_WRITE", testScope) || item.subjectAccountId === identity.accountId))) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    return Response.json({ revisions: service.listRevisions(evaluationId.data) }, { headers: { "x-request-id": requestId } });
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
