"use client";

import { useState } from "react";
import { ActivityTimeline } from "@/components/portal/activity-timeline";
import { apiJson, usePortalResource } from "@/components/portal/api-client";

type Article = { id: string; title: string; summary?: string; body?: string; sourceLocator?: string; version: number; sourceAssetId: string; sourceVersion?: number; authorAccountId?: string; previousArticleId?: string; status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED"; updatedAt: string };
type Asset = { id: string; fileName: string; version: number; status: string; contentSha256?: string };

export function KnowledgeWorkspace({ accountId, canWrite, canReview }: { accountId: string; canWrite: boolean; canReview: boolean }): React.JSX.Element {
  const articles = usePortalResource<Article>("/api/v1/knowledge", "articles");
  const assets = usePortalResource<Asset>("/api/v1/documents", "assets");
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [sourceLocator, setSourceLocator] = useState("");
  const [sourceAssetId, setSourceAssetId] = useState("");
  const [revisionOfId, setRevisionOfId] = useState("");
  const [archiveReason, setArchiveReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const visible = articles.items.filter((item) => `${item.title} ${item.summary ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0];
  const source = selected ? assets.items.find((item) => item.id === selected.sourceAssetId) : undefined;

  async function act(body: unknown, success: string): Promise<void> {
    setBusy(true); setMessage("");
    try {
      const result = await apiJson<{ article: Article }>("/api/v1/knowledge/action", body);
      setSelectedId(result.article.id); setQuery(""); setMessage(success);
      if (["CREATE", "CREATE_REVISION"].includes((body as { action: string }).action)) { setTitle(""); setSummary(""); setBody(""); setSourceLocator(""); setRevisionOfId(""); }
      await articles.reload();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Perubahan rujukan gagal."); }
    finally { setBusy(false); }
  }

  return <>
    {message && <p className="form-message" role="status">{message}</p>}
    <section className="editor-filters"><label>Cari rujukan<input type="search" placeholder="Judul atau ringkasan" value={query} onChange={(event) => setQuery(event.target.value)} /></label><span>{visible.length} rujukan dapat diakses</span></section>
    {articles.loading && <p role="status">Memuat knowledge…</p>}{articles.error && <p role="alert">{articles.error} <button onClick={() => void articles.reload()} type="button">Coba lagi</button></p>}
    <section className="knowledge-layout"><div className="knowledge-list" aria-label="Daftar knowledge">{!articles.loading && !articles.error && visible.length === 0 && <p>Tidak ada rujukan yang cocok atau dapat diakses.</p>}{visible.map((item) => <button className={`knowledge-row ${item.id === selected?.id ? "is-selected" : ""}`} key={item.id} onClick={() => setSelectedId(item.id)} type="button"><strong>{item.title}</strong><span className="status-chip">{{ DRAFT: "Draf", IN_REVIEW: "Menunggu telaah", PUBLISHED: "Terbit", ARCHIVED: "Arsip" }[item.status]} · v{item.version}</span></button>)}</div><aside className="knowledge-detail"><p className="eyebrow">Detail rujukan</p>{selected ? <><h2>{selected.title}</h2><p>{selected.summary ?? "Ringkasan belum tersedia."}</p>{selected.body && <div className="knowledge-detail__body">{selected.body}</div>}{selected.sourceLocator && <p className="editor-note">Rujukan: {selected.sourceLocator} · versi sumber {selected.sourceVersion ?? "tidak diketahui"}</p>}<div className="version-line"><strong>Sumber</strong><span>{source?.fileName ?? selected.sourceAssetId.slice(0, 8)}</span></div><div className="version-line"><strong>Versi sumber tercatat</strong><span>{selected.sourceVersion ? `v${selected.sourceVersion}` : "Belum tercatat"}</span></div>{source?.contentSha256 && source.status === "AVAILABLE" && source.version === selected.sourceVersion ? <a className="button button--quiet" href={`/api/v1/documents/file?id=${encodeURIComponent(source.id)}`} target="_blank" rel="noopener noreferrer">Buka sumber v{source.version}</a> : <p className="editor-note">Berkas sumber belum dapat dibuka; rujukan hanya menampilkan metadata. Izin diperiksa ulang saat berkas dibuka.</p>}{canWrite && selected.authorAccountId === accountId && selected.status === "DRAFT" && <button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "SUBMIT", articleId: selected.id }, "Rujukan dikirim untuk ditelaah.")} type="button">Kirim untuk telaah</button>}{canReview && selected.authorAccountId !== accountId && selected.status === "IN_REVIEW" && <button className="button button--primary" disabled={busy} onClick={() => void act({ action: "PUBLISH", articleId: selected.id }, "Rujukan diterbitkan setelah telaah.")} type="button">Setujui dan terbitkan</button>}{canReview && selected.status === "PUBLISHED" && <div className="editor-edit"><label>Alasan arsip<input maxLength={500} minLength={10} onChange={(event) => setArchiveReason(event.target.value)} value={archiveReason} /></label><button className="button button--quiet" disabled={busy || archiveReason.trim().length < 10} onClick={() => void act({ action: "ARCHIVE", articleId: selected.id, reason: archiveReason }, "Rujukan diarsipkan.")} type="button">Arsipkan rujukan</button></div>}{canWrite && selected.authorAccountId === accountId && (selected.status === "PUBLISHED" || selected.status === "ARCHIVED") && <button className="button button--quiet" onClick={() => { setRevisionOfId(selected.id); setTitle(selected.title); setSummary(selected.summary ?? ""); setBody(selected.body ?? ""); setSourceLocator(selected.sourceLocator ?? ""); setSourceAssetId(selected.sourceAssetId); }} type="button">Buat versi baru</button>}<ActivityTimeline key={`${selected.id}:${selected.status}`} type="knowledge" id={selected.id} /></> : <p>Pilih rujukan untuk melihat asal dan statusnya.</p>}
      {canWrite && <div className="editor-edit"><h3>{revisionOfId ? "Versi baru rujukan" : "Buat rujukan pratinjau"}</h3>{revisionOfId && <button className="button button--quiet" onClick={() => setRevisionOfId("")} type="button">Batal revisi</button>}<label>Judul<input maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Ringkasan<textarea maxLength={2000} rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} /></label><label>Isi artikel<textarea maxLength={20000} rows={10} value={body} onChange={(event) => setBody(event.target.value)} /></label><label>Bagian sumber (halaman/bab)<input maxLength={240} value={sourceLocator} onChange={(event) => setSourceLocator(event.target.value)} placeholder="Contoh: Bab II, halaman 12" /></label><label>Sumber tersedia<select value={sourceAssetId} onChange={(event) => setSourceAssetId(event.target.value)}><option value="">Pilih aset</option>{assets.items.filter((item) => item.status === "AVAILABLE").map((item) => <option key={item.id} value={item.id}>{item.fileName} · v{item.version}</option>)}</select></label><button className="button button--primary" disabled={busy || title.trim().length < 3 || summary.trim().length < 10 || body.trim().length < 30 || sourceLocator.trim().length < 2 || !sourceAssetId} onClick={() => void act(revisionOfId ? { action: "CREATE_REVISION", previousArticleId: revisionOfId, title, summary, body, sourceLocator, sourceAssetId } : { action: "CREATE", title, summary, body, sourceLocator, sourceAssetId }, "Draf rujukan pratinjau dibuat.")} type="button">{revisionOfId ? "Simpan versi baru" : "Simpan rujukan"}</button></div>}</aside></section>
    <p className="task-footnote">Isi artikel pratinjau harus ditelaah dan selalu terikat ke versi serta bagian sumber yang dapat diakses. Naskah resmi masih menunggu dokumen KPI.</p>
  </>;
}
