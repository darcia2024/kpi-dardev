import Link from "next/link";
import { TaskWorkspace } from "@/components/tasks/task-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";
import { PortalNotReady } from "@/components/portal/portal-not-ready";
import { runInPortal } from "@/platform/identity/portal-context";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ task?: string | string[] }> }): Promise<React.JSX.Element> {
  const outcome = await runInPortal((context) => ({
    mode: context.mode,
    accountId: context.identity.accountId,
    canRead: context.can("TASK_READ"),
    canCreate: context.can("TASK_CREATE"),
    canSubmit: context.can("TASK_SUBMIT"),
    canReview: context.can("TASK_REVIEW")
  }));
  if (outcome.status === "NOT_READY") return <PortalNotReady area="Tugas" reason={outcome.reason} />;
  if (outcome.status !== "READY") return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Tugas</p><h1>Masuk diperlukan.</h1><p>Daftar tugas hanya dapat dibuka setelah Anda masuk ke portal.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  const page = outcome.value;
  if (!page.canRead) return <PortalAccessDenied area="tugas" />;
  const taskParam = (await searchParams).task;
  const initialTaskId = typeof taskParam === "string" && /^[0-9a-f-]{36}$/i.test(taskParam) ? taskParam : "";
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">Tugas & tindakan</p><span className="status-chip">{page.mode === "HOSTED" ? "Data KPI" : "Mode pratinjau"}</span></div><h1>Daftar tugas dan antrean review.</h1><p>Gunakan filter untuk memisahkan pekerjaan, hambatan, dan item yang membutuhkan keputusan.</p>{page.mode === "HOSTED" && <p>Pengajuan tugas dengan bukti file akan tersedia setelah penyimpanan dokumen selesai dipindahkan.</p>}</header><TaskWorkspace accountId={page.accountId} canCreate={page.canCreate} canSubmit={page.canSubmit} canReview={page.canReview} initialSelectedId={initialTaskId} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
