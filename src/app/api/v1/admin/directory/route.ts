import { cookies } from "next/headers";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { loadDirectory } from "@/platform/identity/directory-service";
import { getLocalDirectoryService } from "@/platform/identity/local-directory-service";
import { getSupabaseConfiguration } from "@/platform/config/integrations";
import { z } from "zod";

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
  if (!hasTestPermission(identity, "IDENTITY_READ", { organizationCode: "KPI_TEST" }) && !hasTestPermission(identity, "IDENTITY_MANAGE", { organizationCode: "KPI_TEST" })) {
    return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  }
  try {
    const directory = await loadDirectory("KPI_TEST", process.env, getSupabaseConfiguration(process.env) ? undefined : getLocalDirectoryService());
    const accountId = new URL(request.url).searchParams.get("accountId");
    if (accountId && !directory.accounts.some((account) => account.id === accountId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const history = accountId && directory.source === "LOCAL_PREVIEW" ? getLocalDirectoryService().accountHistory(accountId) : [];
    return Response.json({ directory, history }, { headers: { "x-request-id": requestId } });
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}

const date = z.iso.date();
const inputSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("CREATE_PERIOD"), code: z.string().trim().min(3).max(40), startsOn: date, endsOn: date }),
  z.object({ action: z.literal("SET_PERIOD_STATUS"), periodId: z.string().uuid(), status: z.enum(["ACTIVE", "CLOSING", "CLOSED"]) }),
  z.object({ action: z.literal("CREATE_DIVISION"), code: z.string().trim().min(2).max(40), name: z.string().trim().min(3).max(120) }),
  z.object({ action: z.literal("CREATE_POSITION"), code: z.string().trim().min(2).max(40), name: z.string().trim().min(3).max(120), divisionId: z.string().uuid().optional() }),
  z.object({ action: z.literal("ASSIGN"), accountId: z.string().uuid(), positionId: z.string().uuid(), periodId: z.string().uuid(), startsOn: date, endsOn: date.optional() }),
  z.object({ action: z.literal("END_ASSIGNMENT"), assignmentId: z.string().uuid(), endsOn: date })
]);

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled() || getSupabaseConfiguration(process.env)) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
  if (!hasTestPermission(identity, "IDENTITY_MANAGE", { organizationCode: "KPI_TEST" })) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  try {
    const input = inputSchema.parse(await request.json());
    const directory = getLocalDirectoryService();
    const result = input.action === "CREATE_PERIOD" ? directory.createPeriod({ ...input, actorAccountId: identity.accountId })
      : input.action === "SET_PERIOD_STATUS" ? directory.transitionPeriod(input.periodId, input.status, identity.accountId)
        : input.action === "CREATE_DIVISION" ? directory.createDivision({ ...input, actorAccountId: identity.accountId })
        : input.action === "CREATE_POSITION" ? directory.createPosition({ ...input, actorAccountId: identity.accountId })
          : input.action === "ASSIGN" ? directory.assign({ ...input, actorAccountId: identity.accountId })
            : directory.endAssignment(input.assignmentId, input.endsOn, identity.accountId);
    return result ? Response.json({ result }, { status: input.action === "CREATE_PERIOD" || input.action === "CREATE_DIVISION" || input.action === "CREATE_POSITION" || input.action === "ASSIGN" ? 201 : 200, headers: { "x-request-id": requestId } }) : errorResponse("AUTHENTICATION_INVALID", requestId, 400);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
