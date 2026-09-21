import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { TaskWorkspace } from "@/components/tasks/task-workspace";

export default async function TasksPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">T01–T11 · Tugas</p><h1>Masuk diperlukan.</h1><p>Daftar tugas hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E05 · Tugas & Action Required</p><span className="status-chip">UI TEST</span></div><h1>Daftar tugas dan antrean review.</h1><p>Gunakan filter untuk memisahkan pekerjaan, hambatan, dan item yang membutuhkan keputusan.</p></header><TaskWorkspace /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
