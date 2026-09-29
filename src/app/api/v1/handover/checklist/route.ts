import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalHandoverChecklistService } from "@/platform/governance/handover-checklist-service";

const ownerIds = ["00000000-0000-4000-8000-000000000101", "00000000-0000-4000-8000-000000000102"];
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("CREATE"), title: z.string().trim().min(3).max(180), ownerAccountId: z.string().uuid(), dueAt: z.iso.datetime() }),
  z.object({ action: z.literal("COMPLETE"), itemId: z.string().uuid(), reason: z.string().trim().min(3).max(500) })
]);

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "HANDOVER_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ items: getLocalHandoverChecklistService().list(scope.organizationCode, scope.periodCode) }, { headers: { "x-request-id": requestId } });
  } catch { return errorResponse("CONFIGURATION_INVALID", requestId, 503); }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "HANDOVER_ACCEPT", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = schema.parse(await request.json());
    const service = getLocalHandoverChecklistService();
    if (input.action === "CREATE" && !ownerIds.includes(input.ownerAccountId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    if (input.action === "COMPLETE" && !service.list(scope.organizationCode, scope.periodCode).some((item) => item.id === input.itemId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const item = input.action === "CREATE"
      ? service.create({ ...scope, title: input.title, ownerAccountId: input.ownerAccountId, dueAt: input.dueAt, createdByAccountId: identity.accountId })
      : service.complete(input.itemId, identity.accountId, input.reason);
    return item ? Response.json({ item }, { status: input.action === "CREATE" ? 201 : 200, headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error && error.message.startsWith("Checklist ")) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
