import { NextResponse } from "next/server";
import { z } from "zod";
import { isTestAuthEnabled, startTestSignIn } from "@/platform/identity/test-auth";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";

const signInSchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128) });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const input = signInSchema.parse(await request.json());
    const challengeId = startTestSignIn(input.email, input.password);
    if (!challengeId) return errorResponse("AUTHENTICATION_INVALID", requestId, 401);
    return NextResponse.json({ challengeId, next: "MFA" }, { status: 202, headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
