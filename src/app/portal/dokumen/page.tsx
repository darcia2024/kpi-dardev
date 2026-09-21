import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { DocumentWorkspace } from "@/components/documents/document-workspace";

export default async function DocumentsPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">F01–F06 · Dokumen</p><h1>Masuk diperlukan.</h1><p>Pustaka dokumen hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E03 · Dokumen dan layanan bersama</p><span className="status-chip">UI TEST</span></div><h1>Dokumen yang punya konteks.</h1><p>Pustaka, pemeriksaan, versi, dan akses berbagi ditampilkan sebagai satu alur yang dapat ditelusuri.</p></header><section className="portal-context" aria-label="Konteks dokumen"><span>Akun</span><strong>{identity.email}</strong><span>Klasifikasi default</span><strong>Internal · TEST</strong></section><DocumentWorkspace /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
