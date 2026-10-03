import Link from "next/link";
import {IconArrowUpRight, IconChecklist, IconSettings, IconLayoutDashboard} from "@tabler/icons-react";
import type {HostedAccess} from "@/platform/authorization/hosted-access";
import {hostedScopes} from "@/platform/authorization/hosted-scopes";
import {visiblePortalNavigation} from "@/lib/portal-navigation";

export function HostedAdminOverview({identity}: {identity: HostedAccess}): React.JSX.Element {
  const ready = Boolean(identity.managedScopes?.length);
  const connected=new Set(["/portal/workspace","/portal/keuangan","/portal/evaluasi","/portal/handover","/portal/ai","/portal/operasi","/portal/katalog","/portal/kebijakan","/portal/tugas","/portal/rapat","/portal/dokumen","/portal/notifikasi","/portal/kasus","/portal/editor","/portal/knowledge","/portal/akses"]);
  const groups = ["Pekerjaan", "Layanan", "Konten", "Tata kelola", "Admin"];
  return <div className="portal-shell portal-dashboard">
    <header className="page-heading"><p className="eyebrow">Workspace internal</p><h1>Beranda pengurus</h1><p>Selamat datang, {identity.name}. Pilih pekerjaan atau kelola pengaturan organisasi.</p></header>
    <section className="portal-dashboard__start" aria-labelledby="next-work">
      <div><p className="eyebrow">Langkah berikutnya</p><h2 id="next-work">{ready ? "Periode kerja aktif tersedia" : "Belum ada periode kerja aktif"}</h2><p>{ready ? "Modul pekerjaan muncul sesuai penugasan dan keputusan akses yang tercatat. Peran admin teknis tidak otomatis membuka isi pekerjaan." : "Periode mendatang dapat dicatat di pengaturan. Transaksi operasional tetap terkunci sampai periode resmi mulai dan penugasan pengurus tersedia."}</p><Link className="button button--primary" href="/portal/pengaturan">Kelola periode<IconArrowUpRight size={16} aria-hidden="true"/></Link></div>
      <dl><div><dt>Akses akun</dt><dd>Administrator sistem</dd></div><div><dt>Periode kerja</dt><dd>{ready ? identity.managedScopes?.map(scope => scope.periodCode).join(" · ") : "Belum ada yang aktif"}</dd></div><div><dt>Penyimpanan tugas</dt><dd>Tersambung ke Supabase</dd></div></dl>
    </section>
    <section aria-labelledby="quick-work"><div className="portal-section-heading"><h2 id="quick-work">Akses cepat</h2><p>Periksa izin, pengaturan, dan ketentuan informasi.</p></div><div className="portal-shortcuts">
      <Link href="/portal/akses"><IconChecklist size={22} aria-hidden="true"/><span><strong>Hak akses saya</strong><small>Periksa izin yang sesuai penugasan.</small></span><IconArrowUpRight size={16} aria-hidden="true"/></Link>
      <Link href="/portal/pengaturan"><IconSettings size={22} aria-hidden="true"/><span><strong>Organisasi & periode</strong><small>Kelola konteks kepengurusan resmi.</small></span><IconArrowUpRight size={16} aria-hidden="true"/></Link>
      <Link href="/portal/kebijakan"><IconLayoutDashboard size={22} aria-hidden="true"/><span><strong>Kerahasiaan & akses</strong><small>SOP v1.1 dan register keputusan akses.</small></span><IconArrowUpRight size={16} aria-hidden="true"/></Link>
    </div></section>
    <section aria-labelledby="module-directory"><div className="portal-section-heading"><h2 id="module-directory">Modul organisasi</h2><p>Modul tersambung tetap mengikuti periode aktif dan izin akun. Berkas memerlukan pemeriksaan. AI memerlukan penyedia yang disetujui; backup dan pemulihan dicatat beserta bukti pelaksanaannya.</p></div><div className="portal-module-directory">{groups.map(group => <section key={group}><h3>{group}</h3>{visiblePortalNavigation(permission=>(permission==="SYSTEM_CONFIGURATION_READ"&&identity.systemAdmin===true)||hostedScopes(identity,permission).length>0).filter(item => item.group === group).map(item => <Link key={item.href} href={item.href}><span>{item.label}</span><small>{connected.has(item.href) ? "Supabase" : "Belum tersambung"}</small><IconArrowUpRight size={15} aria-hidden="true"/></Link>)}</section>)}</div></section>
  </div>;
}
