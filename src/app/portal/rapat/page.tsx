import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { MeetingWorkspace } from "@/components/meetings/meeting-workspace";

export default async function MeetingsPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">M01–M07 · Rapat</p><h1>Masuk diperlukan.</h1><p>Rapat hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E06 · Rapat, voting & keputusan</p><span className="status-chip">UI TEST</span></div><h1>Keputusan yang punya konteks.</h1><p>Kalender, agenda, kehadiran, notulen, voting, dan tindak lanjut dirangkai dalam satu alur yang bisa ditelusuri.</p></header><section className="portal-context" aria-label="Konteks rapat"><span>Akun</span><strong>{identity.email}</strong><span>Zona waktu</span><strong>Africa/Cairo</strong></section><MeetingWorkspace /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
