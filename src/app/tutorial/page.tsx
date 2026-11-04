import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getHostedAuthConfiguration, getHostedIdentity } from "@/platform/identity/hosted-auth";
import { guideRoleForAccount, guideSlug, portalGuide, searchGuide, type GuideFeature } from "@/lib/portal-guide";
import "./tutorial.css";

export const metadata: Metadata = { title: "Tutorial portal | KPI PPMI Mesir", description: "Cara memakai portal pengurus KPI PPMI Mesir, per peran dan per fitur.", robots: { index: false } };

function Feature({ feature }: { feature: GuideFeature }): React.JSX.Element {
  return <article className="kp-tutorial-task" id={guideSlug(feature.title)}>
    <div className="kp-tutorial-task__head"><h3>{feature.title}</h3><Link href={feature.href}>Buka halamannya</Link></div>
    <div className="kp-tutorial-task__body">
      <ol>{feature.steps.map(step => <li key={step}>{step}</li>)}</ol>
      {feature.note ? <p className="kp-tutorial-note">{feature.note}</p> : null}
    </div>
  </article>;
}

export default async function TutorialPage({ searchParams }: { searchParams: Promise<{ peran?: string | string[]; q?: string | string[] }> }): Promise<React.JSX.Element> {
  let ownRole = "semua", signedIn = false;
  if (getHostedAuthConfiguration()) {
    const identity = await getHostedIdentity();
    if (!identity) redirect("/masuk");
    ownRole = guideRoleForAccount(identity);
    signedIn = true;
  }
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const asked = typeof params.peran === "string" ? portalGuide.find(role => role.key === params.peran) : undefined;
  const role = asked ?? portalGuide.find(item => item.key === ownRole) ?? portalGuide[0];
  const results = searchGuide(query);
  return <div className="kp-tutorial">
    <header className="kp-tutorial-head">
      <h1>Tutorial portal pengurus</h1>
      <p>Pilih peran Anda, atau cari langsung hal yang ingin dikerjakan.</p>
      <form action="/tutorial" role="search"><label htmlFor="tutorial-search">Cari tutorial</label><div><input id="tutorial-search" name="q" type="search" maxLength={80} defaultValue={query} placeholder="Misalnya: unggah dokumen" /><button type="submit">Cari</button></div></form>
    </header>
    <div className="kp-tutorial-layout">
      <nav className="kp-tutorial-roles" aria-label="Pilih peran">
        <ul>{portalGuide.map(item => <li key={item.key}><Link href={`/tutorial?peran=${item.key}#role-title`} aria-current={!query && item.key === role.key ? "page" : undefined}>{item.title}</Link></li>)}</ul>
      </nav>
      <div className="kp-tutorial-main">
        {query ? <section aria-labelledby="results-title">
          <h2 id="results-title">{results.length ? `${results.length} tutorial untuk “${query}”` : `Belum ada tutorial untuk “${query}”`}</h2>
          {results.length ? <p className="kp-tutorial-who">Hasil pencarian dari semua peran.</p> : <p className="kp-tutorial-who">Coba kata lain, misalnya rapat, dokumen, atau hak akses, atau pilih peran di daftar.</p>}
          {results.map(({ role: owner, feature }) => <div key={`${owner.key}-${feature.title}`}><p className="kp-tutorial-owner">Untuk {owner.title.toLowerCase()}</p><Feature feature={feature} /></div>)}
          <Link className="kp-tutorial-clear" href="/tutorial">Hapus pencarian</Link>
        </section> : <section aria-labelledby="role-title">
          <h2 id="role-title">{role.title}</h2>
          <p className="kp-tutorial-who">{role.who}</p>
          {role.features.map(feature => <Feature feature={feature} key={feature.title} />)}
        </section>}
        <section className="kp-tutorial-stuck" aria-labelledby="stuck-title">
          <h2 id="stuck-title">Kalau tombolnya tidak ada atau tindakan ditolak</h2>
          <ul><li>Periksa izin dan masa berlakunya di Hak akses saya.</li><li>Pastikan periode yang dipilih sedang berjalan, tidak berlabel Baca saja.</li><li>Banyak tindakan harus dilakukan orang yang berbeda dari pembuatnya.</li><li>Kalau masih buntu, hubungi administrator teknis dan sebutkan halaman serta waktunya. Jangan kirim kata sandi.</li></ul>
          <Link href={signedIn ? "/portal" : "/masuk"}>{signedIn ? "Kembali ke portal" : "Masuk ke portal"}</Link>
        </section>
      </div>
    </div>
  </div>;
}
