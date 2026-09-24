import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { getLocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalTaskService } from "@/platform/work/task-service";
import { getLocalMeetingService } from "@/platform/work/meeting-service";
import { buildWorkspaceActivity } from "@/platform/work/workspace-activity";


export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "WORKSPACE_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);

    const tasks = hasTestPermission(identity, "TASK_READ", scope)
      ? getLocalTaskService().list().filter((task) => task.organizationCode === scope.organizationCode && task.periodCode === scope.periodCode && (task.ownerAccountId === identity.accountId || task.createdByAccountId === identity.accountId))
      : [];
    const meetings = hasTestPermission(identity, "MEETING_READ", scope)
      ? getLocalMeetingService().list().filter((meeting) => meeting.organizationCode === scope.organizationCode && meeting.periodCode === scope.periodCode && meeting.participantAccountIds.includes(identity.accountId))
      : [];
    const events = buildWorkspaceActivity(getLocalBusinessAuditService().list(), new Map(tasks.map((task) => [task.id, task.title])), new Map(meetings.map((meeting) => [meeting.id, meeting.title])), identity.accountId);
    return Response.json({ events }, { headers: { "x-request-id": requestId } });
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
