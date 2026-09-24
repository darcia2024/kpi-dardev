import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalFinanceService } from "@/platform/governance/finance-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("SUBMIT"), recordId: z.string().uuid(), evidenceAssetId: z.string().uuid() }),
  z.object({ action: z.literal("APPROVE"), recordId: z.string().uuid(), approved: z.boolean(), reason: z.string().trim().min(3).max(500).optional() }).refine((value) => value.approved || Boolean(value.reason)),
  z.object({ action: z.literal("MARK_PAID"), recordId: z.string().uuid() }),
  z.object({ action: z.literal("RECONCILE"), recordId: z.string().uuid() })
]);

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    const input = actionSchema.parse(await request.json());
    const canSubmit = input.action === "SUBMIT" && hasTestPermission(identity, "FINANCE_READ", testScope);
    const canManage = input.action !== "SUBMIT" && hasTestPermission(identity, "FINANCE_MANAGE", testScope);
    if (!canSubmit && !canManage) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const service = getLocalFinanceService();
    if (!service.list().some((item) => item.id === input.recordId && item.organizationCode === testScope.organizationCode && item.periodCode === testScope.periodCode)) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const result = input.action === "SUBMIT" ? service.submit(input.recordId, identity.accountId, input.evidenceAssetId)
      : input.action === "APPROVE" ? service.approve(input.recordId, identity.accountId, input.approved, input.reason)
      : input.action === "MARK_PAID" ? service.markPaid(input.recordId, identity.accountId)
      : service.reconcile(input.recordId, identity.accountId);
    return result ? Response.json({ record: result }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
