import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { MeetingWorkspace } from "@/components/meetings/meeting-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";

export default async function MeetingsPage({ searchParams }: { searchParams: Promise<{ meeting?: string | string[] }> }): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">M01–M07 · Rapat</p><h1>Masuk diperlukan.</h1><p>Rapat hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "MEETING_READ", scope)) return <PortalAccessDenied area="rapat" />;
  const meetingParam = (await searchParams).meeting;
  const initialMeetingId = typeof meetingParam === "string" && /^[0-9a-f-]{36}$/i.test(meetingParam) ? meetingParam : "";
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E06 · Rapat, voting & keputusan</p><span className="status-chip">Penyimpanan lokal</span></div><h1>Keputusan yang punya konteks.</h1><p>Notulen, voting, dan tindak lanjut tersimpan pada rapat yang sama.</p></header><section className="portal-context" aria-label="Konteks rapat"><span>Akun</span><strong>{identity.email}</strong><span>Zona waktu</span><strong>Africa/Cairo</strong></section><MeetingWorkspace accountId={identity.accountId} canManage={hasTestPermission(identity, "MEETING_MANAGE", scope)} initialSelectedId={initialMeetingId} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
