import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";
import { createHostedAuthClient, getHostedAuthConfiguration } from "@/platform/identity/hosted-auth";
import { getLocalPasswordRecovery, passwordProblems } from "@/platform/identity/password-recovery";
import { findTestIdentityByEmail, isTestAuthEnabled } from "@/platform/identity/test-auth";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("REQUEST"), email: z.string().trim().email().max(254) }),
  z.object({ action: z.literal("RESET"), token: z.string().min(16).max(200), password: z.string().min(1).max(128) })
]);

// Same answer whether or not the email exists, so the form cannot be used to discover accounts.
const requestAccepted = "Jika email terdaftar, tautan pemulihan telah dikirim. Tautan berlaku 30 menit.";

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  const headers = { "x-request-id": requestId, "Cache-Control": "no-store" };
  try {
    const input = schema.parse(await request.json());
    if (input.action === "RESET" && passwordProblems(input.password).length) return errorResponse("AUTHENTICATION_INVALID", requestId, 422);

    if (getHostedAuthConfiguration()) {
      const client = await createHostedAuthClient();
      if (!client) return errorResponse("CONFIGURATION_INVALID", requestId, 503);
      if (input.action === "REQUEST") {
        await client.auth.resetPasswordForEmail(input.email, { redirectTo: new URL("/masuk/atur-ulang", request.url).toString() });
        return NextResponse.json({ message: requestAccepted }, { status: 202, headers });
      }
      // The recovery link carries a PKCE code; exchanging it opens a short recovery session.
      const exchanged = await client.auth.exchangeCodeForSession(input.token);
      if (exchanged.error) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
      const updated = await client.auth.updateUser({ password: input.password });
      if (updated.error) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
      await client.auth.signOut({ scope: "global" });
      return NextResponse.json({ next: "SIGN_IN" }, { headers });
    }

    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const recovery = getLocalPasswordRecovery();
    if (input.action === "REQUEST") {
      const account = findTestIdentityByEmail(input.email);
      const token = account ? recovery.request(account.accountId) : null;
      // No email channel exists locally, so the preview shows the link it would have sent.
      return NextResponse.json({ message: requestAccepted, ...(token ? { previewLink: `/masuk/atur-ulang?token=${token}` } : {}) }, { status: 202, headers });
    }
    const result = recovery.reset(input.token, input.password);
    if ("error" in result) return errorResponse("AUTHENTICATION_INVALID", requestId, result.error === "PASSWORD_WEAK" ? 422 : 400);
    return NextResponse.json({ next: "SIGN_IN" }, { headers });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
