"use client";

import { useEffect, useState } from "react";
import { ActivityTimeline } from "@/components/portal/activity-timeline";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import type { AssetRecord } from "@/platform/storage/asset-repository";

type ContentState = "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
type Publication = { id: string; title: string; description: string; body?: string; slug: string; type: string; meta: string; href: string; locale: "id" | "en"; state: ContentState; version: number; authorAccountId: string; mediaAssetId?: string };
type Revision = { id: string; version: number; recordedAt: string; snapshot: Publication };
const labels: Record<ContentState, string> = { DRAFT: "Draf", IN_REVIEW: "Menunggu review", CHANGES_REQUESTED: "Perlu revisi", APPROVED: "Disetujui", PUBLISHED: "Terbit", ARCHIVED: "Arsip" };

export function EditorWorkspace({ accountId, canDraft, canReview, canPublish }: { accountId: string; canDraft: boolean; canReview: boolean; canPublish: boolean }): React.JSX.Element {
  const records = usePortalResource<Publication>("/api/v1/editor/publications", "records");
  const media = usePortalResource<AssetRecord>("/api/v1/documents", "assets");
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [slug, setSlug] = useState("");
  const [locale, setLocale] = useState<"id" | "en">("id");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBody, setEditBody] = useState("");
  const [reason, setReason] = useState("");
  const [mediaAssetId, setMediaAssetId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [revisionError, setRevisionError] = useState("");
  const visible = records.items.filter((item) => (filter === "all" || item.state === filter) && `${item.title} ${item.slug}`.toLowerCase().includes(query.toLowerCase()));
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0];
  useEffect(() => { if (selected) { setEditTitle(selected.title); setEditDescription(selected.description); setEditBody(selected.body ?? ""); setMediaAssetId(selected.mediaAssetId ?? ""); } }, [selected?.id, selected?.version]);
  useEffect(() => {
    if (!selected) { setRevisions([]); return; }
    let active = true;
    setRevisionError("");
    void apiJson<{ revisions: Revision[] }>(`/api/v1/editor/publications?contentId=${encodeURIComponent(selected.id)}`)
      .then((result) => { if (active) setRevisions(result.revisions); })
      .catch((cause) => { if (active) setRevisionError(cause instanceof Error ? cause.message : "Riwayat versi gagal dimuat."); });
    return () => { active = false; };
  }, [selected?.id, selected?.version]);

  async function act(url: string, body: unknown, success: string): Promise<void> {
    setBusy(true); setMessage("");
    try {
      const result = await apiJson<{ record?: Publication }>(url, body);
      if (result.record) { setSelectedId(result.record.id); setFilter("all"); setQuery(""); }
      setMessage(success); setReason("");
      await records.reload();
      if (url === "/api/v1/editor/publications") { setTitle(""); setDescription(""); setBody(""); setSlug(""); }
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Perubahan konten gagal."); }
    finally { setBusy(false); }
  }

  const actions: Array<{ state: ContentState; label: string; allowed: boolean; needsReason?: boolean }> = selected ? [
    { state: "DRAFT", label: "Kembali ke draf", allowed: canDraft && selected.state === "CHANGES_REQUESTED" },
    { state: "IN_REVIEW", label: "Ajukan review", allowed: canDraft && selected.state === "DRAFT" && selected.authorAccountId === accountId },
    { state: "CHANGES_REQUESTED", label: "Minta revisi", allowed: canReview && selected.state === "IN_REVIEW" && selected.authorAccountId !== accountId, needsReason: true },
    { state: "APPROVED", label: "Setujui", allowed: canReview && selected.state === "IN_REVIEW" && selected.authorAccountId !== accountId },
    { state: "PUBLISHED", label: "Terbitkan", allowed: canPublish && selected.state === "APPROVED" },
    { state: "ARCHIVED", label: "Arsipkan", allowed: canDraft && ["DRAFT", "CHANGES_REQUESTED", "APPROVED", "PUBLISHED"].includes(selected.state), needsReason: true }
  ] : [];

  return <>
    {message && <p className="form-message" role="status">{message}</p>}{records.loading && <p role="status">Memuat konten…</p>}{records.error && <p role="alert">{records.error} <button onClick={() => void records.reload()} type="button">Coba lagi</button></p>}
    <section className="editor-filters" aria-label="Filter redaksi"><label>Cari naskah<input type="search" placeholder="Judul atau slug" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>Status<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Semua status</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></section>
    <section className="editor-layout"><article className="editor-canvas"><p className="eyebrow">Daftar naskah</p>{!records.loading && !records.error && visible.length === 0 && <p>Belum ada naskah untuk filter ini.</p>}{visible.map((item) => <button className={`knowledge-row ${item.id === selected?.id ? "is-selected" : ""}`} key={item.id} onClick={() => { setSelectedId(item.id); setMessage(""); }} type="button"><strong>{item.title}</strong><span className="status-chip">{labels[item.state]} · v{item.version}</span></button>)}
      {selected && <section className="editor-detail"><p className="eyebrow">Detail & pratinjau internal</p><h2>{selected.title}</h2><nav className="editor-locale-tabs" aria-label="Bahasa pratinjau">{records.items.filter((item) => item.slug === selected.slug).map((item) => <button className={`button ${item.id === selected.id ? "button--primary" : "button--quiet"}`} key={item.id} onClick={() => { setFilter("all"); setQuery(""); setSelectedId(item.id); }} type="button">{item.locale === "id" ? "Indonesia" : "English"}</button>)}</nav><p>{selected.description}</p>{selected.body && <div className="editor-body-preview">{selected.body.split("\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>}<p className="editor-note">{selected.locale.toUpperCase()} · /{selected.slug} · {selected.type} · v{selected.version}</p><p className="editor-note">Pratinjau ini hanya di portal. Situs publik membaca konten berstatus terbit.</p>
        {canDraft && selected.authorAccountId === accountId && ["DRAFT", "CHANGES_REQUESTED"].includes(selected.state) && <div className="editor-edit"><h3>Revisi naskah</h3><label>Judul<input maxLength={180} value={editTitle} onChange={(event) => setEditTitle(event.target.value)} /></label><label>Deskripsi<textarea maxLength={2000} rows={4} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} /></label><label>Isi artikel<textarea maxLength={20000} rows={10} value={editBody} onChange={(event) => setEditBody(event.target.value)} /></label><button className="button button--quiet" disabled={busy || editTitle.trim().length < 3 || editDescription.trim().length < 10 || editBody.trim().length < 30 || editTitle === selected.title && editDescription === selected.description && editBody === (selected.body ?? "")} onClick={() => void act("/api/v1/editor/publications/update", { contentId: selected.id, expectedVersion: selected.version, title: editTitle, description: editDescription, body: editBody }, "Revisi draf tersimpan.")} type="button">Simpan revisi</button></div>}
        {canDraft && selected.authorAccountId === accountId && ["DRAFT", "CHANGES_REQUESTED"].includes(selected.state) && <div className="editor-edit"><h3>Media naskah</h3><p>Hanya gambar yang lulus pemeriksaan file dapat dihubungkan ke versi draf.</p><label>Pilih gambar<select value={mediaAssetId} onChange={(event) => setMediaAssetId(event.target.value)}><option value="">Tanpa media</option>{media.items.filter((asset) => asset.status === "AVAILABLE" && !!asset.contentSha256 && ["image/png", "image/jpeg"].includes(asset.mimeType)).map((asset) => <option key={asset.id} value={asset.id}>{asset.fileName} · v{asset.version}</option>)}</select></label><button className="button button--quiet" disabled={busy || mediaAssetId === (selected.mediaAssetId ?? "")} onClick={() => void act("/api/v1/editor/publications/media", { contentId: selected.id, expectedVersion: selected.version, mediaAssetId: mediaAssetId || null }, "Media draf diperbarui.")} type="button">Simpan media</button></div>}
        {actions.some((action) => action.allowed && action.needsReason) && <label>Alasan revisi atau arsip<textarea maxLength={500} rows={2} value={reason} onChange={(event) => setReason(event.target.value)} /></label>}
        <div className="task-detail__actions">{actions.filter((action) => action.allowed).map((action) => <button className={`button ${action.state === "PUBLISHED" ? "button--primary" : "button--quiet"}`} disabled={busy || !!action.needsReason && !reason.trim()} key={action.state} onClick={() => void act("/api/v1/editor/publications/transition", { contentId: selected.id, targetState: action.state, reason: action.needsReason ? reason : undefined }, `Status berubah: ${labels[action.state]}.`)} type="button">{action.label}</button>)}</div><section className="editor-revisions" aria-label="Riwayat versi naskah"><h3>Versi tersimpan</h3>{revisionError && <p role="alert">{revisionError}</p>}{revisions.map((revision) => <details key={revision.id}><summary>v{revision.version} · {labels[revision.snapshot.state]} · {new Date(revision.recordedAt).toLocaleString("id-ID")}</summary><h4>{revision.snapshot.title}</h4><p>{revision.snapshot.description}</p>{revision.snapshot.body ? <div className="editor-body-preview">{revision.snapshot.body.split("\n").filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div> : <p>Versi lama ini belum memiliki isi artikel.</p>}</details>)}</section><ActivityTimeline key={`${selected.id}:${selected.version}`} type="content" id={selected.id} /></section>}
    </article><aside className="editor-sidebar"><p className="eyebrow">Buat draf pratinjau</p><h2>Ringkasan publikasi</h2>{canDraft ? <><label>Judul<input maxLength={180} onChange={(event) => setTitle(event.target.value)} value={title} /></label><label>Deskripsi<textarea maxLength={2000} onChange={(event) => setDescription(event.target.value)} rows={5} value={description} /></label><label>Isi artikel<textarea maxLength={20000} onChange={(event) => setBody(event.target.value)} rows={10} value={body} /></label><label>Slug<input maxLength={120} onChange={(event) => setSlug(event.target.value)} pattern="[a-z0-9-]+" value={slug} /></label><label>Bahasa<select onChange={(event) => setLocale(event.target.value as "id" | "en")} value={locale}><option value="id">Indonesia</option><option value="en">English</option></select></label><button className="button button--primary" disabled={busy || title.trim().length < 3 || description.trim().length < 10 || body.trim().length < 30 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)} onClick={() => void act("/api/v1/editor/publications", { title, description, body, slug, locale, type: "Informasi", meta: "KPI pratinjau", href: "/publik/publikasi", accent: "red" }, "Draf konten dibuat.")} type="button">Simpan draf</button></> : <p>Akun ini hanya dapat meninjau sesuai izin yang diberikan.</p>}<p className="editor-note">Draf artikel disimpan per bahasa. Media resmi tetap menunggu aset yang lulus pemeriksaan.</p></aside></section>
  </>;
}
