import { formatPreviewPeriodLabel } from "@/lib/period-label";
import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { HandoverWorkspace } from "@/components/operations/handover-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";

export default async function HandoverPage(): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">H01–H06 · A12–A16</p><h1>Masuk diperlukan.</h1><p>Handover dan operasi hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "HANDOVER_READ", scope)) return <PortalAccessDenied area="handover" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E10 · Handover & kesiapan operasi</p><span className="status-chip">Penyimpanan lokal</span></div><h1>Serah-terima yang bisa diperiksa.</h1><p>Paket pekerjaan dan penerimaan penerus dicatat dengan sumber yang dapat ditelusuri.</p></header><section className="portal-context" aria-label="Konteks handover"><span>Akun</span><strong>{identity.email}</strong><span>Periode</span><strong>{formatPreviewPeriodLabel(scope.periodCode)}</strong></section><HandoverWorkspace accountId={identity.accountId} canAccept={hasTestPermission(identity, "HANDOVER_ACCEPT", scope)} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
