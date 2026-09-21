import Link from "next/link";
import { AspirationForm } from "@/components/public/aspiration-form";

export default function AspirationPage(): React.JSX.Element {
  return <div className="public-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">P12–P13 · Aspirasi & tracking</p><span className="status-chip">Preview TEST</span></div><h1>Sampaikan aspirasi dengan jelas.</h1><p>Formulir ini menunjukkan alur penerimaan dan token pelacakan. Penanganan nyata baru dibuka setelah triage dan kebijakan privasi disetujui.</p></header><div className="aspiration-layout"><section className="form-panel"><AspirationForm /></section><aside className="policy-panel"><p className="eyebrow">Sebelum mengirim</p><h2>Yang perlu diketahui</h2><ul><li>Data kontak bersifat opsional pada rancangan ini.</li><li>Jangan masukkan password, OTP, atau dokumen rahasia.</li><li>Token tracking TEST hanya contoh dan belum terhubung ke petugas.</li></ul></aside></div><Link className="button button--quiet" href="/publik">Kembali ke informasi publik</Link></div>;
}
