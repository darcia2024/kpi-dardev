import type { User } from "@supabase/supabase-js";
import type { SupabaseRestClient } from "@/platform/data/supabase-rest";
import { hostedIdentityFromUser } from "@/platform/identity/hosted-auth";
import type { Role } from "@/platform/identity/test-auth";

export type PortalAccount = { accountId: string; email: string; name: string; roles: Role[] };

const pageSize = 200;
const maxPages = 50;

/**
 * Accounts that may use the portal: verified email and kpi_access granted by an
 * administrator (see docs/35-HOSTED-LOGIN.md). Read from Supabase Auth with the
 * service role; never exposed to the browser beyond name and email.
 */
export async function listProductionAccounts(client: SupabaseRestClient): Promise<PortalAccount[]> {
  const accounts: PortalAccount[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const body = await client.authAdmin<{ users?: User[] }>(`users?page=${page}&per_page=${pageSize}`);
    const users = body.users ?? [];
    for (const user of users) {
      const identity = hostedIdentityFromUser(user);
      if (identity) accounts.push({ accountId: identity.accountId, email: identity.email, name: identity.name, roles: identity.roles });
    }
    if (users.length < pageSize) break;
  }
  return accounts.sort((left, right) => left.name.localeCompare(right.name, "id"));
}
