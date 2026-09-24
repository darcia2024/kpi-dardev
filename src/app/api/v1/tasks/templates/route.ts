import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalTaskTemplateService } from "@/platform/work/task-template-service";
import { getLocalTaskService } from "@/platform/work/task-service";

const ownerIds = ["00000000-0000-4000-8000-000000000101", "00000000-0000-4000-8000-000000000102"];
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("CREATE"), title: z.string().trim().min(3).max(180) }),
  z.object({ action: z.literal("REVISE"), templateId: z.string().uuid(), title: z.string().trim().min(3).max(180) }),
  z.object({ action: z.literal("INSTANTIATE"), templateId: z.string().uuid(), ownerAccountId: z.string().uuid(), dueAt: z.iso.datetime().optional() })
]);

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "TASK_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ templates: getLocalTaskTemplateService().list(scope.organizationCode, scope.periodCode) }, { headers: { "x-request-id": requestId } });
  } catch { return errorResponse("CONFIGURATION_INVALID", requestId, 503); }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "TASK_CREATE", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = schema.parse(await request.json());
    const templates = getLocalTaskTemplateService();
    if (input.action === "INSTANTIATE") {
      if (!ownerIds.includes(input.ownerAccountId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
      const task = templates.instantiate({ ...scope, templateId: input.templateId, ownerAccountId: input.ownerAccountId, createdByAccountId: identity.accountId, dueAt: input.dueAt }, getLocalTaskService());
      return task ? Response.json({ task }, { status: 201, headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    }
    const template = input.action === "CREATE"
      ? templates.create({ ...scope, title: input.title, createdByAccountId: identity.accountId })
      : templates.revise(input.templateId, identity.accountId, input.title);
    return template ? Response.json({ template }, { status: input.action === "CREATE" ? 201 : 200, headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error && (error.message.startsWith("Task ") || error.message.startsWith("Template "))) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
