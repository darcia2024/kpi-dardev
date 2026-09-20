import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isTestAuthEnabled, revokeTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    revokeTestSession((await cookies()).get(sessionCookieName)?.value);
    const response = NextResponse.json({ status: "signed_out" }, { headers: { "x-request-id": requestId } });
    response.cookies.set(sessionCookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
