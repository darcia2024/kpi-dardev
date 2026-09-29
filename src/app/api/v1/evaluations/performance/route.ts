import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalPerformanceSheetService } from "@/platform/governance/performance-sheet-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, listTestIdentities, sessionCookieName } from "@/platform/identity/test-auth";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("CREATE_DRAFT") }),
  z.object({ action: z.literal("SET_INDICATOR"), schemeId: z.string().uuid(), indicatorId: z.string().uuid().optional(), name: z.string().trim().min(3).max(120), weightPercent: z.number().int().min(1).max(100) }),
  z.object({ action: z.literal("REMOVE_INDICATOR"), schemeId: z.string().uuid(), indicatorId: z.string().uuid() }),
  z.object({ action: z.literal("ACTIVATE"), schemeId: z.string().uuid() }),
  z.object({ action: z.literal("DECLARE_CONFLICT"), subjectAccountId: z.string().uuid(), reason: z.string().trim().min(5).max(500) }),
  z.object({ action: z.literal("ASSESS"), indicatorId: z.string().uuid(), subjectAccountId: z.string().uuid(), score: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.null()]), reason: z.string().trim().min(10).max(1_000), evidenceAssetIds: z.array(z.string().uuid()).max(10) })
]);

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "EVALUATION_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const service = getLocalPerformanceSheetService();
    const canWrite = hasTestPermission(identity, "EVALUATION_WRITE", scope);
    const schemes = service.schemesFor(scope.organizationCode, scope.periodCode);
    const active = schemes.find((scheme) => scheme.status === "ACTIVE") ?? null;
    const subjects = listTestIdentities().map(({ accountId, name }) => ({ accountId, name, conflict: service.hasConflict(scope.organizationCode, scope.periodCode, identity.accountId, accountId) }));
    // Evaluators see every subject; others only their own result.
    const summaries = active ? subjects.filter((subject) => canWrite || subject.accountId === identity.accountId).map((subject) => service.summarize(active, subject.accountId)) : [];
    return Response.json({ state: [{ active, draft: canWrite ? schemes.find((scheme) => scheme.status === "DRAFT") ?? null : null, subjects: canWrite ? subjects : [], summaries, myAssessments: active && canWrite ? service.assessmentsBy(active.id, identity.accountId) : [], myConflicts: service.conflictsFor(scope.organizationCode, scope.periodCode, identity.accountId) }] }, { headers: { "x-request-id": requestId, "Cache-Control": "private, no-store" } });
  } catch { return errorResponse("CONFIGURATION_INVALID", requestId, 503); }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "EVALUATION_WRITE", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = actionSchema.parse(await request.json());
    const service = getLocalPerformanceSheetService();
    const known = new Set(listTestIdentities().map((account) => account.accountId));
    const ownsScheme = (schemeId: string) => service.schemesFor(scope.organizationCode, scope.periodCode).some((scheme) => scheme.id === schemeId);
    if ("schemeId" in input && !ownsScheme(input.schemeId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    if ("subjectAccountId" in input && !known.has(input.subjectAccountId)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const result = input.action === "CREATE_DRAFT" ? service.createDraft(scope.organizationCode, scope.periodCode, identity.accountId)
      : input.action === "SET_INDICATOR" ? service.setIndicator(input.schemeId, identity.accountId, input)
      : input.action === "REMOVE_INDICATOR" ? service.removeIndicator(input.schemeId, identity.accountId, input.indicatorId)
      : input.action === "ACTIVATE" ? service.activate(input.schemeId, identity.accountId)
      : input.action === "DECLARE_CONFLICT" ? service.declareConflict({ ...scope, evaluatorAccountId: identity.accountId, subjectAccountId: input.subjectAccountId, reason: input.reason })
      : service.assess({ ...scope, indicatorId: input.indicatorId, subjectAccountId: input.subjectAccountId, evaluatorAccountId: identity.accountId, score: input.score, reason: input.reason, evidenceAssetIds: input.evidenceAssetIds });
    return result ? Response.json({ result }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
