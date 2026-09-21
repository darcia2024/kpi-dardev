import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { TaskWorkspace } from "@/components/tasks/task-workspace";

export default async function WorkspacePage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">W01–W05 · Workspace</p><h1>Masuk diperlukan.</h1><p>Workspace hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E05 · Workspace</p><span className="status-chip">UI TEST</span></div><h1>Ruang kerja yang mengutamakan tindakan.</h1><p>Ringkasan pekerjaan, deadline, hambatan, dan aktivitas yang relevan untuk akun TEST.</p></header><section className="portal-context" aria-label="Konteks workspace"><span>Akun</span><strong>{identity.email}</strong><span>Periode</span><strong>TEST · belum dipilih</strong></section><TaskWorkspace /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
