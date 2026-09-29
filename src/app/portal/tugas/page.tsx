import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { TaskWorkspace } from "@/components/tasks/task-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ task?: string | string[] }> }): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">T01–T11 · Tugas</p><h1>Masuk diperlukan.</h1><p>Daftar tugas hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
    if (!hasTestPermission(identity, "TASK_READ", scope)) return <PortalAccessDenied area="tugas" />;
  const taskParam = (await searchParams).task;
  const initialTaskId = typeof taskParam === "string" && /^[0-9a-f-]{36}$/i.test(taskParam) ? taskParam : "";
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E05 · Tugas & Action Required</p><span className="status-chip">Penyimpanan lokal</span></div><h1>Daftar tugas dan antrean review.</h1><p>Gunakan filter untuk memisahkan pekerjaan, hambatan, dan item yang membutuhkan keputusan.</p></header><TaskWorkspace accountId={identity.accountId} canCreate={hasTestPermission(identity, "TASK_CREATE", scope)} canSubmit={hasTestPermission(identity, "TASK_SUBMIT", scope)} canReview={hasTestPermission(identity, "TASK_REVIEW", scope)} initialSelectedId={initialTaskId} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
