import Image from "next/image";
import Link from "next/link";

export function PublicFooter({ locale = "id" }: { locale?: "id" | "en" }): React.JSX.Element {
  if (locale === "en") return (
    <footer className="kp-public-wrap kp-public-footer" lang="en">
      <Link href="/en" className="kp-public-footer__brand">
        <Image src="/brand/kpi-ppmi-mesir-logo.png" alt="KPI PPMI Egypt logo" width={44} height={44} />
        <span><strong>KPI PPMI Mesir</strong><small>Interaction Care Commission</small></span>
      </Link>
      <p>Safeguarding interaction.<br />Protecting dignity.</p>
      <nav aria-label="Public information footer">
        <Link href="/en">About KPI</Link>
        <Link href="/en/divisions">Divisions</Link>
        <Link href="/en/publications">Publications</Link>
        <Link href="/en/services">Services</Link>
        <Link href="/en/search">Search</Link>
        <Link href="/" hrefLang="id" lang="id">Bahasa Indonesia</Link>
      </nav>
    </footer>
  );
  return (
    <footer className="kp-public-wrap kp-public-footer">
      <Link href="/" className="kp-public-footer__brand">
        <Image src="/brand/kpi-ppmi-mesir-logo.png" alt="Logo KPI PPMI Mesir" width={44} height={44} />
        <span><strong>KPI PPMI Mesir</strong><small>Komisi Peduli Interaksi</small></span>
      </Link>
      <p>Menjaga interaksi.<br />Melindungi martabat.</p>
      <nav aria-label="Navigasi footer informasi publik">
        <Link href="/">Beranda</Link>
        <Link href="/publik">Tentang KPI</Link>
        <Link href="/publik/struktur">Struktur</Link>
        <Link href="/publik/divisi">Divisi</Link>
        <Link href="/publik/layanan">Layanan</Link>
        <Link href="/publik/kegiatan">Kegiatan</Link>
        <Link href="/publik/kabar">Kabar</Link>
        <Link href="/publik/publikasi">Publikasi</Link>
        <Link href="/publik/aspirasi">Aspirasi</Link>
        <Link href="/publik/pengaduan">Pengaduan</Link>
      </nav>
    </footer>
  );
}
