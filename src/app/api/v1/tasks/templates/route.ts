import { z } from "zod";
import { errorResponse } from "@/platform/http/response";
import { portalRoute } from "@/platform/http/portal-route";
import { getLocalTaskTemplateService } from "@/platform/work/task-template-service";
import { getLocalTaskService } from "@/platform/work/task-service";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("CREATE"), title: z.string().trim().min(3).max(180) }),
  z.object({ action: z.literal("REVISE"), templateId: z.string().uuid(), title: z.string().trim().min(3).max(180) }),
  z.object({ action: z.literal("INSTANTIATE"), templateId: z.string().uuid(), ownerAccountId: z.string().uuid(), dueAt: z.iso.datetime().optional() })
]);

export async function GET(request: Request): Promise<Response> {
  return portalRoute(request, async (context, requestId) => {
    if (!context.can("TASK_READ")) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ templates: getLocalTaskTemplateService().list(context.scope.organizationCode, context.scope.periodCode) }, { headers: { "x-request-id": requestId } });
  });
}

export async function POST(request: Request): Promise<Response> {
  return portalRoute(request, async (context, requestId) => {
    if (!context.can("TASK_CREATE")) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    try {
      const input = schema.parse(await request.json());
      const templates = getLocalTaskTemplateService();
      if (input.action === "INSTANTIATE") {
        if (!(await context.isAssignableAccount(input.ownerAccountId))) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
        const task = templates.instantiate({ ...context.scope, templateId: input.templateId, ownerAccountId: input.ownerAccountId, createdByAccountId: context.identity.accountId, dueAt: input.dueAt }, getLocalTaskService());
        return task ? Response.json({ task }, { status: 201, headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 404);
      }
      const template = input.action === "CREATE"
        ? templates.create({ ...context.scope, title: input.title, createdByAccountId: context.identity.accountId })
        : templates.revise(input.templateId, context.identity.accountId, input.title);
      return template ? Response.json({ template }, { status: input.action === "CREATE" ? 201 : 200, headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    } catch (error) {
      if (error instanceof z.ZodError || error instanceof Error && (error.message.startsWith("Task ") || error.message.startsWith("Template "))) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
      throw error;
    }
  });
}
