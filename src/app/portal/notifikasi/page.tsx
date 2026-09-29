import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { InboxWorkspace } from "@/components/notifications/inbox-workspace";
import { NotificationSettingsWorkspace } from "@/components/notifications/settings-workspace";
import { InternalCommunicationsWorkspace } from "@/components/notifications/internal-communications-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";


export default async function NotificationsPage(): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Notifikasi</p><h1>Masuk diperlukan.</h1><p>Kotak masuk hanya tersedia bagi akun yang telah masuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "NOTIFICATION_READ", scope)) return <PortalAccessDenied area="notifikasi" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E07 · Komunikasi internal</p><span className="status-chip">Pratinjau lokal</span></div><h1>Kotak masuk</h1><p>Pemberitahuan yang berkaitan langsung dengan akun Anda. Penugasan dan pesan internal yang disetujui muncul di sini; kanal luar belum diaktifkan.</p></header><InboxWorkspace />{hasTestPermission(identity, "CONTENT_REVIEW", scope) ? <InternalCommunicationsWorkspace accountId={identity.accountId} canCreate={false} canReview /> : null}<NotificationSettingsWorkspace accountId={identity.accountId} canManageTemplates={hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ", scope)} canReviewTemplates={hasTestPermission(identity, "NOTIFICATION_TEMPLATE_REVIEW", scope)} /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
