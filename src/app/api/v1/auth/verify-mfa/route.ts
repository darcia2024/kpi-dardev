import { NextResponse } from "next/server";
import { z } from "zod";
import { completeTestMfa, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";

const mfaSchema = z.object({ challengeId: z.string().uuid(), code: z.string().regex(/^\d{6}$/) });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const input = mfaSchema.parse(await request.json());
    const sessionId = completeTestMfa(input.challengeId, input.code);
    if (!sessionId) return errorResponse("AUTHENTICATION_INVALID", requestId, 401);
    const response = NextResponse.json({ next: "PORTAL" }, { headers: { "x-request-id": requestId } });
    response.cookies.set(sessionCookieName, sessionId, { httpOnly: true, sameSite: "lax", secure: false, path: "/", maxAge: 8 * 60 * 60 });
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
