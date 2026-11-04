import Link from "next/link";
import { redirect } from "next/navigation";
import { getHostedAuthConfiguration, getHostedIdentity } from "@/platform/identity/hosted-auth";
import { guideRoleForAccount, portalGuide } from "@/lib/portal-guide";

export default async function PortalGuidePage(): Promise<React.JSX.Element> {
  let openRole = "semua";
  if (getHostedAuthConfiguration()) {
    const identity = await getHostedIdentity();
    if (!identity) redirect("/masuk");
    openRole = guideRoleForAccount(identity);
  }
  return <div className="portal-shell">
    <header className="page-heading"><p className="eyebrow">Panduan portal</p><h1>Cara memakai portal</h1><p>Pilih peran Anda, lalu buka fitur yang ingin dipelajari. Seseorang bisa memegang lebih dari satu peran, dan menu yang tampil tetap mengikuti izin akun.</p></header>
    {portalGuide.map(role => <details className="operations-panel" key={role.key} open={role.key === openRole}><summary><strong>{role.title}</strong></summary><p>{role.who}</p>{role.features.map(feature => <details key={feature.title}><summary>{feature.title}</summary><ol>{feature.steps.map(step => <li key={step}>{step}</li>)}</ol>{feature.note ? <p>{feature.note}</p> : null}<Link href={feature.href}>Buka halamannya</Link></details>)}</details>)}
    <section className="operations-panel"><h2>Kalau tombol tidak muncul atau tindakan ditolak</h2><ul><li>Periksa izin dan masa berlakunya di Hak akses saya.</li><li>Pastikan periode yang dipilih sedang berjalan, bukan Baca saja.</li><li>Banyak tindakan harus dilakukan orang yang berbeda dari pembuatnya.</li><li>Kalau masih buntu, hubungi administrator teknis dan sebutkan halaman serta waktunya. Jangan kirim kata sandi.</li></ul></section>
  </div>;
}
