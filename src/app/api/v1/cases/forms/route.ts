import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalFormService } from "@/platform/intake/local-form-service";

const field = z.object({ key: z.string().regex(/^[a-z][a-z0-9_]{1,39}$/), label: z.string().trim().min(2).max(120), type: z.enum(["text", "email", "textarea"]), required: z.boolean() });
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("SAVE"), id: z.string().uuid().optional(), expectedVersion: z.number().int().positive().optional(), code: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80), title: z.string().trim().min(3).max(180), consentText: z.string().trim().min(20).max(1000), fields: z.array(field).min(1).max(12) }),
  z.object({ action: z.literal("VALIDATE"), id: z.string().uuid(), values: z.record(z.string(), z.string().max(2001)), consent: z.boolean() })
]);

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "ASPIRATION_TRIAGE", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ forms: getLocalFormService().list(scope.organizationCode, scope.periodCode) }, { headers: { "x-request-id": requestId } });
  } catch { return errorResponse("INTERNAL_ERROR", requestId, 500); }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "ASPIRATION_TRIAGE", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = schema.parse(await request.json());
    const service = getLocalFormService();
    if (input.action === "SAVE") {
      const form = service.save({ ...input, ...scope, authorAccountId: identity.accountId });
      return form ? Response.json({ form }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHENTICATION_INVALID", requestId, 409);
    }
    const form = service.get(input.id);
    if (!form || form.organizationCode !== scope.organizationCode || form.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const validation = service.validatePreview(input.id, input.values, input.consent);
    return Response.json({ validation }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("INTERNAL_ERROR", requestId, 500);
  }
}
