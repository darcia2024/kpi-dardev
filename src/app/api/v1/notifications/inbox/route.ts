import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { taskAssignmentNotices } from "@/platform/notifications/inbox-service";
import { getLocalTaskService } from "@/platform/work/task-service";
import { getLocalInboxRepository } from "@/platform/notifications/inbox-repository";
import { getLocalInternalCommunicationService } from "@/platform/notifications/internal-communication-service";
import { z } from "zod";


export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
  if (!hasTestPermission(identity, "NOTIFICATION_READ", scope)) {
    return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  }
  try {
    const receipts = getLocalInboxRepository();
    const tasks = hasTestPermission(identity, "TASK_READ", scope) ? taskAssignmentNotices(getLocalTaskService().list(), getLocalBusinessAuditService().list(), identity.accountId, scope.organizationCode, scope.periodCode) : [];
    const notices = [...tasks, ...getLocalInternalCommunicationService().inbox(identity.accountId, scope.organizationCode, scope.periodCode)]
      .map((notice) => ({ ...notice, readAt: receipts.get(identity.accountId, notice.id)?.readAt }));
    return Response.json({ notices }, { headers: { "x-request-id": requestId } });
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}

const markReadSchema = z.object({ action: z.literal("MARK_READ"), noticeId: z.string().regex(/^(task-assigned|message):[0-9a-f-]{36}$/i) });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
  if (!hasTestPermission(identity, "NOTIFICATION_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  try {
    const input = markReadSchema.parse(await request.json());
    const tasks = hasTestPermission(identity, "TASK_READ", scope) ? taskAssignmentNotices(getLocalTaskService().list(), getLocalBusinessAuditService().list(), identity.accountId, scope.organizationCode, scope.periodCode) : [];
    const visible = [...tasks, ...getLocalInternalCommunicationService().inbox(identity.accountId, scope.organizationCode, scope.periodCode)];
    if (!visible.some((notice) => notice.id === input.noticeId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const receipt = getLocalInboxRepository().markRead(identity.accountId, input.noticeId);
    return Response.json({ receipt }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
