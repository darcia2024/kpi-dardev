import { z } from "zod";
import { errorResponse } from "@/platform/http/response";
import { portalRoute } from "@/platform/http/portal-route";
import { getLocalTaskService } from "@/platform/work/task-service";

export async function GET(request: Request): Promise<Response> {
  return portalRoute(request, async (context, requestId) => {
    if (!context.can("TASK_READ")) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const parsed = z.string().uuid().safeParse(new URL(request.url).searchParams.get("taskId"));
    if (!parsed.success) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    const service = getLocalTaskService();
    const task = service.get(parsed.data);
    if (!task || task.organizationCode !== context.scope.organizationCode || task.periodCode !== context.scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ comments: service.listComments(parsed.data) }, { headers: { "x-request-id": requestId, "Cache-Control": "private, no-store" } });
  });
}
