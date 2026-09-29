import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalTaskService } from "@/platform/work/task-service";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("SUBMIT"), taskId: z.string().uuid(), evidenceAssetId: z.string().uuid() }),
  z.object({ action: z.literal("REVIEW"), taskId: z.string().uuid(), accepted: z.boolean(), reason: z.string().trim().max(500).optional() }),
  z.object({ action: z.literal("EXTEND_DEADLINE"), taskId: z.string().uuid(), dueAt: z.iso.datetime(), reason: z.string().trim().min(3).max(500) }),
  z.object({ action: z.literal("DELEGATE"), taskId: z.string().uuid(), successorAccountId: z.string().uuid(), reason: z.string().trim().min(3).max(500) }),
  z.object({ action: z.enum(["CANCEL", "ARCHIVE"]), taskId: z.string().uuid(), reason: z.string().trim().min(3).max(500) })
]);

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    const input = actionSchema.parse(await request.json());
    const service = getLocalTaskService();
    const existing = service.get(input.taskId);
    if (!existing || existing.organizationCode !== testScope.organizationCode || existing.periodCode !== testScope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const task = input.action === "SUBMIT"
      ? hasTestPermission(identity, "TASK_SUBMIT", testScope) ? service.submit(input.taskId, identity.accountId, input.evidenceAssetId) : null
      : input.action === "REVIEW"
        ? hasTestPermission(identity, "TASK_REVIEW", testScope) ? service.review(input.taskId, identity.accountId, input.accepted, input.reason) : null
        : input.action === "EXTEND_DEADLINE"
          ? hasTestPermission(identity, "TASK_CREATE", testScope) ? service.extendDeadline(input.taskId, identity.accountId, input.dueAt, input.reason) : null
          : input.action === "DELEGATE"
            ? hasTestPermission(identity, "TASK_CREATE", testScope) && ["00000000-0000-4000-8000-000000000101", "00000000-0000-4000-8000-000000000102"].includes(input.successorAccountId) ? service.delegate(input.taskId, identity.accountId, input.successorAccountId, input.reason) : null
          : hasTestPermission(identity, "TASK_CREATE", testScope) ? service.close(input.taskId, identity.accountId, input.action, input.reason) : null;
    if (!task) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ task }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
