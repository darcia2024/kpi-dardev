import { RecoveryRequestForm } from "@/components/auth/password-recovery-forms";
import { getHostedAuthConfiguration } from "@/platform/identity/hosted-auth";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage(): React.JSX.Element {
  const localPreview = isTestAuthEnabled();
  const available = localPreview || Boolean(getHostedAuthConfiguration());
  return <div className="auth-shell">
    <section aria-labelledby="recovery-title" className="auth-panel">
      <div className="intro-panel__topline"><p className="eyebrow">Pemulihan akun</p>{localPreview && <span className="status-chip">Pratinjau lokal</span>}</div>
      <h1 id="recovery-title">Lupa kata sandi</h1>
      <p className="intro-panel__lead">{available ? "Masukkan email akun pengurus. Jika terdaftar, kami mengirim tautan untuk membuat kata sandi baru." : "Pemulihan akun belum tersedia karena akses pengurus belum dibuka."}</p>
      {available && <RecoveryRequestForm />}
    </section>
    <aside className="test-note" aria-label="Tentang pemulihan">
      <p className="eyebrow">Keamanan</p>
      <p>Tautan berlaku 30 menit dan hanya dapat dipakai sekali. Setelah kata sandi diganti, semua perangkat yang sedang masuk akan dikeluarkan. Verifikasi dua langkah tetap diperlukan saat masuk.</p>
    </aside>
  </div>;
}
