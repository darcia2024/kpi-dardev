"use client";

import { ChangeEvent, useState } from "react";
import type { AssetRecord } from "@/platform/storage/asset-repository";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import { ActivityTimeline } from "@/components/portal/activity-timeline";

export function DocumentWorkspace({ canUpload, accountId, recipients, initialSelectedId = "" }: { canUpload: boolean; accountId: string; recipients: { accountId: string; name: string }[]; initialSelectedId?: string }): React.JSX.Element {
  const { items: assets, loading, error, reload } = usePortalResource<AssetRecord>("/api/v1/documents", "assets");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [query, setQuery] = useState("");
  const [classification, setClassification] = useState("all");
  const [newClassification, setNewClassification] = useState<"INTERNAL" | "RESTRICTED">("INTERNAL");
  const [documentKeyOverride, setDocumentKeyOverride] = useState("");
  const [busy, setBusy] = useState(false);
  const [recipientAccountId, setRecipientAccountId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const selected = assets.find((asset) => asset.id === selectedId) ?? assets[0];
  const filtered = assets.filter((asset) =>
    (classification === "all" || asset.classification === classification) &&
    `${asset.fileName} ${asset.documentKey}`.toLowerCase().includes(query.toLowerCase())
  );

  function selectFile(event: ChangeEvent<HTMLInputElement>): void {
    setSelectedFile(event.target.files?.[0] ?? null);
    setMessage("");
    setActionError("");
  }

  async function uploadFile(): Promise<void> {
    if (!selectedFile) return;
    setBusy(true);
    setMessage("");
    setActionError("");
    try {
      const documentKey = documentKeyOverride || selectedFile.name.toLowerCase().replace(/\.[a-z0-9]+$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "berkas-test";
      const form = new FormData();
      form.set("file", selectedFile);
      form.set("documentKey", documentKey);
      form.set("classification", newClassification);
      const response = await fetch("/api/v1/documents/upload", { method: "POST", body: form, credentials: "same-origin" });
      if (!response.ok) throw new Error(response.status === 400 ? "Jenis atau ukuran berkas tidak didukung (maksimal 25 MB)." : `Unggahan gagal (${response.status}).`);
      const { asset } = await response.json() as { asset: AssetRecord };
      await reload();
      setSelectedId(asset.id);
      setMessage("File tersimpan privat. Status menunggu pemeriksaan; preview dan unduh belum tersedia.");
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "File gagal diunggah.");
    } finally {
      setBusy(false);
    }
  }

  async function changeAccess(action: "GRANT" | "REVOKE" | "ARCHIVE", target?: string): Promise<void> {
    if (!selected) return;
    setBusy(true); setMessage(""); setActionError("");
    try {
      await apiJson("/api/v1/documents/access", { action, id: selected.id, ...(action !== "ARCHIVE" ? { recipientAccountId: target ?? recipientAccountId } : {}), ...(action === "GRANT" ? { expiresAt: new Date(expiresAt).toISOString() } : {}) });
      await reload();
      setMessage(action === "GRANT" ? "Akses penerima tersimpan hingga batas waktu yang dipilih." : action === "REVOKE" ? "Akses penerima dicabut." : "Dokumen diarsipkan; akses file dicabut.");
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Perubahan akses gagal."); }
    finally { setBusy(false); }
  }

  return <>
    <section className="document-toolbar" aria-label="Filter pustaka dokumen">
      <div><p className="eyebrow">F01 · Library</p><h2>Pustaka dokumen</h2></div>
      <label className="search-field"><span className="sr-only">Cari dokumen</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul atau kata kunci" type="search" value={query} /></label>
      <select aria-label="Filter klasifikasi" onChange={(event) => setClassification(event.target.value)} value={classification}><option value="all">Semua klasifikasi</option><option value="INTERNAL">Internal</option><option value="RESTRICTED">Restricted</option></select>
    </section>
    <section className="document-layout">
      <div className="document-list" aria-label="Daftar metadata dokumen pratinjau">
        {loading ? <p role="status">Memuat dokumen…</p> : null}
        {error ? <p className="form-message" role="alert">{error} <button onClick={() => void reload()} type="button">Coba lagi</button></p> : null}
        {!loading && !error && filtered.length === 0 ? <p role="status">Tidak ada dokumen yang cocok.</p> : null}
        {filtered.map((asset) => <article className="document-row" key={asset.id}><div><h3>{asset.fileName}</h3><p>v{asset.version} · {asset.mimeType} · {(asset.sizeBytes / 1_000_000).toFixed(1)} MB · {asset.classification}</p></div><span className={`status-chip status-chip--${asset.status.toLowerCase()}`}>{asset.status}</span><button aria-label={`Lihat metadata ${asset.fileName}`} className="row-action" onClick={() => setSelectedId(asset.id)} type="button">Detail</button></article>)}
      </div>
      <aside className="upload-panel" aria-labelledby="upload-title">
        <p className="eyebrow">F02 · Unggah privat</p><h2 id="upload-title">Unggah dokumen</h2>
        <p>File disimpan di ruang privat lokal. Dokumen baru hanya dapat dibuka setelah pemeriksaan keamanan tersedia dan lulus.</p>
        {canUpload ? <><label className="file-drop"><input accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip" onChange={selectFile} type="file" />{selectedFile?.name ?? "Pilih berkas"}</label><label>Klasifikasi<select value={newClassification} onChange={(event) => setNewClassification(event.target.value as "INTERNAL" | "RESTRICTED")}><option value="INTERNAL">Internal</option><option value="RESTRICTED">Terbatas</option></select></label><label>Versi dari dokumen yang ada<select value={documentKeyOverride} onChange={(event) => setDocumentKeyOverride(event.target.value)}><option value="">Dokumen baru</option>{[...new Set(assets.map((asset) => asset.documentKey))].map((key) => <option key={key} value={key}>{key}</option>)}</select></label><button className="button button--primary" disabled={!selectedFile || busy} onClick={() => void uploadFile()} type="button">{busy ? "Mengunggah…" : "Unggah file"}</button></> : <p className="form-message" role="status">Akun ini hanya memiliki akses baca dokumen.</p>}
        {message ? <p className="form-success" role="status">{message}</p> : null}
        {actionError ? <p className="form-message" role="alert">{actionError}</p> : null}
      </aside>
    </section>
    {selected && <p className="editor-note">Versi berlaku untuk {selected.documentKey}: v{assets.filter((asset) => asset.documentKey === selected.documentKey && asset.status === "AVAILABLE").sort((a, b) => b.version - a.version)[0]?.version ?? "—"}. Versi menunggu pemeriksaan tidak menggantikan versi berlaku.</p>}
    <section className="document-detail-grid">
      <article className="detail-panel"><p className="eyebrow">F03 · Detail & versi</p><h2>{selected ? selected.fileName : "Pilih dokumen"}</h2>{selected ? <><p>Versi {selected.version} · {selected.classification} · {selected.status}</p><div className="version-line"><strong>Terdaftar</strong><span>{new Date(selected.createdAt).toLocaleString("id-ID")}</span></div><div className="version-line"><strong>Ukuran tercatat</strong><span>{(selected.sizeBytes / 1_000_000).toFixed(1)} MB</span></div><h3>Riwayat versi yang dapat diakses</h3><ol className="document-versions">{assets.filter((asset) => asset.documentKey === selected.documentKey).sort((a, b) => b.version - a.version).map((asset) => <li key={asset.id}><button type="button" onClick={() => setSelectedId(asset.id)}>v{asset.version} · {asset.fileName} · {asset.status}</button></li>)}</ol><ActivityTimeline key={selected.id} type="asset" id={selected.id} /></> : <p>Pilih “Detail” untuk melihat metadata dan status yang tersimpan di backend.</p>}</article>
      <article className="detail-panel"><p className="eyebrow">F04–F06 · Akses & audit</p><h2>Akses dokumen</h2><p>{selected?.status === "PENDING" ? "File tersimpan privat dan menunggu pemeriksaan. Akses byte tetap terkunci." : selected?.status === "AVAILABLE" && selected.contentSha256 ? "Dokumen tersedia sesuai izin akun." : "File belum dapat dibuka. Metadata saja tidak membuktikan file tersedia."}</p>{selected ? <><div className="permission-line"><span>Penerima aktif</span><strong>{selected.downloadAccountIds.filter((id) => !selected.downloadExpiresAt?.[id] || Date.parse(selected.downloadExpiresAt[id]) > Date.now()).length}</strong></div>{selected.status === "AVAILABLE" && selected.contentSha256 ? <p><a className="button button--quiet" href={`/api/v1/documents/file?id=${selected.id}`} rel="noopener noreferrer" target="_blank">Preview</a> <a className="button button--quiet" href={`/api/v1/documents/file?id=${selected.id}&download=1`}>Unduh</a></p> : null}{canUpload && selected.ownerAccountId === accountId && selected.status !== "REVOKED" ? <><h3>Berikan akses sementara</h3><label>Penerima<select value={recipientAccountId} onChange={(event) => setRecipientAccountId(event.target.value)}><option value="">Pilih akun</option>{recipients.filter((item) => item.accountId !== accountId).map((item) => <option key={item.accountId} value={item.accountId}>{item.name}</option>)}</select></label><label>Berlaku sampai<input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} /></label><button className="button button--quiet" disabled={busy || selected.status !== "AVAILABLE" || !recipientAccountId || !expiresAt} onClick={() => void changeAccess("GRANT")} type="button">Berikan akses</button><ul>{selected.downloadAccountIds.map((id) => <li key={id}>{recipients.find((item) => item.accountId === id)?.name ?? "Akun"} · {selected.downloadExpiresAt?.[id] ? new Date(selected.downloadExpiresAt[id]).toLocaleString("id-ID") : "tanpa batas waktu"} <button disabled={busy} onClick={() => void changeAccess("REVOKE", id)} type="button">Cabut</button></li>)}</ul><button className="button button--quiet" disabled={busy} onClick={() => void changeAccess("ARCHIVE")} type="button">Arsipkan dokumen</button></> : null}</> : null}</article>
    </section>
  </>;
}
