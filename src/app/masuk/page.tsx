import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage(): React.JSX.Element {
  return (
    <div className="auth-shell">
      <section aria-labelledby="sign-in-title" className="auth-panel">
        <p className="eyebrow">Akses TEST lokal</p>
        <h1 id="sign-in-title">Masuk ke portal pengurus</h1>
        <p className="intro-panel__lead">Alur ini hanya untuk pengujian lokal. Kredensial TEST tidak dapat dipakai pada layanan institusi.</p>
        <SignInForm />
      </section>
      <aside className="test-note" aria-label="Panduan akun TEST">
        <p className="eyebrow">Panduan TEST</p>
        <p>Gunakan akun TEST yang ditentukan pada dokumentasi pengujian lokal. Jangan memasukkan email atau kata sandi institusi.</p>
      </aside>
    </div>
  );
}
