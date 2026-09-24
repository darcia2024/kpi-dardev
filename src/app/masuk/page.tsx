import { SignInForm } from "@/components/auth/sign-in-form";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";

export const dynamic = "force-dynamic";

export default function SignInPage(): React.JSX.Element {
  const localPreview = isTestAuthEnabled();
  return (
    <div className="auth-shell">
      <section aria-labelledby="sign-in-title" className="auth-panel">
        <div className="intro-panel__topline"><p className="eyebrow">Portal pengurus KPI</p>{localPreview && <span className="status-chip">Pratinjau lokal</span>}</div>
        <h1 id="sign-in-title">Masuk ke portal pengurus</h1>
        <p className="intro-panel__lead">{localPreview ? "Akses ini menggunakan akun contoh untuk meninjau alur portal. Jangan gunakan kredensial atau informasi institusi." : "Akses pengurus belum dibuka. Akun dan kebijakan keamanan resmi perlu diaktifkan sebelum portal digunakan."}</p>
        {localPreview && <SignInForm />}
      </section>
      <aside className="test-note" aria-label={localPreview ? "Panduan pratinjau" : "Status akses portal"}>
        <p className="eyebrow">{localPreview ? "Akses pratinjau" : "Status layanan"}</p>
        <p>{localPreview ? "Gunakan akun contoh yang tercantum dalam dokumentasi pengembangan. Aktivitas di sini belum menjadi catatan resmi KPI." : "Portal akan dibuka setelah identitas pengurus, penyimpanan data, dan izin akses resmi siap digunakan."}</p>
        {localPreview && <div className="test-note__steps"><span>01</span><p>Masukkan email dan kata sandi akun contoh.</p><span>02</span><p>Verifikasi dengan kode pratinjau.</p><span>03</span><p>Keluar setelah selesai meninjau portal.</p></div>}
      </aside>
    </div>
  );
}
