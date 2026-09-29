import { cookies } from "next/headers";
import { z } from "zod";
import { getLocalAuthorizationRepository } from "@/platform/authorization/local-authorization-repository";
import { hasTestPermission, permissions } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { listTestIdentities } from "@/platform/identity/test-auth";
import { getLocalDirectoryService } from "@/platform/identity/local-directory-service";

const scopeSchema = z.object({ organizationCode: z.string().trim().min(1).max(80).optional(), periodCode: z.string().trim().min(1).max(80).optional(), divisionCode: z.string().trim().min(1).max(80).optional(), objectId: z.string().uuid().optional() });
const createSchema = z.object({ action: z.literal("CREATE"), accountId: z.string().uuid(), permission: z.enum(permissions), scope: scopeSchema, expiresAt: z.string().datetime().optional() });
const activeSchema = z.object({ action: z.literal("SET_ACTIVE"), grantId: z.string().uuid(), active: z.boolean() });
const checkSchema = z.object({ action: z.literal("CHECK"), accountId: z.string().uuid(), permission: z.enum(permissions), scope: scopeSchema });
const inputSchema = z.discriminatedUnion("action", [createSchema, activeSchema, checkSchema]);

async function getAdmin(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return { requestId, response: errorResponse("TEST_AUTH_DISABLED", requestId, 503) };
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity || !hasTestPermission(identity, "IDENTITY_MANAGE")) return { requestId, response: errorResponse("AUTHORIZATION_DENIED", requestId, 403) };
  return { requestId, identity };
}

export async function GET(request: Request): Promise<Response> {
  const result = await getAdmin(request);
  if (result.response) return result.response;
  return Response.json({ grants: getLocalAuthorizationRepository().list(), periods: getLocalDirectoryService().listPeriods() }, { headers: { "x-request-id": result.requestId } });
}

export async function POST(request: Request): Promise<Response> {
  const result = await getAdmin(request);
  if (result.response) return result.response;
  try {
    const input = inputSchema.parse(await request.json());
    const repository = getLocalAuthorizationRepository();
    if (input.action === "CHECK") {
      const subject = listTestIdentities().find((item) => item.accountId === input.accountId);
      if (!subject) return errorResponse("AUTHORIZATION_DENIED", result.requestId, 404);
      return Response.json({ allowed: repository.has(subject, input.permission, input.scope), accountId: subject.accountId, permission: input.permission, scope: input.scope }, { headers: { "x-request-id": result.requestId } });
    }
    if (input.action === "CREATE" && (!listTestIdentities().some((item) => item.accountId === input.accountId) || input.scope.organizationCode !== "KPI_TEST" || !getLocalDirectoryService().listPeriods().some((item) => item.code === input.scope.periodCode && item.status !== "CLOSED"))) return errorResponse("AUTHORIZATION_DENIED", result.requestId, 403);
    const grant = input.action === "CREATE"
      ? repository.create({ accountId: input.accountId, permission: input.permission, ...input.scope, expiresAt: input.expiresAt, active: true, createdByAccountId: result.identity.accountId })
      : repository.setActive(input.grantId, input.active, result.identity.accountId);
    if (!grant) return errorResponse("AUTHORIZATION_DENIED", result.requestId, 404);
    return Response.json({ grant }, { headers: { "x-request-id": result.requestId } });
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", result.requestId, 400) : errorResponse("CONFIGURATION_INVALID", result.requestId, 503);
  }
}
