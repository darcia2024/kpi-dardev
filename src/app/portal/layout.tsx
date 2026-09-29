import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { visiblePortalNavigation } from "@/lib/portal-navigation";
import { PortalFrame } from "@/components/portal/portal-frame";
import { getSelectedPreviewPeriod } from "@/platform/identity/preview-period-context";
import { getLocalDirectoryService } from "@/platform/identity/local-directory-service";
import { getHostedAuthConfiguration, getHostedIdentity } from "@/platform/identity/hosted-auth";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function PortalLayout({ children }: Readonly<{ children: React.ReactNode }>): Promise<React.JSX.Element> {
  if (getHostedAuthConfiguration()) {
    const hostedIdentity = await getHostedIdentity();
    if (!hostedIdentity) return <div className="portal-guest"><div className="portal-guest__bar"><Link href="/">KPI PPMI Mesir</Link><Link href="/masuk">Masuk ke portal</Link></div>{children}</div>;
    return <div className="portal-guest"><div className="portal-guest__bar"><Link href="/">KPI PPMI Mesir</Link><SignOutButton /></div>{children}</div>;
  }
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-guest"><div className="portal-guest__bar"><Link href="/">KPI PPMI Mesir</Link><Link href="/masuk">Masuk ke portal</Link></div>{children}</div>;
  const period = await getSelectedPreviewPeriod();
  const scope = { organizationCode: "KPI_TEST", periodCode: period.code };
  const periods = getLocalDirectoryService().listPeriods().filter((item) =>
    item.code === period.code || (item.status !== "CLOSED" && hasTestPermission(identity, "WORKSPACE_READ", { organizationCode: "KPI_TEST", periodCode: item.code }))
  );
  const navigation = visiblePortalNavigation((permission) => hasTestPermission(identity, permission, scope));
  return <PortalFrame identity={{ name: identity.name, email: identity.email }} navigation={navigation} period={period.code} periods={periods.map((item) => ({ code: item.code, status: item.status }))} canUseAssistant={hasTestPermission(identity, "AI_READ", scope)}>{children}</PortalFrame>;
}
