import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowUpRight, IconShieldCheck } from "@tabler/icons-react";
import { AspirationForm } from "@/components/public/aspiration-form";
import { PublicFooter } from "@/components/public/public-footer";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aspirasi & Pelacakan | KPI PPMI Mesir",
  description: "Pratinjau alur penyampaian aspirasi KPI PPMI Mesir dengan panduan keamanan informasi."
};

export default function AspirationPage(): React.JSX.Element {
  const localPreview = isTestAuthEnabled();
  return <div className="kp-site kp-aspiration-page"><section className="kp-aspiration-hero" aria-labelledby="aspiration-title"><div className="kp-wrap"><p className="kp-eyebrow"><span /> Aspirasi & pelacakan</p><h1 id="aspiration-title">Pahami alur aspirasi.<br /><em>Jaga informasi pribadi.</em></h1><p>Saran dan pertanyaan umum memiliki alur tersendiri. Pengaduan terkait peristiwa interaksi dapat dipahami di <Link href="/publik/pengaduan">halaman pengaduan</Link>.</p></div></section><section className="kp-wrap kp-aspiration-layout"><section className="kp-aspiration-form" aria-labelledby="form-title"><p className="kp-eyebrow">{localPreview ? "Pratinjau alur" : "Status layanan"}</p><h2 id="form-title">{localPreview ? "Tinjau formulir aspirasi." : "Kanal aspirasi belum dibuka."}</h2>{localPreview ? <AspirationForm /> : <p>Pengiriman aspirasi akan tersedia setelah kanal penerimaan resmi dan penanggung jawabnya ditetapkan. Untuk saat ini, jangan mengirim informasi pribadi melalui halaman ini.</p>}</section><aside className="kp-aspiration-aside"><section><p className="kp-eyebrow">Sebelum menyampaikan</p><h2>Yang perlu dijaga</h2><ul><li>Jangan bagikan kata sandi, kode verifikasi, dokumen rahasia, atau data pribadi pihak lain.</li><li>Tulis uraian yang ringkas, faktual, dan menghormati semua pihak.</li><li>Pastikan kanal resmi telah dibuka sebelum mengirim informasi.</li></ul></section><section><IconShieldCheck size={24} stroke={1.5} aria-hidden="true" /><h2>{localPreview ? "Formulir ini hanya pratinjau." : "Penerimaan resmi belum aktif."}</h2><p>{localPreview ? "Data yang dikirim hanya tersimpan di perangkat pengembangan dan tidak ditangani petugas KPI. Gunakan informasi contoh saja." : "KPI masih menyiapkan penerimaan, pelacakan, dan tindak lanjut sesuai prosedur organisasi."}</p><Link href="/publik/pengaduan">Pahami alur pengaduan <IconArrowUpRight size={17} aria-hidden="true" /></Link></section><section><p className="kp-eyebrow">Butuh informasi lain?</p><h2>Telusuri layanan publik.</h2><p>Temukan materi, dokumentasi, serta informasi organisasi dari satu direktori.</p><Link href="/publik/layanan">Buka direktori layanan <IconArrowUpRight size={17} aria-hidden="true" /></Link></section></aside></section><PublicFooter /></div>;
}
