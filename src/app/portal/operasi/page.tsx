import Link from "next/link";
import { cookies } from "next/headers";
import { OperationsWorkspace } from "@/components/access/operations-workspace";
import { LegalHoldWorkspace } from "@/components/access/legal-hold-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";

export default async function OperationsPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">A12–A16 · Operasi</p><h1>Masuk diperlukan.</h1></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ")) return <PortalAccessDenied area="operasi sistem" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">A12–A16 · Operasi</p><span className="status-chip">Lokal pratinjau</span></div><h1>Status operasi & audit.</h1><p>Periksa kesiapan integrasi dan jejak perubahan tanpa menampilkan kredensial.</p></header><OperationsWorkspace /><LegalHoldWorkspace /><section className="state-panel state-panel--empty"><p className="state-panel__label">Keputusan yang belum tersedia</p><h2>Retensi dan backup produksi.</h2><p>Jadwal retensi, kewenangan hold, dan lokasi cadangan resmi membutuhkan keputusan KPI. Uji pemulihan lokal di atas belum menggantikan staging produksi.</p></section><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
