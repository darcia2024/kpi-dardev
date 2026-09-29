import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalNoticeSettingsRepository } from "@/platform/notifications/settings-repository";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("PREFERENCE"), optionalInApp: z.boolean() }),
  z.object({ action: z.literal("TEMPLATE_DRAFT"), code: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80), locale: z.enum(["id", "en"]), title: z.string().trim().min(3).max(180), body: z.string().trim().min(10).max(2000) }),
  z.object({ action: z.literal("TEMPLATE_SUBMIT"), templateId: z.string().uuid() }),
  z.object({ action: z.literal("TEMPLATE_REVIEW"), templateId: z.string().uuid() })
]);

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "NOTIFICATION_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const repository = getLocalNoticeSettingsRepository();
    return Response.json({ preference: repository.getPreference(identity.accountId), templates: hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ", scope) || hasTestPermission(identity, "NOTIFICATION_TEMPLATE_REVIEW", scope) ? repository.listTemplates() : [] }, { headers: { "x-request-id": requestId } });
  } catch { return errorResponse("INTERNAL_ERROR", requestId, 500); }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "NOTIFICATION_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = actionSchema.parse(await request.json());
    const repository = getLocalNoticeSettingsRepository();
    if (input.action === "PREFERENCE") return Response.json({ preference: repository.savePreference(identity.accountId, input.optionalInApp) }, { headers: { "x-request-id": requestId } });
    if (input.action === "TEMPLATE_REVIEW") {
      if (!hasTestPermission(identity, "NOTIFICATION_TEMPLATE_REVIEW", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
      const template = repository.reviewTemplate(input.templateId, identity.accountId);
      return template ? Response.json({ template }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    }
    if (!hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    if (input.action === "TEMPLATE_SUBMIT") {
      const template = repository.submitTemplate(input.templateId, identity.accountId);
      return template ? Response.json({ template }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    }
    return Response.json({ template: repository.createTemplate({ code: input.code, locale: input.locale, title: input.title, body: input.body, authorAccountId: identity.accountId }) }, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("INTERNAL_ERROR", requestId, 500);
  }
}
