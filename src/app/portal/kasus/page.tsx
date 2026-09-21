import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { CaseWorkspace } from "@/components/cases/case-workspace";

export default async function CasesPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">S01–S09 · N01–N04</p><h1>Masuk diperlukan.</h1><p>Layanan kasus dan notifikasi hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E07 · Kasus, komunikasi & notifikasi</p><span className="status-chip">UI TEST</span></div><h1>Setiap laporan punya tindak lanjut.</h1><p>Triage, pembaruan yang aman, dan status pengiriman dipisahkan agar pelapor memahami apa yang terjadi.</p></header><section className="portal-context" aria-label="Konteks kasus"><span>Akun</span><strong>{identity.email}</strong><span>Lingkungan</span><strong>Local TEST</strong></section><CaseWorkspace /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
