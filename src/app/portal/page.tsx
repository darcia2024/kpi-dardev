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
        <p className="eyebrow">Portal pengurus</p>
        <h1>Selamat datang, {identity.name}</h1>
        <p>Sesi TEST aktif dengan role: {identity.roles.join(", ")}.</p>
      </header>
      <section className="state-panel state-panel--empty">
        <p className="state-panel__label">Ruang kerja TEST</p>
        <h2>Modul bisnis belum diaktifkan</h2>
        <p>Autentikasi dan pembatasan role telah tersedia untuk pengujian lokal. Data organisasi, tugas, dan layanan lain masih menunggu modul serta database KPI.</p>
        <SignOutButton />
      </section>
    </div>
  );
}
