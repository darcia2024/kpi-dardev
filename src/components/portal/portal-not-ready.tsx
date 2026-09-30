import Link from "next/link";
import type { PortalNotReadyReason } from "@/platform/identity/portal-context";

const explanations: Record<PortalNotReadyReason, string> = {
  SERVICE_ROLE_MISSING: "Server belum diberi kunci layanan database, jadi data kerja belum dapat dibaca.",
  ORGANIZATION_MISSING: "Data organisasi KPI belum dibuat di database.",
  PERIOD_MISSING: "Belum ada periode kepengurusan yang aktif di database."
};

export function PortalNotReady({ area, reason }: { area: string; reason: PortalNotReadyReason }): React.JSX.Element {
  return <div className="portal-shell">
    <header className="page-heading"><p className="eyebrow">{area}</p><h1>Modul belum siap dipakai.</h1><p>{explanations[reason]} Hubungi pengelola sistem KPI.</p></header>
    <Link className="button button--quiet" href="/portal">Kembali ke portal</Link>
  </div>;
}
