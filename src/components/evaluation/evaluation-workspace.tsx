"use client";

import { useState } from "react";
import Link from "next/link";
import { apiJson, usePortalResource } from "@/components/portal/api-client";

type Evaluation = { id: string; subjectAccountId: string; indicator: string; value: number | null; formulaVersion: string; evidenceAssetIds: string[]; status: "DRAFT" | "REVIEWED" | "CORRECTED"; updatedAt: string };
type Article = { id: string; title: string; version: number; sourceAssetId: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" };
type Appeal = { id: string; evaluationId: string; reason: string; status: "OPEN" | "RESOLVED"; resolution?: string };
type Revision = { id: string; version: number; value: number | null; reason: string; kind: string; createdAt: string };
type Asset = { id: string; fileName: string; status: string };
type ReportRow = { evaluationId: string; indicator: string; value: number | null; formulaVersion: string; revisionId: string | null; evidence: { assetId: string; version: number; accessible: boolean }[]; readiness: "READY" | "UNREVIEWED" | "MISSING_VALUE" | "OPEN_APPEAL" | "SOURCE_UNAVAILABLE" };
const readinessLabels: Record<ReportRow["readiness"], string> = { READY: "Siap ditelaah", UNREVIEWED: "Belum ditinjau", MISSING_VALUE: "Nilai belum tersedia", OPEN_APPEAL: "Ada sanggah terbuka", SOURCE_UNAVAILABLE: "Bukti tidak tersedia" };

export function EvaluationWorkspace({ accountId, canEvaluate, canWriteKnowledge }: { accountId: string; canEvaluate: boolean; canWriteKnowledge: boolean }): React.JSX.Element {
  const evaluations = usePortalResource<Evaluation>("/api/v1/evaluations", "evaluations");
  const articles = usePortalResource<Article>("/api/v1/knowledge", "articles");
  const appeals = usePortalResource<Appeal>("/api/v1/evaluations/appeals", "appeals");
  const assets = usePortalResource<Asset>("/api/v1/documents", "assets");
  const report = usePortalResource<ReportRow>("/api/v1/evaluations/report", "rows");
  const [tab, setTab] = useState<"performance" | "knowledge">("performance");
  const [selectedId, setSelectedId] = useState("");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [evidenceAssetId, setEvidenceAssetId] = useState("");
  const [resolution, setResolution] = useState("");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const visible = evaluations.items.filter((item) => (statusFilter === "ALL" || item.status === statusFilter) && item.indicator.toLowerCase().includes(search.toLowerCase()));
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0];
  const selectedAppeal = appeals.items.find((item) => item.evaluationId === selected?.id && item.status === "OPEN");
  const availableAssets = assets.items.filter((item) => item.status === "AVAILABLE");

  async function act(url: string, body: unknown, success: string): Promise<void> {
    setBusy(true); setMessage("");
    try {
      await apiJson(url, body);
      setMessage(success);
      await Promise.all([evaluations.reload(), articles.reload(), appeals.reload(), report.reload()]);
      if (selected) await loadRevisions(selected.id);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Perubahan gagal disimpan."); }
    finally { setBusy(false); }
  }

  async function loadRevisions(id: string): Promise<void> {
    try { setRevisions((await apiJson<{ revisions: Revision[] }>(`/api/v1/evaluations/revisions?evaluationId=${encodeURIComponent(id)}`)).revisions); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Riwayat gagal dimuat."); }
  }

  return <>
    <section className="case-tabs" aria-label="Area evaluasi"><button className={tab === "performance" ? "is-active" : ""} onClick={() => setTab("performance")} type="button">Kinerja</button><button className={tab === "knowledge" ? "is-active" : ""} onClick={() => setTab("knowledge")} type="button">Knowledge base</button></section>
    {message && <p className="form-message" role="status">{message}</p>}
    {tab === "performance" ? <>
      <section className="finance-summary" aria-label="Ringkasan evaluasi pratinjau"><div><span className="finance-summary__label">Indikator</span><strong>{evaluations.items.length}</strong><small>Periode pratinjau</small></div><div><span className="finance-summary__label">Belum dinilai</span><strong>{evaluations.items.filter((item) => item.value === null).length}</strong><small>Berbeda dari nilai nol</small></div><div><span className="finance-summary__label">Sudah ditinjau</span><strong>{evaluations.items.filter((item) => item.status !== "DRAFT").length}</strong><small>Belum nilai resmi</small></div><div><span className="finance-summary__label">Sanggah terbuka</span><strong>{appeals.items.filter((item) => item.status === "OPEN").length}</strong><small>Perlu keputusan</small></div></section>
      <section className="score-report" aria-label="Pratinjau laporan evaluasi"><div><p className="eyebrow">Laporan evaluasi · pratinjau</p><h2>Nilai dan sumbernya</h2><p>Setiap baris menampilkan formula, revisi, dan keadaan bukti. Ini belum menjadi penetapan nilai resmi KPI.</p></div>{report.error && <p role="alert">{report.error}</p>}{report.items.length === 0 && !report.loading && !report.error && <p>Belum ada indikator pada periode ini.</p>}<div className="score-report__rows">{report.items.map((row) => <div className="score-report__row" key={row.evaluationId}><strong>{row.indicator}</strong><span>{row.value ?? "—"}</span><span>{readinessLabels[row.readiness]}</span><small>{row.formulaVersion} · revisi {row.revisionId?.slice(0, 8) ?? "belum ada"} · {row.evidence.length} bukti</small></div>)}</div></section>
      <div className="governance-filters"><label>Cari indikator<input onChange={(event) => setSearch(event.target.value)} placeholder="Nama indikator" type="search" value={search} /></label><label>Status<select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="ALL">Semua status</option><option value="DRAFT">Draf</option><option value="REVIEWED">Ditinjau</option><option value="CORRECTED">Dikoreksi</option></select></label><span>{visible.length} indikator</span></div>
      {evaluations.loading && <p role="status">Memuat evaluasi…</p>}{evaluations.error && <p role="alert">{evaluations.error} <button onClick={() => void evaluations.reload()} type="button">Coba lagi</button></p>}{!evaluations.loading && !evaluations.error && visible.length === 0 && <p>{evaluations.items.length ? "Tidak ada indikator untuk filter ini." : "Belum ada evaluasi pratinjau."}</p>}
      {selected && <section className="evaluation-layout"><div className="score-list" aria-label="Indikator evaluasi">{visible.map((item) => <button className={`score-row ${selected.id === item.id ? "score-row--selected" : ""}`} key={item.id} onClick={() => { setSelectedId(item.id); setValue(item.value?.toString() ?? ""); setReason(""); setRevisions([]); setMessage(""); }} type="button"><span className="workspace-card__number">{item.id.slice(0, 8)}</span><strong>{item.indicator}</strong><span>{item.value ?? "Belum dinilai"}</span><span className="status-chip">{item.status}</span></button>)}</div><aside className="score-detail"><p className="eyebrow">Evaluasi & koreksi</p><h2>{selected.indicator}</h2><p>Formula {selected.formulaVersion} · {selected.evidenceAssetIds.length} bukti · diperbarui {new Date(selected.updatedAt).toLocaleString("id-ID")}</p><div className="score-value"><span>Nilai saat ini</span><strong>{selected.value ?? "Belum ada"}</strong><small>{selected.status}</small></div>
        {canEvaluate && selected.subjectAccountId !== accountId && <><label>Nilai baru <input inputMode="decimal" onChange={(event) => setValue(event.target.value)} placeholder="Kosong = belum tersedia" type="number" value={value} /></label><label>Alasan peninjauan <textarea maxLength={500} onChange={(event) => setReason(event.target.value)} rows={3} value={reason} /></label><label>Bukti tersedia <select onChange={(event) => setEvidenceAssetId(event.target.value)} value={evidenceAssetId}><option value="">Tanpa bukti baru</option>{availableAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.fileName}</option>)}</select></label><button className="button button--primary" disabled={busy || reason.trim().length < 10} onClick={() => void act("/api/v1/evaluations/review", { evaluationId: selected.id, value: value.trim() === "" ? null : Number(value), evidenceAssetIds: evidenceAssetId ? [evidenceAssetId] : selected.evidenceAssetIds, reason }, "Peninjauan evaluasi tersimpan.")} type="button">Simpan peninjauan</button></>}
        {selected.subjectAccountId === accountId && selected.status !== "DRAFT" && !selectedAppeal && <><label>Alasan sanggah <textarea maxLength={1000} onChange={(event) => setReason(event.target.value)} rows={3} value={reason} /></label><button className="button button--quiet" disabled={busy || reason.trim().length < 10} onClick={() => void act("/api/v1/evaluations/appeals", { action: "SUBMIT", evaluationId: selected.id, reason }, "Sanggah tercatat.")} type="button">Ajukan sanggah</button></>}
        {selectedAppeal && <div className="task-detail__section"><strong>Sanggah terbuka</strong><p>{selectedAppeal.reason}</p>{canEvaluate && <><label>Keputusan sanggah <textarea maxLength={1000} onChange={(event) => setResolution(event.target.value)} rows={3} value={resolution} /></label><button className="button button--quiet" disabled={busy || resolution.trim().length < 10} onClick={() => void act("/api/v1/evaluations/appeals", { action: "RESOLVE", appealId: selectedAppeal.id, resolution }, "Sanggah diselesaikan.")} type="button">Selesaikan sanggah</button></>}</div>}
        <button className="button button--quiet" onClick={() => void loadRevisions(selected.id)} type="button">Lihat riwayat revisi</button>{revisions.map((revision) => <p key={revision.id}>v{revision.version} · {revision.kind} · {revision.value ?? "kosong"} · {revision.reason}</p>)}
      </aside></section>}
    </> : <>
      {articles.loading && <p role="status">Memuat knowledge…</p>}{articles.error && <p role="alert">{articles.error} <button onClick={() => void articles.reload()} type="button">Coba lagi</button></p>}{!articles.loading && !articles.error && articles.items.length === 0 && <p>Belum ada artikel yang dapat diakses.</p>}
      <section className="knowledge-layout"><div className="knowledge-list">{articles.items.map((article) => <article className="knowledge-row" key={article.id}><div><p className="eyebrow">Versi {article.version} · {article.status}</p><h2>{article.title}</h2><p>Sumber aset: {article.sourceAssetId.slice(0, 8)}</p></div></article>)}</div><aside className="knowledge-detail"><p className="eyebrow">Artikel & sumber</p><h2>Kelola di ruang knowledge</h2><p>Penulisan, telaah, dan penerbitan rujukan dilakukan dalam satu alur agar versi serta izin sumber tetap konsisten.</p><Link className="button button--primary" href="/portal/knowledge">Buka knowledge</Link></aside></section>
    </>}
    <p className="task-footnote">Data sintetis pratinjau. Formula resmi, rubrik, dan taksonomi knowledge menunggu keputusan KPI.</p>
  </>;
}
