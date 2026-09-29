import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getLocalDirectoryService } from "@/platform/identity/local-directory-service";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { previewPeriodCookieName } from "@/platform/identity/preview-period-context";

const inputSchema = z.object({ periodCode: z.string().trim().min(3).max(40) });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
  const cookieStore = await cookies();
  const identity = getTestSession(cookieStore.get(sessionCookieName)?.value);
  if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
  const period = getLocalDirectoryService().listPeriods().find((item) => item.code === parsed.data.periodCode && item.status !== "CLOSED");
  if (!period || !hasTestPermission(identity, "WORKSPACE_READ", { organizationCode: "KPI_TEST", periodCode: period.code })) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  cookieStore.set(previewPeriodCookieName, period.code, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return Response.json({ period }, { headers: { "x-request-id": requestId } });
}
