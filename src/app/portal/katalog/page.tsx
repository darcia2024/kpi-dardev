import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { ScreenCatalog } from "@/components/catalog/screen-catalog";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";

export default async function CatalogPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Katalog cakupan</p><h1>Masuk diperlukan.</h1><p>Katalog internal hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ")) return <PortalAccessDenied area="katalog layar internal" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">Fase 0 · Katalog internal</p><span className="status-chip">Audit awal</span></div><h1>Setiap layar punya tujuan yang jelas.</h1><p>Registry 98 layar internal merinci fungsi, status implementasi, izin, API, dan kriteria selesai. Lima belas layar publik berada di cakupan terpisah.</p></header><ScreenCatalog /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
