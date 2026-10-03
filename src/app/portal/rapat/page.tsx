import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { MeetingWorkspace } from "@/components/meetings/meeting-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";
import { getHostedAuthConfiguration, getHostedIdentity } from "@/platform/identity/hosted-auth";
import { hostedScopes } from "@/platform/authorization/hosted-scopes";
import { HostedMeetingWorkspace } from "@/components/meetings/hosted-meeting-workspace";

export default async function MeetingsPage({ searchParams }: { searchParams: Promise<{ meeting?: string | string[] }> }): Promise<React.JSX.Element> {
  if (getHostedAuthConfiguration()) {
    const identity = await getHostedIdentity();
    if (!identity) return <div className="portal-shell"><h1>Masuk diperlukan</h1><Link href="/masuk">Masuk ke portal</Link></div>;
    const scopes = hostedScopes(identity, "MEETING_READ");
    return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Rapat organisasi</p><h1>Rapat dan keputusan</h1><p>Undangan, kehadiran, voting dan notulen tersimpan dalam periode kepengurusan yang sesuai.</p></header>{scopes.length ? <HostedMeetingWorkspace identity={identity} scopes={scopes}/> : <section className="operations-panel"><h2>Periode atau izin rapat belum aktif</h2><p>Rapat memerlukan periode kerja aktif dan penugasan pengurus yang resmi.</p><Link href="/portal/pengaturan">Periksa organisasi dan periode</Link></section>}</div>;
  }
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Rapat</p><h1>Masuk diperlukan.</h1><p>Rapat hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "MEETING_READ", scope)) return <PortalAccessDenied area="rapat" />;
  const meetingParam = (await searchParams).meeting;
  const initialMeetingId = typeof meetingParam === "string" && /^[0-9a-f-]{36}$/i.test(meetingParam) ? meetingParam : "";
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">Rapat, voting & keputusan</p><span className="status-chip">Mode pratinjau</span></div><h1>Keputusan yang punya konteks.</h1><p>Notulen, voting, dan tindak lanjut tersimpan pada rapat yang sama.</p></header><section className="portal-context" aria-label="Konteks rapat"><span>Akun</span><strong>{identity.email}</strong><span>Zona waktu</span><strong>Africa/Cairo</strong></section><MeetingWorkspace accountId={identity.accountId} canManage={hasTestPermission(identity, "MEETING_MANAGE", scope)} initialSelectedId={initialMeetingId} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
