import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { EvaluationWorkspace } from "@/components/evaluation/evaluation-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";

export default async function EvaluationPage(): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">E01–E08 · K01–K04</p><h1>Masuk diperlukan.</h1><p>Evaluasi dan knowledge hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
    if (!hasTestPermission(identity, "EVALUATION_READ", scope)) return <PortalAccessDenied area="evaluasi" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E09 · Evaluasi & knowledge</p><span className="status-chip">Penyimpanan lokal</span></div><h1>Nilai dengan konteks, belajar dari sumber.</h1><p>Peninjauan, sanggah, revisi, dan artikel knowledge tersimpan pada alur pratinjau.</p></header><section className="portal-context" aria-label="Konteks evaluasi"><span>Akun</span><strong>{identity.email}</strong><span>Siklus</span><strong>pratinjau · belum dikunci</strong></section><EvaluationWorkspace accountId={identity.accountId} canEvaluate={hasTestPermission(identity, "EVALUATION_WRITE", scope)} canWriteKnowledge={hasTestPermission(identity, "KNOWLEDGE_WRITE", scope)} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
