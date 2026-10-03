import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, listTestIdentities, sessionCookieName } from "@/platform/identity/test-auth";
import { DocumentWorkspace } from "@/components/documents/document-workspace";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";
import {getHostedAuthConfiguration,getHostedIdentity} from "@/platform/identity/hosted-auth";
import {hostedScopes} from "@/platform/authorization/hosted-scopes";
import {HostedDocumentWorkspace} from "@/components/documents/hosted-document-workspace";

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ document?: string | string[] }> }): Promise<React.JSX.Element> {
  if(getHostedAuthConfiguration()) {
    const identity=await getHostedIdentity();
    if(!identity)return <div className="portal-shell"><h1>Masuk diperlukan</h1><Link href="/masuk">Masuk ke portal</Link></div>;
    const scopes=hostedScopes(identity,"ASSET_READ");
    return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Dokumen organisasi</p><h1>Dokumen internal</h1><p>Upload private, pemeriksaan berkas, dan download sesuai izin dalam periode kepengurusan.</p></header>{scopes.length?<HostedDocumentWorkspace identity={identity} scopes={scopes}/>:<section className="operations-panel"><h2>Periode atau izin dokumen belum aktif</h2><p>Dokumen memerlukan periode aktif dan izin akses pengurus.</p><Link href="/portal/akses">Periksa hak akses</Link></section>}</div>;
  }
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Dokumen</p><h1>Masuk diperlukan.</h1><p>Pustaka dokumen hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "ASSET_READ", scope)) return <PortalAccessDenied area="dokumen" />;
  const canUpload = hasTestPermission(identity, "ASSET_UPLOAD", scope);
  const documentParam = (await searchParams).document;
  const initialDocumentId = typeof documentParam === "string" && /^[0-9a-f-]{36}$/i.test(documentParam) ? documentParam : "";
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">Dokumen dan layanan bersama</p><span className="status-chip">Mode pratinjau</span></div><h1>Dokumen yang punya konteks.</h1><p>Unggah dokumen secara privat, kelola penerima, dan telusuri audit. Pratinjau serta unduh menunggu pemeriksaan keamanan file.</p></header><section className="portal-context" aria-label="Konteks dokumen"><span>Akun</span><strong>{identity.email}</strong><span>Klasifikasi default</span><strong>Internal · pratinjau</strong></section><DocumentWorkspace canUpload={canUpload} accountId={identity.accountId} recipients={listTestIdentities().map(({ accountId, name }) => ({ accountId, name }))} initialSelectedId={initialDocumentId} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
