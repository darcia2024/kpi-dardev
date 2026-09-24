import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getHostedAuthConfiguration } from "@/platform/identity/hosted-auth";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const configuration = getHostedAuthConfiguration();
  if (!configuration) return NextResponse.next({ request });
  if (request.nextUrl.pathname.startsWith("/portal/")) return NextResponse.redirect(new URL("/portal", request.url));

  let response = NextResponse.next({ request });
  const client = createServerClient(configuration.url, configuration.key, {
    cookieOptions: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        for (const item of items) request.cookies.set(item.name, item.value);
        response = NextResponse.next({ request });
        for (const item of items) response.cookies.set(item.name, item.value, item.options);
      }
    }
  });

  try {
    await client.auth.getClaims();
  } catch {
    return NextResponse.next({ request });
  }
  return response;
}

export const config = {
  matcher: ["/masuk", "/portal/:path*", "/api/v1/auth/:path*"]
};
