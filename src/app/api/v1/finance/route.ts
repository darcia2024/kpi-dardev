import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalFinanceService } from "@/platform/governance/finance-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";


export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
  const testScope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity || !hasTestPermission(identity, "FINANCE_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  return Response.json({ records: getLocalFinanceService().list().filter((record) => record.organizationCode === testScope.organizationCode && record.periodCode === testScope.periodCode) }, { headers: { "x-request-id": requestId } });
}

const createSchema = z.object({ title: z.string().trim().min(3).max(160), amountMinor: z.number().int().positive().safe(), currency: z.literal("TEST"), budgetLineId: z.string().uuid().optional() });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "FINANCE_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = createSchema.parse(await request.json());
    const record = getLocalFinanceService().create({ ...input, ...testScope, requesterAccountId: identity.accountId });
    return Response.json({ record }, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) {
    return error instanceof z.ZodError || error instanceof Error && error.message.startsWith("Budget line") ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
