import { cookies } from "next/headers";
import { getSupabaseConfiguration } from "@/platform/config/integrations";
import { getLocalRecordDatabase } from "@/platform/data/local-record-store";
import { SupabaseOrganizationRepository, type OrganizationRecord, type PeriodRecord } from "@/platform/data/organization-repository";
import { withRecordTransaction } from "@/platform/data/record-transaction";
import { SupabaseRecordStore } from "@/platform/data/supabase-record-store";
import { createSupabaseRestClient, type SupabaseRestClient } from "@/platform/data/supabase-rest";
import { hasTestPermission, type Permission, type PermissionScope } from "@/platform/authorization/permissions";
import { LocalAuthorizationRepository } from "@/platform/authorization/local-authorization-repository";
import { hasProductionPermission } from "@/platform/authorization/production-authorization";
import { getHostedAuthConfiguration, getHostedIdentity } from "@/platform/identity/hosted-auth";
import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { listProductionAccounts, type PortalAccount } from "@/platform/identity/production-directory";
import { getTestSession, isTestAuthEnabled, listTestIdentities, sessionCookieName, type TestIdentity } from "@/platform/identity/test-auth";

export const portalPeriodCookieName = "kpi_portal_period";
export const defaultProductionOrganizationCode = "KPI_PPMI_MESIR";

export type PortalMode = "LOCAL_TEST" | "HOSTED";
export type PortalScope = { organizationCode: string; periodCode: string };
export type PortalNotReadyReason = "SERVICE_ROLE_MISSING" | "ORGANIZATION_MISSING" | "PERIOD_MISSING";

/** Everything a portal request may rely on, identical in local TEST and hosted mode. */
export type PortalContext = {
  mode: PortalMode;
  identity: TestIdentity;
  scope: PortalScope;
  periods: PeriodRecord[];
  can(permission: Permission, scope?: PermissionScope): boolean;
  listAssignableAccounts(): Promise<PortalAccount[]>;
  isAssignableAccount(accountId: string): Promise<boolean>;
};

export type PortalOutcome<T> =
  | { status: "READY"; value: T }
  | { status: "DISABLED" }
  | { status: "ANONYMOUS" }
  | { status: "NOT_READY"; reason: PortalNotReadyReason };

type ReadySession = {
  status: "READY";
  mode: PortalMode;
  identity: TestIdentity;
  scope: PortalScope;
  periods: PeriodRecord[];
  organizationId?: string;
  client?: SupabaseRestClient;
};
type PortalSession = Exclude<PortalOutcome<never>, { status: "READY" }> | ReadySession;

// Preview accounts that tasks may be assigned to (unchanged from the TEST routes).
const previewAssignableAccountIds = ["00000000-0000-4000-8000-000000000101", "00000000-0000-4000-8000-000000000102"];

export function productionOrganizationCode(values: Record<string, string | undefined> = process.env): string {
  return values.KPI_ORGANIZATION_CODE?.trim().toUpperCase() || defaultProductionOrganizationCode;
}

/** The requested period if it is still open, otherwise the active one, otherwise any open period. */
export function selectPortalPeriod(periods: PeriodRecord[], requestedCode?: string): PeriodRecord | undefined {
  const open = periods.filter((period) => period.status !== "CLOSED");
  return open.find((period) => period.code === requestedCode) ?? open.find((period) => period.status === "ACTIVE") ?? open[0];
}

// Organization and periods change rarely; a short cache saves two round trips per request.
const organizationCacheMs = 30_000;
let organizationCache: { code: string; expiresAt: number; organization: OrganizationRecord; periods: PeriodRecord[] } | undefined;

async function loadOrganization(client: SupabaseRestClient, code: string): Promise<{ organization: OrganizationRecord; periods: PeriodRecord[] } | null> {
  if (organizationCache && organizationCache.code === code && organizationCache.expiresAt > Date.now()) return organizationCache;
  const repository = new SupabaseOrganizationRepository(client);
  const organization = await repository.getOrganizationByCode(code);
  if (!organization) return null;
  const periods = await repository.getPeriods(organization.id);
  organizationCache = { code, expiresAt: Date.now() + organizationCacheMs, organization, periods };
  return organizationCache;
}

export async function resolvePortalSession(): Promise<PortalSession> {
  if (getHostedAuthConfiguration()) {
    const hosted = await getHostedIdentity();
    if (!hosted) return { status: "ANONYMOUS" };
    if (!getSupabaseConfiguration(process.env)) return { status: "NOT_READY", reason: "SERVICE_ROLE_MISSING" };
    const client = createSupabaseRestClient();
    const loaded = await loadOrganization(client, productionOrganizationCode());
    if (!loaded) return { status: "NOT_READY", reason: "ORGANIZATION_MISSING" };
    const period = selectPortalPeriod(loaded.periods, (await cookies()).get(portalPeriodCookieName)?.value);
    if (!period) return { status: "NOT_READY", reason: "PERIOD_MISSING" };
    return {
      status: "READY",
      mode: "HOSTED",
      identity: { accountId: hosted.accountId, email: hosted.email, name: hosted.name, roles: [...hosted.roles] },
      scope: { organizationCode: loaded.organization.code, periodCode: period.code },
      periods: loaded.periods,
      organizationId: loaded.organization.id,
      client
    };
  }
  if (!isTestAuthEnabled()) return { status: "DISABLED" };
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return { status: "ANONYMOUS" };
  return { status: "READY", mode: "LOCAL_TEST", identity, scope: await getSelectedPreviewScope(), periods: [] };
}

/**
 * Resolves who is asking and runs `fn` with the matching storage.
 * Hosted mode wraps `fn` in one record transaction: reads see the organization
 * snapshot and every write is committed atomically after `fn` returns.
 */
export async function runInPortal<T>(fn: (context: PortalContext) => Promise<T> | T, options: { include?: readonly string[] } = {}): Promise<PortalOutcome<T>> {
  const session = await resolvePortalSession();
  if (session.status !== "READY") return session;

  if (session.mode === "LOCAL_TEST") {
    const context: PortalContext = {
      mode: "LOCAL_TEST",
      identity: session.identity,
      scope: session.scope,
      periods: session.periods,
      can: (permission, scope = session.scope) => hasTestPermission(session.identity, permission, scope),
      listAssignableAccounts: async () => listTestIdentities()
        .filter((account) => previewAssignableAccountIds.includes(account.accountId))
        .map(({ accountId, email, name, roles }) => ({ accountId, email, name, roles })),
      isAssignableAccount: async (accountId) => previewAssignableAccountIds.includes(accountId)
    };
    return { status: "READY", value: await fn(context) };
  }

  const client = session.client!;
  const value = await withRecordTransaction(new SupabaseRecordStore(client), { organizationId: session.organizationId!, actorId: session.identity.accountId, include: options.include }, () => {
    const grants = new LocalAuthorizationRepository(getLocalRecordDatabase());
    let accounts: Promise<PortalAccount[]> | undefined;
    const listAssignableAccounts = () => (accounts ??= listProductionAccounts(client));
    const context: PortalContext = {
      mode: "HOSTED",
      identity: session.identity,
      scope: session.scope,
      periods: session.periods,
      can: (permission, scope = session.scope) => hasProductionPermission(session.identity, permission, scope, session.scope.organizationCode, grants),
      listAssignableAccounts,
      isAssignableAccount: async (accountId) => (await listAssignableAccounts()).some((account) => account.accountId === accountId)
    };
    return fn(context);
  });
  return { status: "READY", value };
}
