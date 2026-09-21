import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { EvaluationWorkspace } from "@/components/evaluation/evaluation-workspace";

export default async function EvaluationPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">E01–E08 · K01–K04</p><h1>Masuk diperlukan.</h1><p>Evaluasi dan knowledge hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E09 · Evaluasi & knowledge</p><span className="status-chip">UI TEST</span></div><h1>Nilai dengan konteks, belajar dari sumber.</h1><p>Siklus kinerja, capaian, rubrik, koreksi, SOP, dan sitasi berada dalam ruang yang sama.</p></header><section className="portal-context" aria-label="Konteks evaluasi"><span>Akun</span><strong>{identity.email}</strong><span>Siklus</span><strong>TEST · belum dikunci</strong></section><EvaluationWorkspace /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
