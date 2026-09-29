import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { EditorWorkspace } from "@/components/editor/editor-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";

export default async function EditorPage(): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">C01–C07 · CMS</p><h1>Masuk diperlukan.</h1><p>Editor hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
    if (!["CONTENT_DRAFT_WRITE", "CONTENT_REVIEW", "CONTENT_PUBLISH"].some((permission) => hasTestPermission(identity, permission as "CONTENT_DRAFT_WRITE" | "CONTENT_REVIEW" | "CONTENT_PUBLISH", scope))) return <PortalAccessDenied area="redaksi" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E04 · CMS editorial</p><span className="status-chip">Penyimpanan lokal</span></div><h1>Terbitkan dengan jejak.</h1><p>Draf, review, persetujuan, dan publikasi memakai transisi serta izin yang berbeda.</p></header><EditorWorkspace accountId={identity.accountId} canDraft={hasTestPermission(identity, "CONTENT_DRAFT_WRITE", scope)} canReview={hasTestPermission(identity, "CONTENT_REVIEW", scope)} canPublish={hasTestPermission(identity, "CONTENT_PUBLISH", scope)} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
