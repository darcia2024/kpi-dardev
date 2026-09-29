import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalTaskService } from "@/platform/work/task-service";

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "TASK_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const taskId = z.string().uuid().parse(new URL(request.url).searchParams.get("taskId"));
    const service = getLocalTaskService();
    const task = service.get(taskId);
    if (!task || task.organizationCode !== testScope.organizationCode || task.periodCode !== testScope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ comments: service.listComments(taskId) }, { headers: { "x-request-id": requestId, "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
