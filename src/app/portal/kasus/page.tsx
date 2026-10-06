import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { CaseWorkspace } from "@/components/cases/case-workspace";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";
import {getHostedAuthConfiguration,getHostedIdentity} from "@/platform/identity/hosted-auth";
import {hostedScopes} from "@/platform/authorization/hosted-scopes";
import {HostedCaseWorkspace} from "@/components/cases/hosted-case-workspace";

import catalog from "@/platform/intake/case-sop-catalog.json";
import {CaseSopGuide} from "@/components/cases/case-sop-guide";

export default async function CasesPage(): Promise<React.JSX.Element> {
  if(getHostedAuthConfiguration()){
    const identity=await getHostedIdentity();
    if(!identity)return <div className="portal-shell"><h1>Masuk diperlukan</h1><Link href="/masuk">Masuk ke portal</Link></div>;
    const scopes=[...new Map(hostedScopes(identity,"CASE_READ").map(s=>[`${s.organizationCode}:${s.periodCode}`,s])).values()];
    return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Layanan dan kasus</p><h1>Penanganan laporan</h1><p>Sekretariat mencatat laporan; PIC melaksanakan penanganan, OIC I&O memeriksa pelaksanaan teknis, dan Ketua KPI memberi otorisasi serta keputusan sesuai kewenangan.</p></header><CaseSopGuide/>{scopes.length?<HostedCaseWorkspace scopes={scopes} accountId={identity.accountId} templates={catalog.forms}/>:<section className="operations-panel"><h2>Belum ada akses kasus untuk periode aktif</h2><p>Periode kepengurusan, penerima sekretariat, petugas IOD, dan hak akses resmi harus ditetapkan sebelum penanganan kasus dibuka.</p></section>}</div>;
  }
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Layanan & kasus</p><h1>Masuk diperlukan.</h1><p>Layanan kasus dan notifikasi hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "ASPIRATION_TRIAGE", scope)) return <PortalAccessDenied area="kasus" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">Kasus, komunikasi & notifikasi</p><span className="status-chip">Mode pratinjau</span></div><h1>Setiap laporan punya tindak lanjut.</h1><p>Triage, pembaruan yang aman, dan status antrean notifikasi dipisahkan agar pelapor memahami apa yang terjadi.</p></header><section className="portal-context" aria-label="Konteks kasus"><span>Akun</span><strong>{identity.email}</strong><span>Lingkungan</span><strong>Pratinjau lokal</strong></section><CaseWorkspace accountId={identity.accountId} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
