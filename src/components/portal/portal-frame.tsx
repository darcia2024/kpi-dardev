"use client";
import {HostedFloatingAssistant} from "@/components/ai/hosted-floating-assistant";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  IconArticle, IconArrowsExchange, IconBell, IconBrain, IconCalendarEvent, IconChartBar,
  IconChecklist, IconChevronRight, IconFiles, IconHome2, IconLayoutDashboard,
  IconListDetails, IconLock, IconMenu2, IconSearch, IconShieldCheck, IconUserCircle, IconWallet, IconX
} from "@tabler/icons-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { FloatingReportAssistant } from "@/components/ai/floating-report-assistant";
import type { PortalNavigationItem } from "@/lib/portal-navigation";
import { formatPreviewPeriodLabel } from "@/lib/period-label";

const groupOrder = ["Beranda", "Pekerjaan", "Layanan", "Konten", "Tata kelola", "Admin"];
// Phone tab bar from the approved wireframes; only destinations this account can open are shown.
const bottomTabs: Array<{ href: string; label: string; icon: string }> = [
  { href: "/portal", label: "Beranda", icon: "home" },
  { href: "/portal/tugas", label: "Tugas", icon: "task" },
  { href: "/portal/rapat", label: "Rapat", icon: "meeting" },
  { href: "/portal/dokumen", label: "Dokumen", icon: "document" },
  { href: "/portal/profil", label: "Akun", icon: "account" }
];

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
    case "account": return <IconUserCircle {...props} />;
    default: return <IconListDetails {...props} />;
  }
}

export function PortalFrame({ children, identity, navigation, period, periods, canUseAssistant, assistant, hosted = false }: {
  children: React.ReactNode;
  identity: { name: string; email: string };
  navigation: PortalNavigationItem[];
  period: string;
  periods: { code: string; status: string }[];
  canUseAssistant: boolean;
  assistant?: React.ReactNode;
  hosted?: boolean;
}): React.JSX.Element {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [periodBusy, setPeriodBusy] = useState(false);
  const [periodError, setPeriodError] = useState("");
  const sidebar = useRef<HTMLElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebar.current?.querySelector<HTMLButtonElement>(".portal-sidebar__close")?.focus();
    const width = window.matchMedia("(min-width: 821px)");
    const closeOnDesktop = () => { if (width.matches) setMenuOpen(false); };
    width.addEventListener("change", closeOnDesktop);
    return () => {
      document.body.style.overflow = previousOverflow;
      width.removeEventListener("change", closeOnDesktop);
      menuTrigger.current?.focus();
    };
  }, [menuOpen]);
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
    {menuOpen ? <button tabIndex={-1} aria-label="Tutup navigasi portal" className="portal-frame__scrim" onClick={() => setMenuOpen(false)} type="button" /> : null}
    <aside ref={sidebar} role={menuOpen ? "dialog" : undefined} aria-modal={menuOpen ? true : undefined} aria-label="Menu portal" className={`portal-sidebar${menuOpen ? " is-open" : ""}`} id="portal-sidebar" onKeyDown={event => {
      if (!menuOpen || event.key !== "Tab") return;
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])')).filter(item => item.offsetParent !== null);
      const first = items[0]; const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>
      <div className="portal-sidebar__brand"><Link href="/portal" onClick={() => setMenuOpen(false)}><Image alt="" height={40} src="/brand/kpi-ppmi-mesir-logo.png" width={40} /><span><strong>KPI PPMI Mesir</strong><small>Portal pengurus</small></span></Link><button aria-label="Tutup menu" className="portal-sidebar__close" onClick={() => setMenuOpen(false)} type="button"><IconX size={20} /></button></div>
      <nav aria-label="Navigasi portal" className="portal-sidebar__nav">
        {groupOrder.map((group) => {
          const items = navigation.filter((item) => item.group === group);
          if (items.length === 0) return null;
          return <div className="portal-sidebar__group" key={group}><p>{group}</p>{items.map((item) => <Link aria-current={current?.href === item.href ? "page" : undefined} className={current?.href === item.href ? "is-current" : ""} href={item.href} key={item.href} onClick={() => setMenuOpen(false)}><NavigationIcon name={item.icon} /><span>{item.label}</span></Link>)}</div>;
        })}
      </nav>
      <div className="portal-sidebar__foot"><div><span className="portal-sidebar__avatar" aria-hidden="true">{identity.name.slice(0, 1)}</span><span><strong>{identity.name}</strong><small title={identity.email}>{identity.email}</small></span></div><div className="portal-sidebar__account-actions"><Link href="/" onClick={() => setMenuOpen(false)}>Situs publik</Link><SignOutButton/></div></div>
    </aside>
    <div className="portal-frame__content" inert={menuOpen || undefined}>
      <header className="portal-topbar">
        <div className="portal-topbar__left"><button ref={menuTrigger} aria-controls="portal-sidebar" aria-expanded={menuOpen} aria-label={menuOpen ? "Tutup menu portal" : "Buka menu portal"} className="portal-topbar__menu" onClick={() => setMenuOpen(!menuOpen)} type="button"><IconMenu2 size={22} /></button><nav aria-label="Lokasi halaman" className="portal-topbar__crumb"><Link href="/portal">Portal</Link>{current && current.href !== "/portal" ? <><IconChevronRight aria-hidden="true" size={15} /><span aria-current="page">{current.label}</span></> : null}</nav></div>
        <div className="portal-topbar__search" role="search"><IconSearch aria-hidden="true" size={18} /><label className="sr-only" htmlFor="portal-page-search">Cari halaman portal</label><input autoComplete="off" id="portal-page-search" onChange={(event) => setQuery(event.target.value)} placeholder="Cari halaman..." type="search" value={query} />{query ? <div aria-label="Hasil pencarian halaman" className="portal-topbar__results">{results.length ? results.map((item) => <Link href={item.href} key={item.href} onClick={() => setQuery("")}><NavigationIcon name={item.icon} /><span>{item.label}<small>{item.group}</small></span></Link>) : <p role="status">Halaman tidak ditemukan.</p>}</div> : null}</div>
        <div className="portal-topbar__right">{hosted ? <span className="portal-topbar__period" title={period || "Periode belum diatur"}>{period || "Periode belum diatur"}</span> : <label className="portal-topbar__period" title="Konteks data lokal pratinjau"><span className="sr-only">Periode kerja</span><select aria-label="Periode kerja" disabled={periodBusy} onChange={(event) => void changePeriod(event.target.value)} value={period}>{periods.map((item) => <option key={item.code} value={item.code}>{formatPreviewPeriodLabel(item.code)}</option>)}</select></label>}{periodError && <span role="alert">{periodError}</span>}<ThemeToggle /></div>
      </header>
      <div className="portal-frame__body">{children}</div>
    </div>
    <nav inert={menuOpen || undefined} aria-label="Navigasi cepat" className="portal-tabbar">{bottomTabs.filter((tab) => navigation.some((item) => item.href === tab.href)).map((tab) => {
      const active = tab.href === "/portal" ? pathname === "/portal" : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
      return <Link aria-current={active ? "page" : undefined} className={active ? "is-current" : ""} href={tab.href} key={tab.href}><NavigationIcon name={tab.icon} /><span>{tab.label}</span></Link>;
    })}</nav>
    {canUseAssistant && (hosted ? <HostedFloatingAssistant>{assistant}</HostedFloatingAssistant> : <FloatingReportAssistant />)}
  </div>;
}
