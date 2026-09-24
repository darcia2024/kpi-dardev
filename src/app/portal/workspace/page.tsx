import { formatPreviewPeriodLabel } from "@/lib/period-label";
import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { WorkspaceOverview } from "@/components/tasks/workspace-overview";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";

export default async function WorkspacePage(): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">W01–W05 · Workspace</p><h1>Masuk diperlukan.</h1><p>Workspace hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
    if (!hasTestPermission(identity, "WORKSPACE_READ", scope)) return <PortalAccessDenied area="workspace" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E05 · Workspace</p><span className="status-chip">Penyimpanan lokal</span></div><h1>Ruang kerja yang mengutamakan tindakan.</h1><p>Ringkasan pekerjaan, hambatan, dan agenda yang relevan untuk akun pratinjau.</p></header><section className="portal-context" aria-label="Konteks workspace"><span>Akun</span><strong>{identity.email}</strong><span>Periode</span><strong>{formatPreviewPeriodLabel(scope.periodCode)}</strong></section><WorkspaceOverview accountId={identity.accountId} canReview={hasTestPermission(identity, "TASK_REVIEW", scope)} canSubmit={hasTestPermission(identity, "TASK_SUBMIT", scope)} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
