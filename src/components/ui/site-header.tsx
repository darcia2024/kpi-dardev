"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IconArrowUpRight, IconMenu2, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function SiteHeader(): React.JSX.Element | null {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isPortal = pathname.startsWith("/portal");
  const publicLinks = [["/", "Beranda"], ["/publik", "Tentang KPI"], ["/publik/divisi", "Divisi"], ["/publik/kegiatan", "Kegiatan"], ["/publik/publikasi", "Publikasi"], ["/publik/layanan", "Layanan"], ["/publik/pengaduan", "Pengaduan"]];

  if (isPortal) return null;

  return (
    <header className="kp-topbar" onKeyDown={(event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.getElementById("kp-menu-button")?.focus();
      }
    }}>
      <div className="kp-nav-inner">
        <Link href="/" className="kp-brand" aria-label="KPI PPMI Mesir, beranda">
          <Image src="/brand/kpi-ppmi-mesir-logo.png" alt="" width={44} height={44} priority />
          <span><strong>KPI PPMI Mesir</strong><small>Komisi Peduli Interaksi</small></span>
        </Link>
        <nav id="kp-navigation" className={`kp-nav${menuOpen ? " is-open" : ""}`} aria-label="Navigasi utama">
          {publicLinks.map(([href, label]) => <Link href={href} key={href} aria-current={pathname === href || (href === "/publik/divisi" && pathname.startsWith(`${href}/`)) ? "page" : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>)}
          <Link href="/masuk" className="kp-nav-login" onClick={() => setMenuOpen(false)}>Login <IconArrowUpRight size={16} aria-hidden="true" /></Link>
        </nav>
        <div className="kp-nav-controls">
          <ThemeToggle />
          <button id="kp-menu-button" className="kp-menu" type="button" aria-controls="kp-navigation" aria-expanded={menuOpen} aria-label={menuOpen ? "Tutup menu" : "Buka menu"} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <IconX size={22} aria-hidden="true" /> : <IconMenu2 size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );

}
