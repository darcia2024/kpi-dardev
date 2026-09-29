import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalEvaluationKnowledgeService } from "@/platform/governance/evaluation-knowledge-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
  const testScope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity || !hasTestPermission(identity, "KNOWLEDGE_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  const includeNonPublished = hasTestPermission(identity, "KNOWLEDGE_WRITE", testScope) || hasTestPermission(identity, "KNOWLEDGE_REVIEW", testScope);
  return Response.json({ articles: getLocalEvaluationKnowledgeService().listArticles(includeNonPublished, identity.accountId).filter((article) => article.organizationCode === testScope.organizationCode && article.periodCode === testScope.periodCode) }, { headers: { "x-request-id": requestId } });
}
