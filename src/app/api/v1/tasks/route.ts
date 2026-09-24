import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalTaskService } from "@/platform/work/task-service";

const createSchema = z.object({ title: z.string().trim().min(3).max(180), ownerAccountId: z.string().uuid(), dependencyTaskIds: z.array(z.string().uuid()).max(20).optional(), dueAt: z.iso.datetime().optional() });

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "TASK_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ tasks: getLocalTaskService().list().filter((task) => task.organizationCode === testScope.organizationCode && task.periodCode === testScope.periodCode) }, { headers: { "x-request-id": requestId } });
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "TASK_CREATE", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = createSchema.parse(await request.json());
    if (!["00000000-0000-4000-8000-000000000101", "00000000-0000-4000-8000-000000000102"].includes(input.ownerAccountId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const task = getLocalTaskService().create({ ...input, ...testScope, createdByAccountId: identity.accountId });
    return Response.json({ task }, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error && error.message.startsWith("Task ")) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
