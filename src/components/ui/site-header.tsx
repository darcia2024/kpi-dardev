"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IconArrowRight, IconArrowUpRight, IconChevronDown, IconMenu2, IconX } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavItem {
  href: string;
  label: string;
  hasDropdown?: boolean;
}

const landingNavLinks: NavItem[] = [
  { href: "/#tentang", label: "Tentang kami" },
  { href: "/#pencegahan", label: "Edukasi" },
  { href: "/#prosedur", label: "Alur Telaah" },
  { href: "/#prinsip", label: "Prinsip" },
  { href: "/publik/publikasi", label: "Publikasi" },
  { href: "/portal", label: "Portal", hasDropdown: true }
];

const defaultNavLinks: NavItem[] = [
  { href: "/", label: "Beranda" },
  { href: "/publik", label: "Informasi publik" },
  { href: "/masuk", label: "Login" },
  { href: "/portal", label: "Portal pengurus" }
];

export function SiteHeader(): React.JSX.Element {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cairoTime, setCairoTime] = useState("18:15 Kairo");
  const isLanding = pathname === "/";

  useEffect(() => {
    function updateClock() {
      try {
        const now = new Date();
        const str = new Intl.DateTimeFormat("id-ID", {
          timeZone: "Africa/Cairo",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }).format(now);
        setCairoTime(`${str} Kairo`);
      } catch {
        setCairoTime("18:15 Kairo");
      }
    }
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className={`site-header${isLanding ? " site-header--dexina" : ""}`}>
      <div className="site-header__container">
        
        {/* Brand Left */}
        <Link className="dexina-brand" href="/" aria-label="KPI PPMI Mesir, beranda">
          <span className="dexina-brand__logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-crimson-600">
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" />
            </svg>
          </span>
          <span className="dexina-brand__text">
            <strong>KPI PPMI Mesir</strong>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav aria-label="Navigasi utama" className={`dexina-nav${menuOpen ? " is-open" : ""}`} id="primary-navigation">
          {(isLanding ? landingNavLinks : defaultNavLinks).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="dexina-nav__link"
              onClick={() => setMenuOpen(false)}
            >
              <span>{item.label}</span>
              {item.hasDropdown ? (
                <IconChevronDown size={14} stroke={2.2} className="dexina-nav__chevron" />
              ) : null}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="dexina-actions">
          <div className="dexina-clock" title="Waktu resmi acuan Kairo (EET)">
            <span className="dexina-clock__dot" />
            <span>{cairoTime}</span>
          </div>

          <Link className="dexina-btn-primary" href="/publik/aspirasi">
            <span>Sampaikan aspirasi</span>
            <IconArrowRight size={15} stroke={2.4} />
          </Link>

          <div className="dexina-theme-wrap">
            <ThemeToggle />
          </div>

          <button
            aria-controls="primary-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Tutup navigasi" : "Buka navigasi"}
            className="dexina-menu-btn"
            onClick={() => setMenuOpen((c) => !c)}
            type="button"
          >
            {menuOpen ? <IconX size={20} stroke={2} /> : <IconMenu2 size={20} stroke={2} />}
          </button>
        </div>

      </div>
    </header>
  );
}
