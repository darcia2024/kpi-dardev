import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { hostedReadyDestinations, visiblePortalNavigation } from "@/lib/portal-navigation";
import { PortalFrame } from "@/components/portal/portal-frame";
import { getSelectedPreviewPeriod } from "@/platform/identity/preview-period-context";
import { getLocalDirectoryService } from "@/platform/identity/local-directory-service";
import { getHostedAuthConfiguration } from "@/platform/identity/hosted-auth";
import { runInPortal } from "@/platform/identity/portal-context";
import { SignOutButton } from "@/components/auth/sign-out-button";

function GuestBar({ children, signedIn }: { children: React.ReactNode; signedIn: boolean }): React.JSX.Element {
  return <div className="portal-guest"><div className="portal-guest__bar"><Link href="/">KPI PPMI Mesir</Link>{signedIn ? <SignOutButton /> : <Link href="/masuk">Masuk ke portal</Link>}</div>{children}</div>;
}

export default async function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  if (getHostedAuthConfiguration()) {
    const outcome = await runInPortal((context) => ({
      identity: { name: context.identity.name, email: context.identity.email },
      period: context.scope.periodCode,
      // Hosted accounts only see modules whose data already lives in the KPI database.
      navigation: visiblePortalNavigation((permission) => context.can(permission)).filter((item) => hostedReadyDestinations.has(item.href))
    }));
    if (outcome.status !== "READY") return <GuestBar signedIn={outcome.status === "NOT_READY"}>{children}</GuestBar>;
    const frame = outcome.value;
    // Period switching for hosted accounts arrives with the period module; the active period is shown alone.
    return <PortalFrame identity={frame.identity} navigation={frame.navigation} period={frame.period} periods={[{ code: frame.period, status: "ACTIVE" }]} canUseAssistant={false}>{children}</PortalFrame>;
  }
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <GuestBar signedIn={false}>{children}</GuestBar>;
  const period = await getSelectedPreviewPeriod();
  const scope = { organizationCode: "KPI_TEST", periodCode: period.code };
  const periods = getLocalDirectoryService().listPeriods().filter((item) =>
    item.code === period.code || (item.status !== "CLOSED" && hasTestPermission(identity, "WORKSPACE_READ", { organizationCode: "KPI_TEST", periodCode: item.code }))
  );
  const navigation = visiblePortalNavigation((permission) => hasTestPermission(identity, permission, scope));
  return <PortalFrame identity={{ name: identity.name, email: identity.email }} navigation={navigation} period={period.code} periods={periods.map((item) => ({ code: item.code, status: item.status }))} canUseAssistant={hasTestPermission(identity, "AI_READ", scope)}>{children}</PortalFrame>;
}
