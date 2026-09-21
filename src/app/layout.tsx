import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "KPI PPMI Mesir",
  description: "Sistem Digital KPI PPMI Mesir"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): React.JSX.Element {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">Langsung ke isi</a>
        <header className="site-header">
          <div className="site-header__inner">
            <Link className="brand" href="/">
              <span aria-hidden="true" className="brand__mark">K</span>
              <span>
                <strong>KPI PPMI Mesir</strong>
                <small>Sistem Digital</small>
              </span>
            </Link>
            <nav aria-label="Navigasi utama" className="site-nav">
              <Link href="/">Beranda</Link>
              <Link href="/masuk">Masuk</Link>
              <Link href="/portal">Portal pengurus</Link>
            </nav>
            <ThemeToggle />
          </div>
        </header>
        <main className="app-main" id="main-content">{children}</main>
      </body>
    </html>
  );
}
