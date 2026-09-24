import { NextResponse } from "next/server";

export type ErrorCode =
  | "AUTHENTICATION_INVALID"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHORIZATION_DENIED"
  | "CONFIGURATION_INVALID"
  | "INTERNAL_ERROR"
  | "MFA_REQUIRED"
  | "SCANNER_UNAVAILABLE"
  | "TEST_AUTH_DISABLED";

export function errorResponse(code: ErrorCode, requestId: string, status: number): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        requestId
      }
    },
    {
      status,
      headers: { "x-request-id": requestId }
    }
  );
}
