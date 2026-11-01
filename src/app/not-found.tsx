import Link from "next/link";
import { PublicFooter } from "@/components/public/public-footer";

export default function NotFound(): React.JSX.Element {
  return <div className="kp-site kp-not-found">
    <section className="kp-wrap kp-not-found__body" aria-labelledby="not-found-title">
      <p className="kp-eyebrow">Halaman tidak ditemukan</p>
      <h1 id="not-found-title">Alamat ini tidak ada di situs KPI.</h1>
      <p>Tautannya mungkin salah ketik, atau halamannya sudah dipindahkan. Silakan mulai dari beranda atau gunakan pencarian.</p>
      <div className="kp-actions"><Link className="kp-button kp-button--red" href="/">Ke beranda</Link><Link className="kp-button kp-button--outline" href="/publik/cari">Cari di situs</Link></div>
    </section>
    <PublicFooter />
  </div>;
}
