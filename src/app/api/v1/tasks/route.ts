import { z } from "zod";
import { errorResponse } from "@/platform/http/response";
import { portalRoute } from "@/platform/http/portal-route";
import { getLocalTaskService } from "@/platform/work/task-service";

const createSchema = z.object({ title: z.string().trim().min(3).max(180), ownerAccountId: z.string().uuid(), dependencyTaskIds: z.array(z.string().uuid()).max(20).optional(), dueAt: z.iso.datetime().optional() });

export async function GET(request: Request): Promise<Response> {
  return portalRoute(request, async (context, requestId) => {
    if (!context.can("TASK_READ")) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const { organizationCode, periodCode } = context.scope;
    return Response.json({ tasks: getLocalTaskService().list().filter((task) => task.organizationCode === organizationCode && task.periodCode === periodCode) }, { headers: { "x-request-id": requestId } });
  });
}

export async function POST(request: Request): Promise<Response> {
  return portalRoute(request, async (context, requestId) => {
    if (!context.can("TASK_CREATE")) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    try {
      const input = createSchema.parse(await request.json());
      if (!(await context.isAssignableAccount(input.ownerAccountId))) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
      const task = getLocalTaskService().create({ ...input, ...context.scope, createdByAccountId: context.identity.accountId });
      return Response.json({ task }, { status: 201, headers: { "x-request-id": requestId } });
    } catch (error) {
      if (error instanceof z.ZodError || error instanceof Error && error.message.startsWith("Task ")) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
      throw error;
    }
  });
}
