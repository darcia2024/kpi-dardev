import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { ScreenCatalog } from "@/components/catalog/screen-catalog";

export default async function CatalogPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Katalog cakupan</p><h1>Masuk diperlukan.</h1><p>Katalog internal hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">Baseline produk · 113 layar</p><span className="status-chip">Review TEST</span></div><h1>Satu indeks untuk seluruh cakupan.</h1><p>Setiap ID memiliki kelompok, fase utama, status UI, dan dependensi. Katalog ini menjadi dasar mapping requirement → task → tes → bukti.</p></header><ScreenCatalog /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
