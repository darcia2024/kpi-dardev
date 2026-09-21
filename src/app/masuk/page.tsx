import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage(): React.JSX.Element {
  return (
    <div className="auth-shell">
      <section aria-labelledby="sign-in-title" className="auth-panel">
        <div className="intro-panel__topline"><p className="eyebrow">A01–A02 · Akses TEST lokal</p><span className="status-chip">Data sintetis</span></div>
        <h1 id="sign-in-title">Masuk ke portal pengurus</h1>
        <p className="intro-panel__lead">Alur ini hanya untuk pengujian lokal. Kredensial TEST tidak dapat dipakai pada layanan institusi.</p>
        <SignInForm />
      </section>
      <aside className="test-note" aria-label="Panduan akun TEST">
        <p className="eyebrow">Panduan TEST</p>
        <p>Gunakan akun TEST yang ditentukan pada dokumentasi pengujian lokal. Jangan memasukkan email atau kata sandi institusi.</p>
        <div className="test-note__steps"><span>01</span><p>Email dan kata sandi membuat challenge sementara.</p><span>02</span><p>Kode MFA TEST membuka sesi portal.</p><span>03</span><p>Sesi dapat dicabut dari alur keluar.</p></div>
      </aside>
    </div>
  );
}
