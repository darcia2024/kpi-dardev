import Link from "next/link";
import {getHostedAuthConfiguration,getHostedIdentity} from "@/platform/identity/hosted-auth";
import {cookies} from "next/headers";
import {getTestSession,sessionCookieName} from "@/platform/identity/test-auth";
import catalog from "@/platform/intake/case-sop-catalog.json";
import {CaseSopGuide} from "@/components/cases/case-sop-guide";

export default async function CaseGuidePage():Promise<React.JSX.Element>{
 const identity=getHostedAuthConfiguration()?await getHostedIdentity():getTestSession((await cookies()).get(sessionCookieName)?.value);
 if(!identity)return <div className="portal-shell"><h1>Masuk diperlukan</h1><Link href="/masuk">Masuk ke portal</Link></div>;
 return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Pedoman internal</p><h1>SOP dan formulir penanganan kasus</h1><p>Delapan dokumen sumber diimpor sebagai acuan. Formulir digital menyimpan draf per bagian; tanda tangan dan keputusan resmi membutuhkan bukti otorisasi tersendiri.</p><Link href="/portal/kasus" className="button button--quiet">Kembali ke kasus</Link></header><CaseSopGuide/><section className="portal-form-card"><h2>SOP Penanganan Kasus KPI</h2><details><summary>Baca naskah sumber lengkap</summary><pre className="case-source-text">{catalog.sopText}</pre></details></section><section className="portal-form-card"><h2>Tujuh format administrasi kasus</h2><p>Petunjuk dan pilihan di bawah berasal dari formulir yang dikirim. Bagian otorisasi tidak menjadi persetujuan hanya karena diisi.</p>{catalog.forms.map(form=><details key={form.code}><summary>{form.code} · {form.name}</summary><p>Sumber: {form.source}</p>{form.sections.map(section=><details key={section.key}><summary>{section.title}</summary><pre className="case-source-text">{section.guide}</pre></details>)}</details>)}</section></div>;
}
