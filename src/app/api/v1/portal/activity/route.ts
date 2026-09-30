import { z } from "zod";
import { getLocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { errorResponse } from "@/platform/http/response";
import { portalRoute } from "@/platform/http/portal-route";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { getLocalEvaluationKnowledgeService } from "@/platform/governance/evaluation-knowledge-service";
import { getLocalHandoverService } from "@/platform/governance/handover-service";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";
import { getLocalMeetingService } from "@/platform/work/meeting-service";
import { getLocalTaskService } from "@/platform/work/task-service";

const querySchema = z.object({ type: z.enum(["task", "meeting", "asset", "content", "knowledge", "handover"]), id: z.string().uuid() });

export async function GET(request: Request): Promise<Response> {
  return portalRoute(request, async (context, requestId) => {
    const url = new URL(request.url);
    const parsed = querySchema.safeParse({ type: url.searchParams.get("type"), id: url.searchParams.get("id") });
    if (!parsed.success) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    const { type, id } = parsed.data;
    const { organizationCode, periodCode } = context.scope;
    const inScope = (item: { organizationCode?: string; periodCode?: string } | null | undefined) => item?.organizationCode === organizationCode && item.periodCode === periodCode;
    const allowed = type === "handover"
      ? context.can("HANDOVER_READ") && getLocalHandoverService().list().some((item) => item.id === id && inScope(item))
      : type === "content"
        ? (["CONTENT_DRAFT_WRITE", "CONTENT_REVIEW", "CONTENT_PUBLISH"] as const).some((permission) => context.can(permission)) && inScope(await getLocalContentRepository().getById(id))
      : type === "knowledge"
        ? context.can("KNOWLEDGE_READ") && getLocalEvaluationKnowledgeService().listArticles(context.can("KNOWLEDGE_WRITE"), context.identity.accountId).some((item) => item.id === id && inScope(item))
      : type === "task"
        ? context.can("TASK_READ") && inScope(getLocalTaskService().get(id))
      : type === "meeting"
        ? context.can("MEETING_READ") && getLocalMeetingService().list().some((item) => item.id === id && inScope(item))
        : context.can("ASSET_DOWNLOAD") && (await getLocalAssetRepository().listVisible(context.identity.accountId)).some((item) => item.id === id && inScope(item));
    if (!allowed) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const events = getLocalBusinessAuditService().list(id).filter((event) => event.module === type);
    return Response.json({ events }, { headers: { "x-request-id": requestId } });
  }, { include: ["business-audit"] });
}
