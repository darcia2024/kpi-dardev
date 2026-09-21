import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { AiWorkspace } from "@/components/ai/ai-workspace";

export default async function AiPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">I01–I06 · AI</p><h1>Masuk diperlukan.</h1><p>AI terkendali hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E11 · AI terkendali</p><span className="status-chip">UI TEST · NONAKTIF</span></div><h1>AI yang menunjukkan sumbernya.</h1><p>Retrieval, sitasi, registry model, dan usulan tindakan ditampilkan dengan pemeriksaan izin serta konfirmasi manusia.</p></header><section className="portal-context" aria-label="Konteks AI"><span>Akun</span><strong>{identity.email}</strong><span>Data</span><strong>TEST · tidak dikirim</strong></section><AiWorkspace /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
