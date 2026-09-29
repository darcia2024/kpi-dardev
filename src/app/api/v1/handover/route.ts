import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalHandoverService } from "@/platform/governance/handover-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
  const testScope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity || !hasTestPermission(identity, "HANDOVER_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  return Response.json({ items: getLocalHandoverService().list().filter((item) => item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode) }, { headers: { "x-request-id": requestId } });
}

const accountIds = ["00000000-0000-4000-8000-000000000101", "00000000-0000-4000-8000-000000000102"];
const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("CREATE"), title: z.string().trim().min(3).max(180), successorAccountId: z.string().uuid() }),
  z.object({ action: z.literal("ADD_ITEM"), handoverId: z.string().uuid(), title: z.string().trim().min(2).max(180), detail: z.string().trim().max(500).optional(), mandatory: z.boolean() }),
  z.object({ action: z.literal("ITEM_READY"), handoverId: z.string().uuid(), itemId: z.string().uuid(), response: z.string().trim().max(1_000).optional() }),
  z.object({ action: z.literal("ITEM_REVIEW"), handoverId: z.string().uuid(), itemId: z.string().uuid(), decision: z.enum(["ACCEPT", "CLARIFY"]), question: z.string().trim().max(1_000).optional() })
]);

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "HANDOVER_ACCEPT", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = actionSchema.parse(await request.json());
    const service = getLocalHandoverService();
    if (input.action === "CREATE") {
      if (!accountIds.includes(input.successorAccountId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
      const item = service.create({ ...scope, title: input.title, outgoingOwnerAccountId: identity.accountId, successorAccountId: input.successorAccountId });
      return item ? Response.json({ item }, { status: 201, headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    }
    const existing = service.get(input.handoverId);
    if (!existing || existing.organizationCode !== scope.organizationCode || existing.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const item = input.action === "ADD_ITEM" ? service.addItem(input.handoverId, identity.accountId, input)
      : input.action === "ITEM_READY" ? service.markItemReady(input.handoverId, identity.accountId, input.itemId, input.response)
      : service.reviewItem(input.handoverId, identity.accountId, input.itemId, input.decision, input.question);
    return item ? Response.json({ item }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
