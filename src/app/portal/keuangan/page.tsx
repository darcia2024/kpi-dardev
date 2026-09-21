import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { FinanceWorkspace } from "@/components/finance/finance-workspace";

export default async function FinancePage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">B01–B09 · Keuangan</p><h1>Masuk diperlukan.</h1><p>Modul keuangan hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E08 · Keuangan & pertanggungjawaban</p><span className="status-chip">UI TEST</span></div><h1>Setiap transaksi punya jejak.</h1><p>Anggaran, pengajuan, approval, pembayaran, dan rekonsiliasi disusun dalam satu alur yang menjaga pemisahan wewenang.</p></header><section className="portal-context" aria-label="Konteks keuangan"><span>Akun</span><strong>{identity.email}</strong><span>Periode</span><strong>TEST · belum dikunci</strong></section><FinanceWorkspace /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
