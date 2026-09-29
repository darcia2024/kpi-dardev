import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, listTestIdentities, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalInternalCommunicationService } from "@/platform/notifications/internal-communication-service";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("CREATE"), kind: z.enum(["ANNOUNCEMENT", "DIRECT"]), title: z.string().trim().min(3).max(180), body: z.string().trim().min(10).max(2000), recipientAccountIds: z.array(z.string().uuid()).min(1).max(20) }),
  z.object({ action: z.literal("SUBMIT"), id: z.string().uuid() }),
  z.object({ action: z.literal("APPROVE"), id: z.string().uuid() })
]);

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    const canTriage = hasTestPermission(identity, "ASPIRATION_TRIAGE", scope);
    const canReview = hasTestPermission(identity, "CONTENT_REVIEW", scope);
    if (!canTriage && !canReview) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const messages = getLocalInternalCommunicationService().listForOperator(scope.organizationCode, scope.periodCode).filter((message) => canTriage || message.kind === "ANNOUNCEMENT" && (message.status === "IN_REVIEW" || message.reviewerAccountId === identity.accountId));
    return Response.json({ messages, recipients: canTriage ? listTestIdentities().map(({ accountId, name }) => ({ accountId, name })) : [] }, { headers: { "x-request-id": requestId } });
  } catch { return errorResponse("INTERNAL_ERROR", requestId, 500); }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    const input = schema.parse(await request.json());
    const service = getLocalInternalCommunicationService();
    if (input.action === "CREATE") {
      if (!hasTestPermission(identity, "ASPIRATION_TRIAGE", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
      const known = new Set(listTestIdentities().map((account) => account.accountId));
      if (input.recipientAccountIds.some((id) => !known.has(id))) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
      const message = service.create({ kind: input.kind, title: input.title, body: input.body, recipientAccountIds: input.recipientAccountIds, authorAccountId: identity.accountId, ...scope });
      return Response.json({ message }, { status: 201, headers: { "x-request-id": requestId } });
    }
    if (input.action === "SUBMIT" && !hasTestPermission(identity, "ASPIRATION_TRIAGE", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    if (input.action === "SUBMIT") {
      const existing = service.get(input.id);
      if (!existing || existing.organizationCode !== scope.organizationCode || existing.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    }
    if (input.action === "APPROVE") {
      const existing = service.get(input.id);
      if (!existing || existing.organizationCode !== scope.organizationCode || existing.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
      const allowed = hasTestPermission(identity, "ASPIRATION_TRIAGE", scope) || existing.kind === "ANNOUNCEMENT" && hasTestPermission(identity, "CONTENT_REVIEW", scope);
      if (!allowed) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    }
    const message = input.action === "SUBMIT" ? service.submit(input.id, identity.accountId) : service.approveAndDeliver(input.id, identity.accountId);
    return message ? Response.json({ message }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 409);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError || error instanceof Error && error.message === "Invalid recipients.") return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("INTERNAL_ERROR", requestId, 500);
  }
}
