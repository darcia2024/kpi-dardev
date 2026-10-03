import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { getLocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { getLocalEvaluationKnowledgeService } from "@/platform/governance/evaluation-knowledge-service";
import { getLocalHandoverService } from "@/platform/governance/handover-service";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";
import { getLocalMeetingService } from "@/platform/work/meeting-service";
import { getLocalTaskService } from "@/platform/work/task-service";

const querySchema = z.object({ type: z.enum(["task", "meeting", "asset", "content", "knowledge", "handover"]), id: z.string().uuid() });

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    const url = new URL(request.url);
    const { type, id } = querySchema.parse({ type: url.searchParams.get("type"), id: url.searchParams.get("id") });
    const allowed = type === "handover"
      ? hasTestPermission(identity, "HANDOVER_READ", testScope) && getLocalHandoverService().list().some((item) => item.id === id && item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode)
      : type === "content"
      ? ["CONTENT_DRAFT_WRITE", "CONTENT_REVIEW", "CONTENT_PUBLISH"].some((permission) => hasTestPermission(identity, permission as "CONTENT_DRAFT_WRITE" | "CONTENT_REVIEW" | "CONTENT_PUBLISH", testScope)) && await (async () => { const record = await getLocalContentRepository().getById(id); return record?.organizationCode === testScope.organizationCode && record.periodCode === testScope.periodCode; })()
      : type === "knowledge"
        ? hasTestPermission(identity, "KNOWLEDGE_READ", testScope) && getLocalEvaluationKnowledgeService().listArticles(hasTestPermission(identity, "KNOWLEDGE_WRITE", testScope), identity.accountId).some((item) => item.id === id && item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode)
        : type === "task"
      ? hasTestPermission(identity, "TASK_READ", testScope) && (() => { const task = getLocalTaskService().get(id); return task?.organizationCode === testScope.organizationCode && task.periodCode === testScope.periodCode; })()
      : type === "meeting"
        ? hasTestPermission(identity, "MEETING_READ", testScope) && getLocalMeetingService().list().some((item) => item.id === id && item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode)
          : hasTestPermission(identity, "ASSET_DOWNLOAD", testScope) && (await getLocalAssetRepository().listVisible(identity.accountId)).some((item) => item.id === id && item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode);
    if (!allowed) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const events = getLocalBusinessAuditService().list(id).filter((event) => event.module === type);
    return Response.json({ events }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
