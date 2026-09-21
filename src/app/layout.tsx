import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/ui/site-header";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "KPI PPMI Mesir | Menjaga Interaksi Masisir dengan Amanah",
  description: "Ruang resmi Komisi Peduli Interaksi PPMI Mesir untuk edukasi interaksi, informasi publik, dan aspirasi Masisir.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kpi-dardev.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "KPI PPMI Mesir | Menjaga Interaksi Masisir dengan Amanah",
    description: "Ruang resmi Komisi Peduli Interaksi PPMI Mesir untuk edukasi interaksi, informasi publik, dan aspirasi Masisir.",
    type: "website",
    locale: "id_ID",
    siteName: "KPI PPMI Mesir"
  },
  twitter: {
    card: "summary",
    title: "KPI PPMI Mesir | Menjaga Interaksi Masisir dengan Amanah",
    description: "Ruang resmi KPI PPMI Mesir untuk edukasi interaksi, informasi publik, dan aspirasi Masisir."
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>): React.JSX.Element {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={plusJakartaSans.variable}>
        <a className="skip-link" href="#main-content">Langsung ke isi</a>
        <SiteHeader />
        <main className="app-main" id="main-content">{children}</main>
      </body>
    </html>
  );
}
