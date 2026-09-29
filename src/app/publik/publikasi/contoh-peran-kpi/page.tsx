import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconArrowUpRight } from "@tabler/icons-react";
import { PublicFooter } from "@/components/public/public-footer";
import { examplePublication } from "@/lib/example-publication";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${examplePublication.title} | KPI PPMI Mesir`,
  description: examplePublication.description
};

export default function ExamplePublicationPage(): React.JSX.Element {
  if (!isTestAuthEnabled()) notFound();
  return <div className="kp-site kp-library">
    <article className="kp-example-article kp-wrap">
      <Link className="kp-text-link" href="/publik/publikasi"><IconArrowLeft size={18} aria-hidden="true" /> Kembali ke publikasi</Link>
      <div className="kp-example-article__heading">
        <p className="kp-eyebrow">Artikel contoh · belum diterbitkan resmi</p>
        <h1>{examplePublication.title}</h1>
        <p>{examplePublication.description}</p>
      </div>
      <div className="kp-example-article__notice" role="note">Ini adalah contoh isi dan tampilan artikel. Materi disusun dari gambaran mandat KPI yang tersedia; bukan pernyataan, berita kegiatan, atau publikasi resmi pengurus.</div>
      <div className="kp-example-article__body">
        <p>Bagi mahasiswa dan pelajar Indonesia di Mesir, kehidupan bersama berlangsung di ruang belajar, organisasi, kegiatan, dan pergaulan sehari-hari. Perbedaan pandangan dan kebiasaan tidak selalu bisa dihindari. Yang dapat dijaga adalah cara kita berinteraksi: menghormati batas, mendengar sebelum menyimpulkan, dan menyampaikan persoalan melalui jalur yang tepat.</p>
        <h2>Apa peran KPI?</h2>
        <p>Komisi Peduli Interaksi (KPI) merupakan Badan Semi Otonom PPMI Mesir yang berfokus pada persoalan interaksi di kalangan Masisir. Ruang kerjanya mencakup pemahaman awal, pencegahan, edukasi, pengawasan, dan tindak lanjut sesuai kewenangan organisasi. KPI membantu menjaga proses agar informasi ditangani secara tertib dan setiap pihak diperlakukan dengan layak.</p>
        <h2>Ketika ada persoalan interaksi</h2>
        <p>Informasi awal perlu disampaikan dengan jelas: apa yang terjadi, kapan dan di mana, siapa pihak yang relevan, serta hal apa yang diharapkan. Laporan bukanlah bukti bahwa seseorang bersalah. KPI perlu menelaah konteks, menentukan apakah persoalan berada dalam lingkup kewenangannya, dan membatasi akses terhadap informasi yang sensitif.</p>
        <p>Berdasarkan arahan yang sudah diterima, Sekretaris KPI menjadi penerima awal pengaduan, sedangkan Intelligence and Operation Division menindaklanjuti sesuai tugasnya. Ketentuan rinci, jalur rujukan, dan kanal pengaduan resmi masih memerlukan dokumen organisasi yang disahkan.</p>
        <h2>Peran setiap Masisir</h2>
        <p>Menjaga interaksi bukan hanya tugas sebuah lembaga. Kita dapat memulai dari komunikasi yang jelas, menghormati persetujuan dan batas pribadi, tidak menyebarkan dugaan, serta memberi ruang bagi orang lain untuk menjelaskan sudut pandangnya. Ketika sebuah keadaan membutuhkan bantuan, gunakan jalur yang aman dan hindari menyebarkan identitas atau bukti pribadi di ruang publik.</p>
      </div>
      <div className="kp-example-article__end"><p>Butuh memahami jalur penyampaian informasi?</p><Link className="kp-button kp-button--outline" href="/publik/layanan">Lihat layanan publik <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </article>
    <PublicFooter />
  </div>;
}
