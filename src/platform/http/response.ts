import { NextResponse } from "next/server";

export type ErrorCode = "CONFIGURATION_INVALID" | "INTERNAL_ERROR";

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
