import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { HandoverWorkspace } from "@/components/operations/handover-workspace";

export default async function HandoverPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">H01–H06 · A12–A16</p><h1>Masuk diperlukan.</h1><p>Handover dan operasi hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E10 · Handover & kesiapan operasi</p><span className="status-chip">UI TEST</span></div><h1>Serah-terima yang bisa diperiksa.</h1><p>Paket pekerjaan, akses penerus, konfigurasi, backup, dan panduan operasi dikumpulkan dengan tanggung jawab yang jelas.</p></header><section className="portal-context" aria-label="Konteks handover"><span>Akun</span><strong>{identity.email}</strong><span>Periode</span><strong>TEST · closing preview</strong></section><HandoverWorkspace /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
