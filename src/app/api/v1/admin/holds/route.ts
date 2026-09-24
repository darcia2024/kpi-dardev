import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalLegalHoldRepository } from "@/platform/governance/local-legal-hold";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("PLACE"), assetId: z.string().uuid(), reason: z.string().trim().min(10).max(500) }),
  z.object({ action: z.literal("RELEASE"), id: z.string().uuid(), reason: z.string().trim().min(10).max(500) })
]);

async function access(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return { requestId, error: errorResponse("TEST_AUTH_DISABLED", requestId, 503) };
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return { requestId, error: errorResponse("AUTHENTICATION_REQUIRED", requestId, 401) };
  if (!hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ")) return { requestId, error: errorResponse("AUTHORIZATION_DENIED", requestId, 403) };
  return { requestId, accountId: identity.accountId };
}

export async function GET(request: Request): Promise<Response> {
  const auth = await access(request);
  if (auth.error) return auth.error;
  try {
    const scope = await getSelectedPreviewScope();
    const assets = getLocalAssetRepository();
    const holds = getLocalLegalHoldRepository().list().filter((hold) => {
      const asset = assets.getVisible(hold.assetId, auth.accountId!);
      return asset?.organizationCode === scope.organizationCode && asset.periodCode === scope.periodCode;
    });
    return Response.json({ holds }, { headers: { "x-request-id": auth.requestId } });
  }
  catch { return errorResponse("INTERNAL_ERROR", auth.requestId, 500); }
}

export async function POST(request: Request): Promise<Response> {
  const auth = await access(request);
  if (auth.error || !auth.accountId) return auth.error ?? errorResponse("AUTHORIZATION_DENIED", auth.requestId, 403);
  try {
    const scope = await getSelectedPreviewScope();
    const input = schema.parse(await request.json());
    const repository = getLocalLegalHoldRepository();
    if (input.action === "PLACE") {
      const asset = getLocalAssetRepository().getVisible(input.assetId, auth.accountId);
      if (!asset || asset.organizationCode !== scope.organizationCode || asset.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", auth.requestId, 403);
      const hold = repository.place(input.assetId, input.reason, auth.accountId);
      return hold ? Response.json({ hold }, { status: 201, headers: { "x-request-id": auth.requestId } }) : errorResponse("AUTHENTICATION_INVALID", auth.requestId, 409);
    }
    const current = repository.list().find((hold) => hold.id === input.id);
    const asset = current ? getLocalAssetRepository().getVisible(current.assetId, auth.accountId) : null;
    if (!asset || asset.organizationCode !== scope.organizationCode || asset.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", auth.requestId, 403);
    const hold = repository.release(input.id, input.reason, auth.accountId);
    return hold ? Response.json({ hold }, { headers: { "x-request-id": auth.requestId } }) : errorResponse("AUTHENTICATION_INVALID", auth.requestId, 409);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return errorResponse("AUTHENTICATION_INVALID", auth.requestId, 400);
    return errorResponse("INTERNAL_ERROR", auth.requestId, 500);
  }
}
