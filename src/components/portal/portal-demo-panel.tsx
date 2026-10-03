import Link from "next/link";
import { findPortalDemo } from "@/lib/portal-demo";

export function PortalDemoPanel({href}: {href: string}): React.JSX.Element | null {
  const example = findPortalDemo(href);
  if (!example) return null;
  return <section className="operations-panel portal-demo" aria-label={`Data demo ${example.module}`}>
    <div className="portal-demo__heading"><div><p className="eyebrow">Data demo · {example.module}</p><h2>{example.title}</h2></div><span className="status-chip">{example.status}</span></div>
    <p className="portal-demo__summary">{example.summary}</p>
    <details open><summary>Rincian dan alur contoh</summary>
      <div className="portal-demo__body"><dl className="portal-demo__fields">{example.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <section className="portal-demo__flow"><h3>Gambaran alur</h3><ol>{example.flow.map(step => <li key={step}>{step}</li>)}</ol></section></div>
    </details>
    <footer className="portal-demo__foot"><span>{example.id} · Contoh baca saja; tidak masuk data operasional.</span><Link href="/portal/demo">Semua contoh modul</Link></footer>
  </section>;
}
