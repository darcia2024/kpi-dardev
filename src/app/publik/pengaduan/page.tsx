import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconArrowUpRight, IconLock } from "@tabler/icons-react";
import { PublicFooter } from "@/components/public/public-footer";
import {getHostedAuthConfiguration} from "@/platform/identity/hosted-auth";
import {hostedIntakeReady} from "@/platform/intake/hosted-public-intake";
import {HostedIntakeForm} from "@/components/public/hosted-intake-form";
export const dynamic="force-dynamic";

export const metadata: Metadata = {
  title: "Layanan Pengaduan | KPI PPMI Mesir",
  description: "Ruang lingkup, tahapan penanganan, dan perlindungan informasi dalam layanan pengaduan KPI PPMI Mesir."
};

const stages = [
  ["01", "Sampaikan informasi", "Pelapor menjelaskan peristiwa dan konteksnya. Informasi yang masuk belum dianggap sebagai fakta yang terbukti."],
  ["02", "Diterima Sekretaris KPI", "Sekretaris menerima laporan untuk pemeriksaan awal dan pencatatan sesuai prosedur yang akan ditetapkan."],
  ["03", "Ditindaklanjuti divisi terkait", "Intelligence and Operation Division menindaklanjuti sesuai kewenangan. Perkara di luar lingkup KPI memerlukan jalur rujukan yang ditetapkan."],
  ["04", "Pembaruan aman", "Pelapor menerima status yang boleh dibagikan. Hanya personel KPI yang terlibat dalam kasus yang dapat mengakses informasi sesuai tugasnya."]
] as const;

export default async function ComplaintPage(): Promise<React.JSX.Element> {
  const ready=!!getHostedAuthConfiguration()&&await hostedIntakeReady();
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
          <p className="kp-eyebrow">{ready?"Penerimaan laporan aktif":"Belum menerima laporan resmi"}</p>
          <h2>{ready?"Laporan ditangani secara terbatas":"Kanal resmi sedang disiapkan"}</h2>
          <p>{ready?"Sekretaris KPI menerima laporan untuk pemeriksaan awal. Petugas IOD yang ditugaskan menindaklanjuti, dengan akses terbatas bagi personel yang terlibat.":"Kanal belum menerima laporan karena periode aktif dan petugas resmi belum lengkap. Jangan masukkan identitas, bukti, atau cerita perkara nyata."}</p>
        </aside>
      </div>
    </section>

    {ready?<section className="kp-wrap kp-aspiration-layout"><section className="kp-aspiration-form"><h2>Sampaikan pengaduan</h2><HostedIntakeForm complaint/></section><aside className="kp-aspiration-aside"><h2>Tulis informasi yang diperlukan</h2><p>Jelaskan peristiwa, waktu, dan konteks secara faktual. Jangan memasukkan kata sandi, kode verifikasi, atau data pribadi yang tidak relevan. Kode pelacakan hanya menampilkan pembaruan yang aman bagi pelapor.</p></aside></section>:null}

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
