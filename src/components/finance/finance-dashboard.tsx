"use client";

import { useState } from "react";
import { IconDownload, IconScale } from "@tabler/icons-react";
import { apiJson } from "@/components/portal/api-client";

export type FinanceStatus = "DRAFT" | "PENDING_APPROVAL" | "PENDING_FINAL" | "APPROVED" | "PAID" | "RECONCILED" | "REJECTED";
export type FinanceApproval = { level: 1 | 2; approverAccountId: string; at: string };
export type DashboardRecord = { id: string; title: string; amountMinor: number; requesterAccountId: string; status: FinanceStatus; budgetLineId?: string; approvals?: FinanceApproval[]; needsFinalApproval?: boolean; updatedAt: string };
type Usage = { lineId: string; name: string; allocatedMinor: number; spentMinor: number; remainingMinor: number };

export const financeStatusLabel: Record<FinanceStatus, string> = { DRAFT: "Draf", PENDING_APPROVAL: "Menunggu pemeriksaan", PENDING_FINAL: "Menunggu persetujuan Ketua", APPROVED: "Disetujui", PAID: "Dibayar", RECONCILED: "Direkonsiliasi", REJECTED: "Ditolak" };
const units = (value: number) => value.toLocaleString("id-ID");

// Which records wait on this account; mirrors the separation-of-duty rules in the finance service.
export function financeActionFor(record: DashboardRecord, accountId: string, canManage: boolean, canFinal: boolean): string | null {
  if (record.requesterAccountId === accountId) return record.status === "DRAFT" ? "Lampirkan bukti lalu ajukan" : null;
  if (record.status === "PENDING_APPROVAL" && canManage) return "Periksa pengajuan";
  if (record.status === "PENDING_FINAL" && canFinal && !record.approvals?.some((approval) => approval.approverAccountId === accountId)) return "Beri persetujuan akhir";
  if (record.status === "APPROVED" && canManage) return "Catat pembayaran";
  if (record.status === "PAID" && canManage) return "Rekonsiliasi";
  return null;
}

