import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalEvaluationKnowledgeService } from "@/platform/governance/evaluation-knowledge-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

const submitSchema = z.object({ action: z.literal("SUBMIT"), evaluationId: z.string().uuid(), reason: z.string().trim().min(10).max(1_000) });
const resolveSchema = z.object({
  action: z.literal("RESOLVE"),
  appealId: z.string().uuid(),
  resolution: z.string().trim().min(10).max(1_000),
  correction: z.object({ value: z.number().finite().nullable(), evidenceAssetIds: z.array(z.string().uuid()).max(20), reason: z.string().trim().min(3).max(500) }).optional()
});
const inputSchema = z.discriminatedUnion("action", [submitSchema, resolveSchema]);

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "EVALUATION_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const canReview = hasTestPermission(identity, "EVALUATION_WRITE", testScope);
    const service = getLocalEvaluationKnowledgeService();
    const visibleIds = new Set(service.listEvaluations().filter((item) => item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode && (canReview || item.subjectAccountId === identity.accountId)).map((item) => item.id));
    return Response.json({ appeals: service.listAppeals(identity.accountId, canReview).filter((item) => visibleIds.has(item.evaluationId)) }, { headers: { "x-request-id": requestId } });
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "EVALUATION_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = inputSchema.parse(await request.json());
    const service = getLocalEvaluationKnowledgeService();
    if (input.action === "SUBMIT") {
      if (!service.listEvaluations().some((item) => item.id === input.evaluationId && item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode && item.subjectAccountId === identity.accountId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
      const appeal = service.submitAppeal(input.evaluationId, identity.accountId, input.reason);
      return appeal ? Response.json({ appeal }, { status: 201, headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    }
    if (!hasTestPermission(identity, "EVALUATION_WRITE", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const existing = service.listAppeals(identity.accountId, true).find((item) => item.id === input.appealId);
    if (!existing || !service.listEvaluations().some((item) => item.id === existing.evaluationId && item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode)) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const appeal = service.resolveAppeal({ appealId: input.appealId, reviewerAccountId: identity.accountId, resolution: input.resolution, correction: input.correction });
    return appeal ? Response.json({ appeal }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
