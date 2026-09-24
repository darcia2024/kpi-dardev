import Image from "next/image";
import Link from "next/link";

export function PublicFooter(): React.JSX.Element {
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