function downloadReport(records: DashboardRecord[], usage: Usage[]): void {
  const quote = (value: string | number) => `"${String(value).replaceAll("\"", "\"\"")}"`;
  const rows = [
    ["Laporan keuangan pratinjau (data TEST, satuan terkecil)"],
    [],
    ["Pos anggaran", "Alokasi", "Terpakai", "Sisa"],
    ...usage.map((line) => [line.name, line.allocatedMinor, line.spentMinor, line.remainingMinor]),
    [],
    ["ID", "Judul", "Nilai", "Status", "Diperbarui"],
    ...records.map((record) => [record.id, record.title, record.amountMinor, financeStatusLabel[record.status], record.updatedAt])
  ];
  const blob = new Blob(["﻿" + rows.map((row) => row.map(quote).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `laporan-keuangan-pratinjau-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function FinanceDashboard({ records, usage, threshold, accountId, canManage, canFinal, onOpen, onChanged }: { records: DashboardRecord[]; usage: Usage[]; threshold: number | null; accountId: string; canManage: boolean; canFinal: boolean; onOpen: (id: string) => void; onChanged: () => Promise<void> }): React.JSX.Element {
  const [thresholdInput, setThresholdInput] = useState(threshold === null ? "" : String(threshold));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const allocated = usage.reduce((sum, line) => sum + line.allocatedMinor, 0);
  const spent = usage.reduce((sum, line) => sum + line.spentMinor, 0);
  const pending = records.filter((record) => record.status === "PENDING_APPROVAL" || record.status === "PENDING_FINAL");
  const unreconciled = records.filter((record) => record.status === "PAID");
  const todo = records.map((record) => ({ record, action: financeActionFor(record, accountId, canManage, canFinal) })).filter((item): item is { record: DashboardRecord; action: string } => !!item.action);

  async function saveThreshold(value: number | null): Promise<void> {
    setBusy(true); setMessage("");
    try { await apiJson("/api/v1/finance/action", { action: "SET_THRESHOLD", amountMinor: value }); await onChanged(); setMessage("Aturan ambang tersimpan."); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Ambang gagal disimpan."); }
    finally { setBusy(false); }
  }

  return <section className="finance-dashboard" aria-label="Dasbor keuangan">
    <div className="finance-dashboard__head"><div><p className="eyebrow">Dasbor keuangan</p><h2>Posisi anggaran periode ini</h2></div><button className="button button--quiet" onClick={() => downloadReport(records, usage)} type="button"><IconDownload size={16} aria-hidden="true" />Unduh laporan</button></div>
    <div className="finance-kpis">
      <div><span>Anggaran disahkan</span><strong>{allocated ? units(allocated) : "—"}</strong><small>{usage.length ? `${usage.length} pos anggaran` : "Belum ada anggaran disahkan"}</small></div>
      <div><span>Sudah terpakai</span><strong>{units(spent)}</strong><small>{allocated ? `${Math.round(spent / allocated * 100)}% dari anggaran` : "Dari pembayaran tercatat"}</small></div>
      <div><span>Menunggu persetujuan</span><strong>{pending.length}</strong><small>{units(pending.reduce((sum, record) => sum + record.amountMinor, 0))} satuan terkecil</small></div>
      <div><span>Belum direkonsiliasi</span><strong>{unreconciled.length}</strong><small>Sudah dibayar</small></div>
    </div>
    <div className="finance-dashboard__grid">
      <article className="finance-panel"><h3>Anggaran dibanding realisasi</h3>{usage.length === 0 ? <p className="finance-panel__empty">Grafik muncul setelah anggaran periode disahkan. Angka resmi menunggu data dari Bendahara.</p> : <ul className="finance-bars">{usage.map((line) => {
        const percent = line.allocatedMinor ? Math.round(line.spentMinor / line.allocatedMinor * 100) : 0;
        return <li key={line.lineId}><div><span>{line.name}</span><strong>{percent}%</strong></div><span className="finance-bars__track"><span className={percent > 100 ? "is-over" : ""} style={{ width: `${Math.min(100, percent)}%` }} /></span><small>{units(line.spentMinor)} dari {units(line.allocatedMinor)} · sisa {units(line.remainingMinor)}</small></li>;
      })}</ul>}</article>
      <article className="finance-panel"><h3>Perlu tindakan Anda <span>{todo.length}</span></h3>{todo.length === 0 ? <p className="finance-panel__empty">Tidak ada pengajuan yang menunggu Anda.</p> : <ul className="finance-todo">{todo.slice(0, 6).map(({ record, action }) => <li key={record.id}><button onClick={() => onOpen(record.id)} type="button"><span><strong>{record.title}</strong><small>{units(record.amountMinor)} satuan terkecil · {financeStatusLabel[record.status]}</small></span><em>{action}</em></button></li>)}</ul>}</article>
    </div>
    <article className="finance-panel finance-threshold"><h3><IconScale size={16} aria-hidden="true" />Batas kewenangan persetujuan</h3>
      <p>{threshold === null ? "Ambang belum ditetapkan KPI, jadi semua pengajuan memerlukan pemeriksaan Bendahara lalu persetujuan Ketua." : `Pengajuan di atas ${units(threshold)} satuan terkecil memerlukan persetujuan Ketua setelah diperiksa Bendahara. Di bawahnya cukup pemeriksaan Bendahara.`}</p>
      {canFinal && <div className="portal-form-inline"><label>Ambang (satuan terkecil, pratinjau)<input inputMode="numeric" min={0} onChange={(event) => setThresholdInput(event.target.value)} placeholder="Kosongkan = semua ke Ketua" type="number" value={thresholdInput} /></label><div className="portal-form-actions"><button className="button button--quiet" disabled={busy || thresholdInput !== "" && (!Number.isSafeInteger(Number(thresholdInput)) || Number(thresholdInput) < 0)} onClick={() => void saveThreshold(thresholdInput === "" ? null : Number(thresholdInput))} type="button">Simpan aturan</button></div></div>}
      {message && <p className="form-message" role="status">{message}</p>}
    </article>
  </section>;
}

export function FinanceApprovalChain({ record }: { record: DashboardRecord }): React.JSX.Element {
  const level1 = record.approvals?.find((approval) => approval.level === 1);
  const level2 = record.approvals?.find((approval) => approval.level === 2);
  const done = (reached: boolean) => reached ? "is-done" : "";
  const after = (status: FinanceStatus[]) => status.includes(record.status);
  const steps = [
    { label: "Diajukan", state: record.status === "DRAFT" ? "is-current" : done(true) },
    { label: "Diperiksa Bendahara", state: level1 ? "is-done" : record.status === "PENDING_APPROVAL" ? "is-current" : "" },
    ...(record.needsFinalApproval || level2 ? [{ label: "Persetujuan Ketua", state: level2 ? "is-done" : record.status === "PENDING_FINAL" ? "is-current" : "" }] : []),
    { label: "Dibayar", state: done(after(["PAID", "RECONCILED"])) || (record.status === "APPROVED" ? "is-current" : "") },
    { label: "Direkonsiliasi", state: done(record.status === "RECONCILED") || (record.status === "PAID" ? "is-current" : "") }
  ];
  if (record.status === "REJECTED") return <p className="finance-chain__rejected">Pengajuan ditolak. Alasan tercatat di riwayat.</p>;
  return <ol className="finance-chain" aria-label="Rantai persetujuan">{steps.map((step, index) => <li className={step.state} key={step.label}><span>{step.state === "is-done" ? "✓" : index + 1}</span>{step.label}</li>)}</ol>;
}
