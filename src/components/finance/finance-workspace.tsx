"use client";

import { useState } from "react";

type FinanceStatus = "Draft" | "Waiting approval" | "Approved" | "Paid" | "Reconciled";
type FinanceItem = { id: string; title: string; amount: string; category: string; status: FinanceStatus; owner: string };
const initialItems: FinanceItem[] = [
  { id: "FIN-TEST-01", title: "Operasional kegiatan · TEST", amount: "EGP 12.500", category: "Anggaran", status: "Draft", owner: "Pengurus TEST" },
  { id: "FIN-TEST-02", title: "Penggantian transport · TEST", amount: "EGP 1.250", category: "Klaim", status: "Waiting approval", owner: "Reviewer 1 TEST" },
  { id: "FIN-TEST-03", title: "Uang muka acara · TEST", amount: "EGP 4.800", category: "Uang muka", status: "Approved", owner: "Reviewer 2 TEST" },
  { id: "FIN-TEST-04", title: "Rekonsiliasi periode awal · TEST", amount: "EGP 8.200", category: "Rekonsiliasi", status: "Reconciled", owner: "Auditor TEST" }
];

export function FinanceWorkspace(): React.JSX.Element {
  const [items, setItems] = useState(initialItems);
  const [selectedId, setSelectedId] = useState(initialItems[1].id);
  const [tab, setTab] = useState<"overview" | "approvals">("overview");
  const selected = items.find((item) => item.id === selectedId) ?? items[0];

  function advance(): void {
    if (!selected) return;
    const next: FinanceStatus = selected.status === "Draft" ? "Waiting approval" : selected.status === "Waiting approval" ? "Approved" : selected.status === "Approved" ? "Paid" : selected.status === "Paid" ? "Reconciled" : "Reconciled";
    setItems((current) => current.map((item) => item.id === selected.id ? { ...item, status: next } : item));
  }

  return <>
    <section className="finance-summary" aria-label="Ringkasan keuangan TEST"><div><span className="finance-summary__label">Anggaran versi</span><strong>v1 · TEST</strong><small>Belum dikunci</small></div><div><span className="finance-summary__label">Sisa anggaran</span><strong>EGP 31.450</strong><small>Simulasi TEST</small></div><div><span className="finance-summary__label">Menunggu approval</span><strong>{items.filter((item) => item.status === "Waiting approval").length}</strong><small>Dua reviewer diperlukan</small></div><div><span className="finance-summary__label">Reconciled</span><strong>{items.filter((item) => item.status === "Reconciled").length}</strong><small>Periode TEST</small></div></section>
    <section className="case-tabs" aria-label="Area keuangan"><button className={tab === "overview" ? "is-active" : ""} onClick={() => setTab("overview")} type="button">Siklus transaksi</button><button className={tab === "approvals" ? "is-active" : ""} onClick={() => setTab("approvals")} type="button">Approval & audit</button></section>
    {tab === "overview" ? <section className="finance-layout"><div className="finance-list" aria-label="Daftar transaksi TEST">{items.map((item) => <button className={`finance-row ${item.id === selectedId ? "finance-row--selected" : ""}`} key={item.id} onClick={() => setSelectedId(item.id)} type="button"><span className="finance-row__id">{item.id}<small>{item.category}</small></span><strong>{item.title}</strong><span>{item.amount}</span><span className={`finance-status finance-status--${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</span></button>)}</div><aside className="finance-detail" aria-label="Detail transaksi"><div className="intro-panel__topline"><p className="eyebrow">B02–B06 · Pengajuan</p><span className={`finance-status finance-status--${selected.status.toLowerCase().replaceAll(" ", "-")}`}>{selected.status}</span></div><h2>{selected.title}</h2><p className="finance-detail__meta">{selected.id} · {selected.category} · Pemilik {selected.owner}</p><div className="finance-amount"><span>Nilai TEST</span><strong>{selected.amount}</strong></div><div className="finance-checklist"><span>✓ Sumber dana ditandai</span><span>✓ Bukti pembayaran TEST</span><span>○ Rekonsiliasi akhir</span></div><div className="finance-detail__actions"><button className="button button--primary" disabled={selected.status === "Reconciled"} onClick={advance} type="button">{selected.status === "Draft" ? "Ajukan TEST" : selected.status === "Waiting approval" ? "Setujui TEST" : selected.status === "Approved" ? "Tandai dibayar TEST" : selected.status === "Paid" ? "Rekonsiliasi TEST" : "Sudah reconciled"}</button><button className="button button--quiet" type="button">Lihat audit</button></div></aside></section> : <FinanceApprovalPanel items={items} />}
    <p className="task-footnote">Data sintetis TEST · mata uang, ambang, pemisahan tugas, dan transaksi bank belum aktif.</p>
  </>;
}

function FinanceApprovalPanel({ items }: { items: FinanceItem[] }): React.JSX.Element {
  return <section className="approval-grid"><article className="approval-panel"><p className="eyebrow">B04 · Approval queue</p><h2>Persetujuan berlapis</h2><p>Approval TEST memperlihatkan dua reviewer dan alasan keputusan. Satu orang tidak boleh membuat dan menerima transaksi yang sama.</p>{items.filter((item) => item.status === "Waiting approval").map((item) => <div className="approval-row" key={item.id}><span>{item.title}</span><span className="finance-status finance-status--waiting-approval">Reviewer 1 · menunggu</span></div>)}<button className="button button--quiet" type="button">Buka antrean TEST</button></article><article className="approval-panel"><p className="eyebrow">B08–B09 · Rekonsiliasi & audit</p><h2>Jejak perubahan</h2><div className="audit-line"><span>Pengajuan dibuat</span><small>Pengurus TEST · TEST</small></div><div className="audit-line"><span>Approval dicatat</span><small>Reviewer TEST · TEST</small></div><div className="audit-line"><span>Periode dibuka ulang</span><small>Belum ada · menunggu policy</small></div><p className="editor-note">Rekening selalu dimasking. Auditor membaca dan mengekspor sesuai izin tanpa mengubah transaksi.</p></article></section>;
}
