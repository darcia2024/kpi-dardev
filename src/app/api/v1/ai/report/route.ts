import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalAspirationService } from "@/platform/intake/aspiration-service";

const reportSchema = z.object({
  kind: z.enum(["PENGADUAN", "SARAN", "PERTANYAAN"]),
  subject: z.string().trim().min(3).max(180),
  description: z.string().trim().min(20).max(4_000),
  reviewed: z.literal(true),
  idempotencyKey: z.string().uuid()
});

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "AI_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = reportSchema.parse(await request.json());
    const result = getLocalAspirationService().submit({
      periodCode: scope.periodCode,
      kind: input.kind,
      subject: input.subject,
      description: input.description,
      idempotencyKey: input.idempotencyKey,
      source: "PORTAL_ASSISTANT",
      submittedByAccountId: identity.accountId
    });
    return Response.json({ caseId: result.tracking.caseId, trackingToken: result.trackingToken, status: result.tracking.status }, { status: result.created ? 201 : 200, headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
