import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconArrowUpRight, IconLock } from "@tabler/icons-react";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Layanan Pengaduan | KPI PPMI Mesir",
  description: "Pahami ruang lingkup, tahapan penanganan, dan perlindungan informasi dalam layanan pengaduan KPI PPMI Mesir. Kanal resmi belum dibuka."
};

const stages = [
  ["01", "Sampaikan informasi", "Pelapor menjelaskan peristiwa dan konteksnya. Informasi yang masuk belum dianggap sebagai fakta yang terbukti."],
  ["02", "Diterima Sekretaris KPI", "Sekretaris menerima laporan untuk pemeriksaan awal dan pencatatan sesuai prosedur yang akan ditetapkan."],
  ["03", "Ditindaklanjuti divisi terkait", "Intelligence and Operation Division menindaklanjuti sesuai kewenangan. Perkara di luar lingkup KPI memerlukan jalur rujukan yang ditetapkan."],
  ["04", "Pembaruan aman", "Pelapor menerima status yang boleh dibagikan. Hanya personel KPI yang terlibat dalam kasus yang dapat mengakses informasi sesuai tugasnya."]
] as const;

export default function ComplaintPage(): React.JSX.Element {
  return <div className="kp-site kp-complaint-page">
    <section className="kp-complaint-hero" aria-labelledby="complaint-title">
      <div className="kp-wrap kp-complaint-hero__inner">
        <div>
          <p className="kp-eyebrow"><span /> Layanan pengaduan</p>
          <h1 id="complaint-title">Ruang untuk melapor.<br /><em>Proses yang menjaga semua pihak.</em></h1>
          <p>Pengaduan terkait interaksi Masisir perlu diterima dengan saksama, ditelaah sesuai kewenangan KPI, dan ditangani tanpa mendahului kesimpulan.</p>
          <div className="kp-complaint-actions"><Link className="kp-button kp-button--red" href="#alur">Pahami tahapannya <IconArrowRight size={18} aria-hidden="true" /></Link><Link className="kp-button kp-button--outline" href="/publik/layanan">Lihat layanan <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>
        <aside className="kp-complaint-notice" aria-label="Status layanan">
          <IconLock size={28} stroke={1.5} aria-hidden="true" />
          <p className="kp-eyebrow">Belum menerima laporan resmi</p>
          <h2>Kanal resmi sedang disiapkan</h2>
          <p>Penanggung jawab penerimaan dan tindak lanjut sudah ditentukan, tetapi SOP rinci dan kanal penanganan produksi belum siap. Jangan masukkan identitas, bukti, atau cerita perkara nyata.</p>
        </aside>
      </div>
    </section>

    <section className="kp-wrap kp-complaint-scope" aria-labelledby="scope-title">
      <div><p className="kp-eyebrow">Sebelum menyampaikan</p><h2 id="scope-title">Pengaduan berbeda dari aspirasi.</h2></div>
      <div><p>Pengaduan menyangkut peristiwa atau persoalan interaksi yang mungkin memerlukan pemeriksaan dan tindak lanjut. Saran dan pertanyaan umum tetap berada di <Link href="/publik/aspirasi">ruang aspirasi</Link>.</p><p>Laporan yang diterima adalah bahan telaah, bukan penetapan kesalahan. Kerahasiaan dan perlakuan adil terhadap seluruh pihak harus dijaga.</p></div>
    </section>

    <section className="kp-complaint-process" id="alur" aria-labelledby="process-title"><div className="kp-wrap">
      <div className="kp-complaint-process__head"><div><p className="kp-eyebrow">Alur penanganan</p><h2 id="process-title">Dari informasi awal<br />ke tindak lanjut.</h2></div><p>Sekretaris KPI menerima laporan; Intelligence and Operation Division menindaklanjuti. Kategori, batas waktu, akses rinci, dan jalur rujukan masih menunggu SOP organisasi.</p></div>
      <ol>{stages.map(([number, title, description]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
    </div></section>

    <section className="kp-wrap kp-complaint-next"><div><p className="kp-eyebrow">Butuh informasi lain?</p><h2>Pilih jalur yang sesuai.</h2></div><div><Link href="/publik/aspirasi">Saran dan pertanyaan <IconArrowUpRight size={18} aria-hidden="true" /></Link><Link href="/publik/layanan">Semua layanan publik <IconArrowUpRight size={18} aria-hidden="true" /></Link></div></section>
    <PublicFooter />
  </div>;
}
