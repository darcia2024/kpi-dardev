import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { TaskWorkspace } from "@/components/tasks/task-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";
import { getHostedAuthConfiguration, getHostedIdentity } from "@/platform/identity/hosted-auth";
import { hostedTaskScopes } from "@/platform/work/hosted-task-scopes";
import { HostedTaskWorkspace } from "@/components/tasks/hosted-task-workspace";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ task?: string | string[] }> }): Promise<React.JSX.Element> {
  if (getHostedAuthConfiguration()) {
    const identity = await getHostedIdentity();
    if (!identity) return <div className="portal-shell"><h1>Masuk diperlukan</h1><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
    const scopes = hostedTaskScopes(identity);
    return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Pekerjaan KPI</p><h1>Tugas dan review</h1><p>Catat pekerjaan, ajukan hasil, dan tinjau penyelesaiannya dalam periode aktif.</p></header>{scopes.length ? <HostedTaskWorkspace identity={identity} scopes={scopes} /> : <section className="operations-panel"><h2>{identity.systemAdmin ? "Siapkan periode kerja" : "Penugasan diperlukan"}</h2><p>{identity.systemAdmin ? "Izin pengelolaan admin sudah aktif. Masukkan periode kepengurusan resmi untuk mulai membuat dan mengelola tugas." : identity.memberships.length ? "Akun sudah memiliki penugasan, tetapi izin baca tugas belum diberikan." : "Belum ada penugasan pada periode aktif. Pengelola perlu mengisi periode, jabatan dan izin tugas sebelum pekerjaan dapat diakses."}</p><Link className="button button--quiet" href={identity.systemAdmin ? "/portal/pengaturan" : "/portal/akses"}>{identity.systemAdmin ? "Kelola organisasi dan periode" : "Periksa hak akses saya"}</Link></section>}<Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
  }
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Tugas</p><h1>Masuk diperlukan.</h1><p>Daftar tugas hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
    if (!hasTestPermission(identity, "TASK_READ", scope)) return <PortalAccessDenied area="tugas" />;
  const taskParam = (await searchParams).task;
  const initialTaskId = typeof taskParam === "string" && /^[0-9a-f-]{36}$/i.test(taskParam) ? taskParam : "";
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">Tugas & tindakan</p><span className="status-chip">Mode pratinjau</span></div><h1>Daftar tugas dan antrean review.</h1><p>Gunakan filter untuk memisahkan pekerjaan, hambatan, dan item yang membutuhkan keputusan.</p></header><TaskWorkspace accountId={identity.accountId} canCreate={hasTestPermission(identity, "TASK_CREATE", scope)} canSubmit={hasTestPermission(identity, "TASK_SUBMIT", scope)} canReview={hasTestPermission(identity, "TASK_REVIEW", scope)} initialSelectedId={initialTaskId} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
