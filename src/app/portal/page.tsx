import { cookies } from "next/headers";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";

export default async function PortalPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);

  if (!identity) {
    return (
      <div className="portal-shell">
        <header className="page-heading">
          <p className="eyebrow">Portal pengurus</p>
          <h1>Masuk diperlukan</h1>
          <p>Portal hanya menampilkan ruang kerja setelah sesi TEST yang sah terbentuk.</p>
        </header>
        <Link className="button button--primary" href="/masuk">Masuk ke portal</Link>
      </div>
    );
  }

  return (
    <div className="portal-shell">
      <header className="page-heading">
        <div className="intro-panel__topline"><p className="eyebrow">Portal pengurus</p><span className="status-chip">Sesi TEST aktif</span></div>
        <h1>Selamat datang, {identity.name.split(" ")[0]}.</h1>
        <p>Ruang kerja untuk pekerjaan yang perlu dilihat, ditindaklanjuti, dan diselesaikan.</p>
      </header>
      <section className="portal-context" aria-label="Konteks sesi">
        <span>Role aktif</span><strong>{identity.roles.join(" · ")}</strong><span>Lingkungan</span><strong>Local TEST</strong>
      </section>
      <section className="workspace-grid" aria-label="Modul ruang kerja">
        <article className="workspace-card workspace-card--primary"><span className="workspace-card__number">01</span><h2>My Workspace</h2><p>Tugas dan pekerjaan yang ditugaskan kepada Anda akan muncul di sini.</p><Link className="workspace-card__link" href="/portal/workspace">Buka workspace TEST</Link></article>
        <article className="workspace-card"><span className="workspace-card__number">02</span><h2>Action Required</h2><p>Persetujuan, revisi, dan keputusan yang membutuhkan perhatian.</p><Link className="workspace-card__link" href="/portal/tugas">Buka tugas TEST</Link></article>
        <article className="workspace-card"><span className="workspace-card__number">03</span><h2>Dokumen bersama</h2><p>Akses berkas berdasarkan peran dan konteks organisasi.</p><Link className="workspace-card__link" href="/portal/dokumen">Buka pustaka TEST</Link></article>
        <article className="workspace-card"><span className="workspace-card__number">04</span><h2>Rapat & keputusan</h2><p>Agenda, kehadiran, notulen, dan tindak lanjut dalam satu alur.</p><Link className="workspace-card__link" href="/portal/rapat">Buka rapat TEST</Link></article>
        <article className="workspace-card"><span className="workspace-card__number">05</span><h2>Kasus & notifikasi</h2><p>Triage, pembaruan pelapor, pengumuman, dan status pengiriman.</p><Link className="workspace-card__link" href="/portal/kasus">Buka layanan TEST</Link></article>
        <article className="workspace-card"><span className="workspace-card__number">06</span><h2>Keuangan</h2><p>Anggaran, pengajuan, approval, pembayaran, dan rekonsiliasi.</p><Link className="workspace-card__link" href="/portal/keuangan">Buka keuangan TEST</Link></article>
        <article className="workspace-card"><span className="workspace-card__number">07</span><h2>Handover & operasi</h2><p>Paket serah-terima, konfigurasi, backup, dan pergantian akses.</p><Link className="workspace-card__link" href="/portal/handover">Buka handover TEST</Link></article>
        <article className="workspace-card"><span className="workspace-card__number">08</span><h2>AI terkendali</h2><p>Sumber berizin, sitasi, registry model, dan review tindakan.</p><Link className="workspace-card__link" href="/portal/ai">Buka AI TEST</Link></article>
        <article className="workspace-card"><span className="workspace-card__number">09</span><h2>Evaluasi & knowledge</h2><p>Target, capaian, penilaian, SOP, dan sumber rujukan organisasi.</p><Link className="workspace-card__link" href="/portal/evaluasi">Buka evaluasi TEST</Link></article>
        <article className="workspace-card"><span className="workspace-card__number">10</span><h2>Katalog 113 layar</h2><p>Indeks cakupan, fase, status UI, dan dependensi tiap layar.</p><Link className="workspace-card__link" href="/portal/katalog">Buka katalog</Link></article>
      </section>
      <section className="access-section" aria-labelledby="access-title">
        <div className="section-heading"><p className="eyebrow">Identitas & akses</p><h2 id="access-title">Kelola konteks sebelum bekerja.</h2><p className="section-heading__copy">Profil, sesi, role, dan periode akan menentukan apa yang dapat Anda lihat dan lakukan.</p></div>
        <Link className="button button--quiet" href="/portal/akses">Buka pusat identitas & akses</Link>
      </section>
      <section className="state-panel state-panel--empty">
        <p className="state-panel__label">Batas ruang TEST</p>
        <h2>Modul bisnis belum diaktifkan</h2>
        <p>Autentikasi dan pembatasan role tersedia untuk pengujian lokal. Data organisasi, tugas, dan layanan lain akan dihubungkan secara bertahap setelah fondasi database selesai.</p>
        <SignOutButton />
      </section>
    </div>
  );
}
