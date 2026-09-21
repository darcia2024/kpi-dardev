"use client";

import { useState } from "react";

const scores = [
  { id: "EVAL-TEST-01", title: "Penyelesaian tugas", value: "Belum diisi", evidence: "3 tugas TEST", status: "Draft" },
  { id: "EVAL-TEST-02", title: "Ketepatan waktu", value: "82 / 100", evidence: "Deadline TEST", status: "Reviewed" },
  { id: "EVAL-TEST-03", title: "Kualitas bukti", value: "Belum diisi", evidence: "Menunggu review", status: "Needs evidence" }
];
const articles = [
  { code: "K01", title: "Panduan kerja pengurus · TEST", type: "SOP", status: "Approved TEST", source: "Dokumen fondasi" },
  { code: "K02", title: "Cara membaca status tugas · TEST", type: "FAQ", status: "Draft TEST", source: "Workspace" },
  { code: "K03", title: "Catatan evaluasi periode · TEST", type: "Brief", status: "Review TEST", source: "Rapat TEST" }
];

export function EvaluationWorkspace(): React.JSX.Element {
  const [tab, setTab] = useState<"performance" | "knowledge">("performance");
  const [selected, setSelected] = useState(scores[0]);
  const [submitted, setSubmitted] = useState(false);
  return <><section className="case-tabs" aria-label="Area evaluasi"><button className={tab === "performance" ? "is-active" : ""} onClick={() => setTab("performance")} type="button">Kinerja</button><button className={tab === "knowledge" ? "is-active" : ""} onClick={() => setTab("knowledge")} type="button">Knowledge base</button></section>{tab === "performance" ? <section className="evaluation-layout"><div className="score-list" aria-label="Indikator TEST">{scores.map((score) => <button className={`score-row ${selected.id === score.id ? "score-row--selected" : ""}`} key={score.id} onClick={() => setSelected(score)} type="button"><span className="workspace-card__number">{score.id}</span><strong>{score.title}</strong><span>{score.value}</span><span className="status-chip">{score.status}</span></button>)}</div><aside className="score-detail"><p className="eyebrow">E01–E03 · Capaian & koreksi</p><h2>{selected.title}</h2><p>Nilai asli, bukti pendukung, formula versi, dan alasan koreksi tetap dapat ditelusuri.</p><div className="score-value"><span>Nilai saat ini</span><strong>{selected.value}</strong><small>{selected.evidence}</small></div><label>Catatan evaluator<textarea defaultValue="Catatan TEST dengan konteks periode dan sumber." rows={4} /></label><button className="button button--primary" onClick={() => setSubmitted(true)} type="button">{submitted ? "Tersimpan sebagai draft TEST" : "Simpan draft evaluasi"}</button><p className="editor-note">Data yang belum ada dibedakan dari nilai nol. Perbandingan lintas divisi menunggu policy.</p></aside></section> : <section className="knowledge-layout"><div className="knowledge-list">{articles.map((article) => <article className="knowledge-row" key={article.code}><div><p className="eyebrow">{article.code} · {article.type}</p><h2>{article.title}</h2><p>{article.source} · Sumber dan versi ditampilkan saat dibuka.</p></div><span className="status-chip">{article.status}</span></article>)}</div><aside className="knowledge-detail"><p className="eyebrow">K02–K03 · Artikel & sumber</p><h2>Panel sitasi</h2><p>Artikel menampilkan isi, versi, sumber, linked records, dan tanda kedaluwarsa. Jika akses sumber hilang, judulnya tidak dibocorkan.</p><div className="citation-row"><span>Sumber TEST · v1</span><span className="status-chip">Akses diperiksa</span></div><button className="button button--quiet" type="button">Tulis artikel TEST</button></aside></section>}<p className="task-footnote">Data sintetis TEST · formula resmi, rubrik, koreksi, dan taxonomy knowledge menunggu keputusan KPI.</p></>;
}
