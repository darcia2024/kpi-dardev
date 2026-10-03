import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { KnowledgeWorkspace } from "@/components/knowledge/knowledge-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import {getHostedAuthConfiguration} from "@/platform/identity/hosted-auth";
import {HostedContentPage} from "@/components/editor/hosted-content-page";

export default async function KnowledgePage(): Promise<React.JSX.Element> {
  if(getHostedAuthConfiguration()) return <HostedContentPage kind="KNOWLEDGE"/>;
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Rujukan</p><h1>Masuk diperlukan.</h1></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
    if (!hasTestPermission(identity, "KNOWLEDGE_READ", scope)) return <PortalAccessDenied area="knowledge" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">Rujukan</p><span className="status-chip">Rujukan berizin</span></div><h1>Rujukan yang bisa ditelusuri.</h1><p>Baca isi artikel, bagian rujukan, dan versi sumber sesuai izin akun. Setiap revisi melewati telaah sebelum terbit.</p></header><KnowledgeWorkspace accountId={identity.accountId} canWrite={hasTestPermission(identity, "KNOWLEDGE_WRITE", scope)} canReview={hasTestPermission(identity, "KNOWLEDGE_REVIEW", scope)} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
