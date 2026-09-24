import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, listTestIdentities, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("GRANT"), id: z.string().uuid(), recipientAccountId: z.string().uuid(), expiresAt: z.iso.datetime() }),
  z.object({ action: z.literal("REVOKE"), id: z.string().uuid(), recipientAccountId: z.string().uuid() }),
  z.object({ action: z.literal("ARCHIVE"), id: z.string().uuid() })
]);

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "ASSET_UPLOAD", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = actionSchema.parse(await request.json());
    const repository = getLocalAssetRepository();
    const asset = repository.getVisible(input.id, identity.accountId);
    if (!asset || asset.ownerAccountId !== identity.accountId || asset.organizationCode !== scope.organizationCode || asset.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    if (input.action === "GRANT" && !listTestIdentities().some((candidate) => candidate.accountId === input.recipientAccountId)) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    const updated = input.action === "GRANT" ? await repository.grantDownload(input.id, input.recipientAccountId, identity.accountId, input.expiresAt)
      : input.action === "REVOKE" ? await repository.revokeDownload(input.id, input.recipientAccountId, identity.accountId)
        : await repository.archive(input.id, identity.accountId);
    if (!updated) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return Response.json({ asset: updated }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("INTERNAL_ERROR", requestId, 500);
  }
}
