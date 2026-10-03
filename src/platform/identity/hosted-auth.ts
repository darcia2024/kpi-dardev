import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { parseHostedAccess, type HostedAccess } from "@/platform/authorization/hosted-access";

export type HostedIdentity = {
  accountId: string;
  email: string;
  name: string;
  roles: Array<"ADMIN_SISTEM" | "PENGURUS">;
};

export function getHostedAuthConfiguration(values = process.env): { url: string; key: string } | null {
  if (values.KPI_AUTH_PROVIDER !== "supabase" || values.KPI_APP_ENV === "local") return null;
  const url = values.KPI_SUPABASE_URL?.trim();
  const key = values.KPI_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) return null;
  try {
    if (new URL(url).protocol !== "https:") return null;
  } catch {
    return null;
  }
  return { url, key };
}

export async function createHostedAuthClient(): Promise<SupabaseClient | null> {
  const configuration = getHostedAuthConfiguration();
  if (!configuration) return null;
  const cookieStore = await cookies();
  return createServerClient(configuration.url, configuration.key, {
    cookieOptions: { httpOnly: true, secure: true, sameSite: "lax", path: "/" },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (items) => {
        try {
          for (const item of items) cookieStore.set(item.name, item.value, item.options);
        } catch {
          // Server Components cannot write cookies; Proxy refreshes the session.
        }
      }
    }
  });
}

export function hostedIdentityFromUser(user: User | null): HostedIdentity | null {
  if (!user?.email_confirmed_at || !user.email || user.app_metadata?.kpi_access !== true) return null;
  const role = user.app_metadata?.kpi_role;
  if (role !== "ADMIN_SISTEM" && role !== "PENGURUS") return null;
  return {
    accountId: user.id,
    email: user.email,
    name: typeof user.user_metadata?.display_name === "string" && user.user_metadata.display_name.trim()
      ? user.user_metadata.display_name.trim()
      : user.email,
    roles: role === "ADMIN_SISTEM" ? ["ADMIN_SISTEM", "PENGURUS"] : ["PENGURUS"]
  };
}

export async function resolveHostedAccess(client: SupabaseClient, user: User | null): Promise<HostedAccess | null> {
  if (!hostedIdentityFromUser(user) || !user?.email) return null;
  const { data, error } = await client.rpc("kpi_access_context");
  return error ? null : parseHostedAccess(data, user.id, user.email);
}

export async function getHostedIdentity(): Promise<HostedAccess | null> {
  try {
    const client = await createHostedAuthClient();
    if (!client) return null;
    const { data, error } = await client.auth.getUser();
    return error ? null : resolveHostedAccess(client, data.user);
  } catch {
    return null;
  }
}
