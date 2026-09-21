import Link from "next/link";

export default function HomePage(): React.JSX.Element {
  return (
    <div className="public-shell">
      <section className="intro-panel" aria-labelledby="page-title">
        <p className="eyebrow">Tahap fondasi</p>
        <h1 id="page-title">Sistem Digital KPI PPMI Mesir</h1>
        <p className="intro-panel__lead">
          Fondasi aplikasi sedang disiapkan untuk menghubungkan layanan publik dan pekerjaan pengurus.
        </p>
        <div className="intro-panel__actions">
          <Link className="button button--primary" href="/portal">Buka portal pengurus</Link>
        </div>
      </section>
      <section aria-labelledby="scope-title" className="scope-section">
        <div>
          <p className="eyebrow">Status saat ini</p>
          <h2 id="scope-title">Akses pengurus belum diaktifkan</h2>
        </div>
        <p>
          Autentikasi, hak akses, data organisasi, dan layanan publik sedang dibangun memakai data TEST.
          Informasi institusi dan layanan pengaduan belum tersedia pada aplikasi ini.
        </p>
      </section>
    </div>
  );
}
