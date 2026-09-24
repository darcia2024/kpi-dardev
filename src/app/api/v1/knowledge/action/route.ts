import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalEvaluationKnowledgeService } from "@/platform/governance/evaluation-knowledge-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

const inputSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("CREATE"), title: z.string().trim().min(3).max(180), summary: z.string().trim().min(10).max(2_000), body: z.string().trim().min(30).max(20_000), sourceLocator: z.string().trim().min(2).max(240), sourceAssetId: z.string().uuid() }),
  z.object({ action: z.literal("CREATE_REVISION"), previousArticleId: z.string().uuid(), title: z.string().trim().min(3).max(180), summary: z.string().trim().min(10).max(2_000), body: z.string().trim().min(30).max(20_000), sourceLocator: z.string().trim().min(2).max(240), sourceAssetId: z.string().uuid() }),
  z.object({ action: z.literal("SUBMIT"), articleId: z.string().uuid() }),
  z.object({ action: z.literal("PUBLISH"), articleId: z.string().uuid() }),
  z.object({ action: z.literal("ARCHIVE"), articleId: z.string().uuid(), reason: z.string().trim().min(10).max(500) })
]);
export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = inputSchema.parse(await request.json());
    const requiredPermission = input.action === "PUBLISH" || input.action === "ARCHIVE" ? "KNOWLEDGE_REVIEW" : "KNOWLEDGE_WRITE";
    if (!hasTestPermission(identity, requiredPermission, testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const service = getLocalEvaluationKnowledgeService();
    if (input.action !== "CREATE" && !service.listArticles(true, identity.accountId).some((article) => article.id === (input.action === "CREATE_REVISION" ? input.previousArticleId : input.articleId) && article.organizationCode === testScope.organizationCode && article.periodCode === testScope.periodCode)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const article = input.action === "CREATE"
      ? service.createArticle({ organizationCode: testScope.organizationCode, periodCode: testScope.periodCode, title: input.title, summary: input.summary, body: input.body, sourceLocator: input.sourceLocator, sourceAssetId: input.sourceAssetId }, identity.accountId)
      : input.action === "CREATE_REVISION" ? service.createArticleRevision(input.previousArticleId, input, identity.accountId)
      : input.action === "SUBMIT" ? service.submitArticle(input.articleId, identity.accountId)
      : input.action === "PUBLISH" ? service.publishArticle(input.articleId, identity.accountId)
      : service.archiveArticle(input.articleId, identity.accountId, input.reason);
    return article ? Response.json({ article }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
