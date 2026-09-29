"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconArticle, IconArrowsExchange, IconBell, IconBrain, IconCalendarEvent, IconChartBar,
  IconChecklist, IconChevronRight, IconFiles, IconHome2, IconLayoutDashboard,
  IconListDetails, IconLock, IconMenu2, IconSearch, IconShieldCheck, IconWallet, IconX
} from "@tabler/icons-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FloatingReportAssistant } from "@/components/ai/floating-report-assistant";
import type { PortalNavigationItem } from "@/lib/portal-navigation";
import { formatPreviewPeriodLabel } from "@/lib/period-label";

const groupOrder = ["Beranda", "Pekerjaan", "Layanan", "Konten", "Tata kelola", "Admin"];

function NavigationIcon({ name }: { name: string }): React.JSX.Element {
  const props = { size: 18, stroke: 1.7, "aria-hidden": true as const };
  switch (name) {
    case "home": return <IconHome2 {...props} />;
    case "workspace": return <IconLayoutDashboard {...props} />;
    case "task": return <IconChecklist {...props} />;
    case "meeting": return <IconCalendarEvent {...props} />;
    case "document": return <IconFiles {...props} />;
    case "case": return <IconShieldCheck {...props} />;
    case "notification": return <IconBell {...props} />;
    case "editor": return <IconArticle {...props} />;
    case "ai": return <IconBrain {...props} />;
    case "finance": return <IconWallet {...props} />;
    case "evaluation": return <IconChartBar {...props} />;
    case "handover": return <IconArrowsExchange {...props} />;
    case "access": return <IconLock {...props} />;
    default: return <IconListDetails {...props} />;
  }
}

export function PortalFrame({ children, identity, navigation, period, periods, canUseAssistant }: {
  children: React.ReactNode;
  identity: { name: string; email: string };
  navigation: PortalNavigationItem[];
  period: string;
  periods: { code: string; status: string }[];
  canUseAssistant: boolean;
}): React.JSX.Element {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [periodBusy, setPeriodBusy] = useState(false);
  const [periodError, setPeriodError] = useState("");
  async function changePeriod(periodCode: string): Promise<void> {
    setPeriodBusy(true); setPeriodError("");
    try {
      const response = await fetch("/api/v1/portal/period", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ periodCode }) });
      if (!response.ok) throw new Error("Periode tidak dapat dipilih. Periksa izin aksesnya.");
      window.location.reload();
    } catch (error) { setPeriodError(error instanceof Error ? error.message : "Gagal mengganti periode."); setPeriodBusy(false); }
  }
  useEffect(() => { setMenuOpen(false); setQuery(""); }, [pathname]);
  const current = navigation.find((item) => item.href === pathname) ?? navigation.find((item) => item.href !== "/portal" && pathname.startsWith(`${item.href}/`));
  const results = query.trim()
    ? navigation.filter((item) => `${item.label} ${item.group}`.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID")))
    : [];

  return <div className="portal-frame" onKeyDown={(event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
      setQuery("");
    }
  }}>
    {menuOpen ? <button aria-label="Tutup navigasi portal" className="portal-frame__scrim" onClick={() => setMenuOpen(false)} type="button" /> : null}
    <aside className={`portal-sidebar${menuOpen ? " is-open" : ""}`} id="portal-sidebar">
      <div className="portal-sidebar__brand"><Link href="/portal" onClick={() => setMenuOpen(false)}><Image alt="" height={40} src="/brand/kpi-ppmi-mesir-logo.png" width={40} /><span><strong>KPI PPMI Mesir</strong><small>Portal pengurus</small></span></Link><button aria-label="Tutup menu" className="portal-sidebar__close" onClick={() => setMenuOpen(false)} type="button"><IconX size={20} /></button></div>
      <nav aria-label="Navigasi portal" className="portal-sidebar__nav">
        {groupOrder.map((group) => {
          const items = navigation.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return <div className="portal-sidebar__group" key={group}><p>{group}</p>{items.map((item) => <Link aria-current={pathname === item.href ? "page" : undefined} className={pathname === item.href ? "is-current" : ""} href={item.href} key={item.href} onClick={() => setMenuOpen(false)}><NavigationIcon name={item.icon} /><span>{item.label}</span></Link>)}</div>;
        })}
      </nav>
      <div className="portal-sidebar__foot"><div><span className="portal-sidebar__avatar" aria-hidden="true">{identity.name.slice(0, 1)}</span><span><strong>{identity.name}</strong><small>{identity.email}</small></span></div><Link href="/" onClick={() => setMenuOpen(false)}>Lihat situs publik</Link></div>
    </aside>
    <div className="portal-frame__content">
      <header className="portal-topbar">
        <div className="portal-topbar__left"><button aria-controls="portal-sidebar" aria-expanded={menuOpen} aria-label={menuOpen ? "Tutup menu portal" : "Buka menu portal"} className="portal-topbar__menu" onClick={() => setMenuOpen(!menuOpen)} type="button"><IconMenu2 size={22} /></button><nav aria-label="Lokasi halaman" className="portal-topbar__crumb"><Link href="/portal">Portal</Link>{current && current.href !== "/portal" ? <><IconChevronRight aria-hidden="true" size={15} /><span aria-current="page">{current.label}</span></> : null}</nav></div>
        <div className="portal-topbar__search" role="search"><IconSearch aria-hidden="true" size={18} /><label className="sr-only" htmlFor="portal-page-search">Cari halaman portal</label><input autoComplete="off" id="portal-page-search" onChange={(event) => setQuery(event.target.value)} placeholder="Cari halaman..." type="search" value={query} />{query ? <div aria-label="Hasil pencarian halaman" className="portal-topbar__results">{results.length ? results.map((item) => <Link href={item.href} key={item.href} onClick={() => setQuery("")}><NavigationIcon name={item.icon} /><span>{item.label}<small>{item.group}</small></span></Link>) : <p role="status">Halaman tidak ditemukan.</p>}</div> : null}</div>
        <div className="portal-topbar__right"><label className="portal-topbar__period" title="Konteks data lokal pratinjau"><span className="sr-only">Periode kerja</span><select aria-label="Periode kerja" disabled={periodBusy} onChange={(event) => void changePeriod(event.target.value)} value={period}>{periods.map((item) => <option key={item.code} value={item.code}>{formatPreviewPeriodLabel(item.code)}</option>)}</select></label>{periodError && <span role="alert">{periodError}</span>}<ThemeToggle /></div>
      </header>
      <div className="portal-frame__body">{children}</div>
    </div>
    {canUseAssistant && <FloatingReportAssistant />}
  </div>;
}
