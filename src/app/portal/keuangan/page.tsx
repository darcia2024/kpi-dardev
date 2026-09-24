import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { FinanceWorkspace } from "@/components/finance/finance-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";

export default async function FinancePage(): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">B01–B09 · Keuangan</p><h1>Masuk diperlukan.</h1><p>Modul keuangan hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "FINANCE_READ", scope)) return <PortalAccessDenied area="keuangan" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E08 · Keuangan & pertanggungjawaban</p><span className="status-chip">Penyimpanan lokal</span></div><h1>Setiap transaksi punya jejak.</h1><p>Pengajuan, approval, pembayaran, dan rekonsiliasi dicatat dalam alur yang memisahkan wewenang.</p></header><section className="portal-context" aria-label="Konteks keuangan"><span>Akun</span><strong>{identity.email}</strong><span>Periode</span><strong>pratinjau · belum dikunci</strong></section><FinanceWorkspace accountId={identity.accountId} canManage={hasTestPermission(identity, "FINANCE_MANAGE", scope)} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
