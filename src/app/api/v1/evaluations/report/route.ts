import { cookies } from "next/headers";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalEvaluationKnowledgeService } from "@/platform/governance/evaluation-knowledge-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity || !hasTestPermission(identity, "EVALUATION_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  const rows = getLocalEvaluationKnowledgeService().previewReport(scope.organizationCode, scope.periodCode, identity.accountId, hasTestPermission(identity, "EVALUATION_WRITE", scope));
  return Response.json({ rows, status: "PREVIEW_ONLY", periodCode: scope.periodCode }, { headers: { "x-request-id": requestId } });
}
