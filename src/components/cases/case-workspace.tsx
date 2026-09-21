"use client";

import { useState } from "react";

type CaseStatus = "New" | "In triage" | "Waiting reporter" | "Closed";
type CaseItem = { id: string; subject: string; category: string; urgency: string; status: CaseStatus; owner: string; updated: string };
const initialCases: CaseItem[] = [
  { id: "CASE-TEST-01", subject: "Permintaan informasi program", category: "Pertanyaan", urgency: "Normal", status: "New", owner: "Belum ditugaskan", updated: "Baru saja" },
  { id: "CASE-TEST-02", subject: "Koreksi tautan publikasi", category: "Saran", urgency: "Normal", status: "In triage", owner: "Tim konten TEST", updated: "Hari ini" },
  { id: "CASE-TEST-03", subject: "Akses formulir tidak terbuka", category: "Pengaduan", urgency: "Tinggi", status: "Waiting reporter", owner: "Admin TEST", updated: "Kemarin" },
  { id: "CASE-TEST-04", subject: "Pertanyaan periode kerja", category: "Pertanyaan", urgency: "Rendah", status: "Closed", owner: "Tim layanan TEST", updated: "18 Sep 2026" }
];

export function CaseWorkspace(): React.JSX.Element {
  const [cases, setCases] = useState(initialCases);
  const [selectedId, setSelectedId] = useState(initialCases[0].id);
  const [tab, setTab] = useState<"cases" | "communications">("cases");
  const selected = cases.find((item) => item.id === selectedId) ?? cases[0];

  function advanceCase(): void {
    if (!selected) return;
    const next: CaseStatus = selected.status === "New" ? "In triage" : selected.status === "In triage" ? "Waiting reporter" : selected.status === "Waiting reporter" ? "Closed" : "Closed";
    setCases((current) => current.map((item) => item.id === selected.id ? { ...item, status: next, owner: item.owner === "Belum ditugaskan" ? "Petugas TEST" : item.owner, updated: "Baru saja" } : item));
  }

  return <>
    <section className="case-tabs" aria-label="Area layanan"><button className={tab === "cases" ? "is-active" : ""} onClick={() => setTab("cases")} type="button">Antrean kasus</button><button className={tab === "communications" ? "is-active" : ""} onClick={() => setTab("communications")} type="button">Komunikasi & notifikasi</button></section>
    {tab === "cases" ? <section className="case-layout"><div className="case-list" aria-label="Daftar kasus TEST">{cases.map((item) => <button className={`case-row ${item.id === selectedId ? "case-row--selected" : ""}`} key={item.id} onClick={() => setSelectedId(item.id)} type="button"><span className="case-row__id">{item.id}</span><strong>{item.subject}</strong><span className="case-row__meta">{item.category} · {item.urgency}</span><span className={`case-status case-status--${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</span></button>)}</div><aside className="case-detail" aria-label="Detail kasus"><div className="intro-panel__topline"><p className="eyebrow">S03–S04 · Triage & penanganan</p><span className="case-status case-status--in-triage">{selected.status}</span></div><h2>{selected.subject}</h2><p className="case-detail__meta">{selected.id} · {selected.category} · Urgensi {selected.urgency}</p><div className="case-assignment"><span>Penanggung jawab</span><strong>{selected.owner}</strong><span>Pembaruan terakhir</span><strong>{selected.updated}</strong></div><div className="case-block"><span className="eyebrow">Update untuk pelapor</span><textarea aria-label="Update untuk pelapor" defaultValue="Status TEST: laporan sedang ditinjau oleh petugas." rows={3} /></div><div className="case-block case-block--internal"><span className="eyebrow">Catatan internal</span><textarea aria-label="Catatan internal" defaultValue="Catatan internal TEST hanya terlihat oleh petugas berwenang." rows={3} /></div><div className="case-detail__actions"><button className="button button--primary" disabled={selected.status === "Closed"} onClick={advanceCase} type="button">{selected.status === "New" ? "Mulai triage TEST" : selected.status === "In triage" ? "Minta pembaruan TEST" : selected.status === "Waiting reporter" ? "Tutup kasus TEST" : "Kasus sudah ditutup"}</button><button className="button button--quiet" disabled={selected.status !== "Closed"} onClick={() => setCases((current) => current.map((item) => item.id === selected.id ? { ...item, status: "In triage", updated: "Dibuka ulang TEST" } : item))} type="button">Buka ulang dengan alasan</button></div></aside></section> : <CommunicationPanel />}
    <p className="task-footnote">Data sintetis TEST · catatan internal tidak boleh masuk ke update pelapor atau preview notifikasi.</p>
  </>;
}

function CommunicationPanel(): React.JSX.Element {
  const [sent, setSent] = useState(false);
  return <section className="communication-grid"><article className="communication-panel"><p className="eyebrow">S05–S06 · Pengumuman & kontak</p><h2>Preview pengumuman terarah</h2><label>Judul<input defaultValue="Pembaruan layanan · TEST" /></label><label>Target<select defaultValue="pengurus"><option value="pengurus">Pengurus TEST</option><option value="divisi">Divisi TEST</option></select></label><label>Isi<textarea defaultValue="Pesan ini hanya preview. Penerima dan isi final diperiksa sebelum dikirim." rows={4} /></label><button className="button button--primary" onClick={() => setSent(true)} type="button">{sent ? "Preview tersimpan TEST" : "Simpan preview TEST"}</button></article><article className="communication-panel"><p className="eyebrow">N01–N04 · Monitor pengiriman</p><h2>Status kanal</h2><div className="delivery-row"><span>In-app · wajib</span><span className="delivery-status">Ready TEST</span></div><div className="delivery-row"><span>Email · provider</span><span className="delivery-status delivery-status--muted">Belum dikonfigurasi</span></div><div className="delivery-row"><span>Retry terakhir</span><span className="delivery-status delivery-status--warn">Tidak ada</span></div><label className="check-field"><input type="checkbox" defaultChecked /> Jam tenang aktif di preview</label><p className="editor-note">Retry pengiriman harus idempotent dan tidak membuat siaran ganda.</p></article></section>;
}
