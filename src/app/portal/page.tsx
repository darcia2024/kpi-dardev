import { formatPreviewPeriodLabel } from "@/lib/period-label";
import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { visiblePortalNavigation } from "@/lib/portal-navigation";
import { IconArrowUpRight, IconBook2, IconBrain, IconBriefcase2, IconCircleCheck, IconFileText, IconGavel, IconLayoutDashboard, IconSettings, IconShieldCheck, IconUsersGroup, IconWallet } from "@tabler/icons-react";

const workCards = [
  { href: "/portal/workspace", label: "Workspace", description: "Pekerjaan dan hambatan dalam konteks akun serta periode.", icon: IconBriefcase2 },
  { href: "/portal/tugas", label: "Tugas & review", description: "Antrean tugas, bukti, keputusan, dan tindak lanjut.", icon: IconCircleCheck },
  { href: "/portal/dokumen", label: "Dokumen", description: "Metadata, versi, klasifikasi, dan akses sumber.", icon: IconFileText },
  { href: "/portal/rapat", label: "Rapat & keputusan", description: "Notulen, voting, keputusan, dan tugas lanjutan.", icon: IconGavel }
];

const controlCards = [
  { href: "/portal/kasus", label: "Kasus & notifikasi", icon: IconShieldCheck },
  { href: "/portal/keuangan", label: "Keuangan", icon: IconWallet },
  { href: "/portal/editor", label: "CMS editorial", icon: IconBook2 },
  { href: "/portal/evaluasi", label: "Evaluasi & knowledge", icon: IconBrain },
  { href: "/portal/handover", label: "Handover & operasi", icon: IconSettings },
  { href: "/portal/akses", label: "Identitas & akses", icon: IconUsersGroup }
];

export default async function PortalPage(): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Portal pengurus</p><h1>Masuk diperlukan</h1><p>Ruang kerja hanya tersedia setelah sesi pratinjau yang sah terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;

  const destinations = new Set(visiblePortalNavigation((permission) => hasTestPermission(identity, permission, scope)).map((item) => item.href));
  const availableWork = workCards.filter((card) => destinations.has(card.href));
  const availableControl = controlCards.filter((card) => destinations.has(card.href));
  const firstAction = availableWork[0];

  return <div className="portal-shell">
    <header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">Portal pengurus</p><span className="status-chip">Sesi pratinjau aktif</span></div><h1>Selamat datang, {identity.name.split(" ")[0]}.</h1><p>Pilih pekerjaan yang tersedia untuk akun ini. Setiap modul memeriksa izin kembali saat data dibaca atau tindakan disimpan.</p></header>
    <section className="kp-portal-overview" aria-label="Ringkasan kerja portal"><article className="kp-portal-priority"><div><div><p className="kp-portal-priority__eyebrow">Mulai dari pekerjaan</p><h2>Temukan tindakan yang perlu diselesaikan.</h2></div><IconLayoutDashboard size={32} stroke={1.35} aria-hidden="true" /></div><p>Daftar kerja terhubung ke data lokal pratinjau dan menampilkan pekerjaan sesuai izin akun.</p><div className="kp-portal-priority__actions">{firstAction ? <Link href={firstAction.href}>Buka {firstAction.label} <IconArrowUpRight size={17} aria-hidden="true" /></Link> : <span>Belum ada modul pekerjaan yang diberikan kepada akun ini.</span>}</div></article><aside className="kp-portal-context-card"><div><IconUsersGroup size={27} stroke={1.4} aria-hidden="true" /><span>Identitas aktif<strong>{identity.name}</strong></span></div><dl><dt>Role</dt><dd>{identity.roles.join(" · ")}</dd><dt>Lingkungan</dt><dd>Pratinjau lokal</dd><dt>Periode</dt><dd>{formatPreviewPeriodLabel(scope.periodCode)}</dd></dl></aside></section>
    {availableWork.length > 0 ? <section aria-labelledby="work-title"><div className="kp-portal-section-head"><div><p className="eyebrow">Ruang kerja inti</p><h2 id="work-title">Kerjakan, tinjau, putuskan.</h2></div><p>Tujuan yang terlihat di sini mengikuti izin baca akun.</p></div><div className="kp-portal-workgrid">{availableWork.map((card, index) => <Link href={card.href} key={card.href}><div><span>{String(index + 1).padStart(2, "0")}</span><card.icon size={24} stroke={1.45} aria-hidden="true" /></div><strong>{card.label}</strong><small>{card.description}</small><IconArrowUpRight className="kp-portal-workgrid__arrow" size={19} aria-hidden="true" /></Link>)}</div></section> : null}
    {availableControl.length > 0 ? <section aria-labelledby="control-title"><div className="kp-portal-section-head"><div><p className="eyebrow">Kontrol & keberlanjutan</p><h2 id="control-title">Modul pendukung tata kelola.</h2></div><p>Gunakan sesuai tugas dan izin yang telah diberikan.</p></div><div className="kp-portal-control-grid">{availableControl.map((card, index) => <Link href={card.href} key={card.href}><span>{String(index + availableWork.length + 1).padStart(2, "0")}</span><strong>{card.label}</strong><card.icon size={18} aria-hidden="true" /></Link>)}</div></section> : null}
    <section className="state-panel state-panel--empty"><p className="state-panel__label">Batas ruang pratinjau</p><h2>Ruang kerja terhubung ke backend pratinjau</h2><p>Daftar dan tindakan modul yang tersedia membaca API dengan penyimpanan lokal. File dokumen, pengiriman notifikasi, dan kebijakan produksi masih menunggu layanan serta keputusan resmi KPI.</p><SignOutButton /></section>
  </div>;
}
