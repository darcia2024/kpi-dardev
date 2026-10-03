import Link from "next/link";
import { redirect } from "next/navigation";
import { getHostedIdentity } from "@/platform/identity/hosted-auth";
import { portalDemos } from "@/lib/portal-demo";
import { PortalDemoPanel } from "@/components/portal/portal-demo-panel";

export default async function DemoPage(): Promise<React.JSX.Element> {
  const identity = await getHostedIdentity();
  if (!identity) redirect("/masuk");
  if (!identity.systemAdmin) return <div className="portal-shell"><h1>Akses administrator diperlukan</h1><Link href="/portal">Kembali ke portal</Link></div>;
  return <div className="portal-shell">
    <header className="page-heading"><p className="eyebrow">Demonstrasi internal</p><h1>Satu contoh untuk setiap modul</h1><p>{portalDemos.length} contoh fiktif untuk melihat informasi dan alur kerja KPI. Semua contoh terpisah dari data resmi, laporan, akun, dan transaksi Supabase.</p></header>
    <div className="portal-demo-catalog"><nav className="portal-demo-index" aria-label="Pilih contoh modul">{portalDemos.map((item, index) => <Link key={item.href} href={`#demo-${index}`}>{item.module}</Link>)}</nav>
    <div className="portal-demo-catalog__panels">{portalDemos.map((item, index) => <div id={`demo-${index}`} key={item.href}><PortalDemoPanel href={item.href}/></div>)}</div></div>
    <Link className="button button--quiet" href="/portal">Kembali ke portal</Link>
  </div>;
}
