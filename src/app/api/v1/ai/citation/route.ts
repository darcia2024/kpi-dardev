import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalTestAiService } from "@/platform/ai/test-ai-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

const query = z.object({ sourceAssetId: z.string().uuid(), version: z.coerce.number().int().positive() });

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "AI_READ", scope) || !hasTestPermission(identity, "ASSET_DOWNLOAD", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const url = new URL(request.url);
    const input = query.parse({ sourceAssetId: url.searchParams.get("sourceAssetId"), version: url.searchParams.get("version") });
    const citation = getLocalTestAiService().resolveCitation(input.sourceAssetId, input.version, identity.accountId, scope.organizationCode, scope.periodCode);
    return citation ? Response.json({ citation }, { headers: { "Cache-Control": "private, no-store", "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 404);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
