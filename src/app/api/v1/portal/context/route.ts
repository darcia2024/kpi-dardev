import { cookies } from "next/headers";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { createOrganizationRepository } from "@/platform/data/organization-repository";
import { getSelectedPreviewPeriod } from "@/platform/identity/preview-period-context";

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);

    const repository = createOrganizationRepository();
    const organization = await repository.getOrganizationByCode("KPI_TEST");
    if (!organization) return errorResponse("CONFIGURATION_INVALID", requestId, 503);
    const period = await getSelectedPreviewPeriod();
    if (!period || !hasTestPermission(identity, "WORKSPACE_READ", { organizationCode: organization.code, periodCode: period.code })) {
      return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    }

    return Response.json({ identity, organization, period }, { headers: { "x-request-id": requestId } });
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
