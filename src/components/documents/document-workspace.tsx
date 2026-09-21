"use client";

import { ChangeEvent, useState } from "react";

type UploadState = "idle" | "checking" | "available" | "quarantined";

const testDocuments = [
  { name: "Panduan kerja pengurus · TEST.pdf", meta: "PDF · 2.4 MB · Internal", status: "Available" },
  { name: "Notulen rapat persiapan · TEST.docx", meta: "DOCX · 840 KB · Restricted", status: "Available" },
  { name: "Lampiran belum diperiksa · TEST.zip", meta: "ZIP · 4.1 MB · Checking", status: "Checking" }
];

export function DocumentWorkspace(): React.JSX.Element {
  const [selectedFile, setSelectedFile] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>("idle");

  function selectFile(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file.name);
    setUploadState("idle");
  }

  function simulateCheck(): void {
    if (!selectedFile) return;
    setUploadState("checking");
    window.setTimeout(() => setUploadState(selectedFile.toLowerCase().endsWith(".exe") ? "quarantined" : "available"), 650);
  }

  const uploadLabel = uploadState === "checking" ? "Memeriksa file…" : uploadState === "available" ? "File tersedia di TEST" : uploadState === "quarantined" ? "File masuk quarantine" : "Pilih file TEST";

  return <>
    <section className="document-toolbar" aria-label="Filter pustaka dokumen"><div><p className="eyebrow">F01 · Library</p><h2>Pustaka dokumen</h2></div><label className="search-field"><span className="sr-only">Cari dokumen</span><input placeholder="Cari judul atau tag" type="search" /></label><select aria-label="Filter klasifikasi" defaultValue="all"><option value="all">Semua klasifikasi</option><option value="internal">Internal</option><option value="restricted">Restricted</option></select></section>
    <section className="document-layout">
      <div className="document-list" aria-label="Daftar dokumen TEST">{testDocuments.map((document) => <article className="document-row" key={document.name}><div><h3>{document.name}</h3><p>{document.meta}</p></div><span className={`status-chip status-chip--${document.status.toLowerCase()}`}>{document.status}</span><button className="row-action" type="button">Detail</button></article>)}</div>
      <aside className="upload-panel" aria-labelledby="upload-title"><p className="eyebrow">F02 · Upload & checking</p><h2 id="upload-title">Tambahkan berkas TEST</h2><p>File tidak menjadi bukti tersimpan sebelum pemeriksaan selesai. Batas baseline 25 MB; file executable ditolak.</p><label className="file-drop"><input accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.zip" onChange={selectFile} type="file" />{selectedFile || uploadLabel}</label><button className="button button--primary" disabled={!selectedFile || uploadState === "checking"} onClick={simulateCheck} type="button">{uploadState === "checking" ? "Memeriksa…" : "Simulasikan pemeriksaan"}</button>{uploadState === "available" ? <p className="form-success" role="status">Pemeriksaan selesai. File TEST tersedia sebagai versi baru.</p> : null}{uploadState === "quarantined" ? <p className="form-message" role="alert">File ditahan di quarantine. Tidak dapat dipakai sebagai bukti.</p> : null}</aside>
    </section>
    <section className="document-detail-grid"><article className="detail-panel"><p className="eyebrow">F03 · Detail & versi</p><h2>Versi tetap dapat dilacak</h2><p>Versi aktif, versi sebelumnya, sumber, dan histori pemeriksaan tampil bersama. Versi baru yang gagal tidak menggantikan versi aktif.</p><div className="version-line"><strong>v1 · Aktif</strong><span>Disimpan sebagai TEST</span></div><div className="version-line"><strong>v2 · Menunggu</strong><span>Belum tersedia untuk bukti</span></div></article><article className="detail-panel"><p className="eyebrow">F04–F06 · Sharing & audit</p><h2>Akses berbagi punya batas</h2><p>Penerima, izin baca/unduh, expiry, klasifikasi, pencabutan, dan access log akan ditampilkan sebelum aksi disimpan.</p><div className="permission-line"><span>Pengurus divisi · baca</span><span className="status-chip">TEST preview</span></div><div className="permission-line"><span>Link berbagi · kedaluwarsa</span><span className="status-chip">Belum aktif</span></div></article></section>
  </>;
}
