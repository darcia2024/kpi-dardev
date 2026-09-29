import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalBudgetService } from "@/platform/governance/budget-service";
import { getLocalFinanceService } from "@/platform/governance/finance-service";
import { summarizeBudget } from "@/platform/governance/budget-service";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("CREATE_DRAFT") }),
  z.object({ action: z.literal("ADD_LINE"), planId: z.string().uuid(), expectedVersion: z.number().int().positive(), name: z.string().trim().min(3).max(160), amountMinor: z.number().int().positive().safe() }),
  z.object({ action: z.literal("UPDATE_LINE"), planId: z.string().uuid(), expectedVersion: z.number().int().positive(), lineId: z.string().uuid(), name: z.string().trim().min(3).max(160), amountMinor: z.number().int().positive().safe() }),
  z.object({ action: z.literal("APPROVE"), planId: z.string().uuid(), expectedVersion: z.number().int().positive() })
]);

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "FINANCE_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const plans = getLocalBudgetService().list(scope.organizationCode, scope.periodCode);
    const approved = plans.find((plan) => plan.state === "APPROVED");
    const usage = approved ? summarizeBudget(approved, getLocalFinanceService().list()) : [];
    return Response.json({ plans, usage }, { headers: { "x-request-id": requestId } });
  } catch { return errorResponse("CONFIGURATION_INVALID", requestId, 503); }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "FINANCE_MANAGE", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = schema.parse(await request.json());
    const service = getLocalBudgetService();
    if (input.action !== "CREATE_DRAFT" && !service.list(scope.organizationCode, scope.periodCode).some((plan) => plan.id === input.planId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const plan = input.action === "CREATE_DRAFT" ? service.create({ ...scope, createdByAccountId: identity.accountId })
      : input.action === "ADD_LINE" ? service.addLine(input.planId, identity.accountId, input.expectedVersion, input.name, input.amountMinor)
        : input.action === "UPDATE_LINE" ? service.updateLine(input.planId, identity.accountId, input.expectedVersion, input.lineId, input.name, input.amountMinor)
          : service.approve(input.planId, identity.accountId, input.expectedVersion);
    return plan ? Response.json({ plan }, { status: input.action === "CREATE_DRAFT" ? 201 : 200, headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error && error.message.startsWith("A budget ")) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
