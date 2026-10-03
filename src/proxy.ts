import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getHostedAuthConfiguration } from "@/platform/identity/hosted-auth";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const configuration = getHostedAuthConfiguration();
  if (!configuration) return NextResponse.next({ request });
  const hostedRoutes = ["/portal/workspace", "/portal/keuangan", "/portal/evaluasi", "/portal/handover", "/portal/ai", "/portal/operasi", "/portal/katalog", "/portal/kebijakan", "/portal/profil", "/portal/akses", "/portal/tugas", "/portal/rapat", "/portal/dokumen", "/portal/notifikasi", "/portal/kasus", "/portal/editor", "/portal/knowledge", "/portal/pengaturan", "/portal/modul", "/portal/demo"];
  const moduleTarget = request.nextUrl.pathname.startsWith("/portal/") && !hostedRoutes.includes(request.nextUrl.pathname) ? request.nextUrl.clone() : null;
  if (moduleTarget) { moduleTarget.searchParams.set("module",request.nextUrl.pathname); moduleTarget.pathname="/portal/modul"; }
  const nextResponse = () => moduleTarget ? NextResponse.rewrite(moduleTarget,{ request }) : NextResponse.next({ request });
  let response = nextResponse();
  const client = createServerClient(configuration.url, configuration.key, {
    cookieOptions: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        for (const item of items) request.cookies.set(item.name, item.value);
        response = nextResponse();
        for (const item of items) response.cookies.set(item.name, item.value, item.options);
      }
    }
  });

  try {
    await client.auth.getClaims();
  } catch {
    return nextResponse();
  }
  return response;
}

export const config = {
  matcher: ["/masuk", "/portal/:path*", "/api/v1/auth/:path*", "/api/v1/work/:path*"]
};
