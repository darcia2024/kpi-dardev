"use client";

import { useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";

type BudgetLine = { id: string; name: string; amountMinor: number };
type BudgetPlan = { id: string; version: number; state: "DRAFT" | "APPROVED"; currency: "TEST"; lines: BudgetLine[]; createdByAccountId: string; approvedByAccountId?: string; updatedAt: string };
type BudgetUsage = { lineId: string; name: string; allocatedMinor: number; spentMinor: number; remainingMinor: number };

export function BudgetWorkspace({ accountId, canManage, onChanged }: { accountId: string; canManage: boolean; onChanged?: () => void }): React.JSX.Element {
  const plans = usePortalResource<BudgetPlan>("/api/v1/finance/budget", "plans");
  const usage = usePortalResource<BudgetUsage>("/api/v1/finance/budget", "usage");
  const [lineName, setLineName] = useState("");
  const [amountMinor, setAmountMinor] = useState("");
  const [editingLineId, setEditingLineId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const draft = plans.items.find((plan) => plan.state === "DRAFT");
  const approved = plans.items.filter((plan) => plan.state === "APPROVED").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  async function act(body: Record<string, unknown>, success: string): Promise<void> {
    setBusy(true); setMessage("");
    try {
      await apiJson("/api/v1/finance/budget", body);
      if (body.action === "ADD_LINE" || body.action === "UPDATE_LINE") { setLineName(""); setAmountMinor(""); setEditingLineId(""); }
      await plans.reload();
      await usage.reload();
      onChanged?.();
      setMessage(success);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Rancangan anggaran gagal diperbarui."); }
    finally { setBusy(false); }
  }

  return <section className="operations-panel" aria-label="Rancangan anggaran">
    <p className="eyebrow">B01–B02 · Anggaran dan pos</p><h2>Rancangan anggaran per periode</h2>
    <p>Angka di bawah hanya untuk pratinjau lokal. Pos yang disetujui dapat dikaitkan ke transaksi; sisa dihitung dari pembayaran yang tercatat pada pos tersebut.</p>
    {message && <p className="form-message" role="status">{message}</p>}
    {plans.loading && <p role="status">Memuat anggaran…</p>}
    {plans.error && <p role="alert">{plans.error} <button onClick={() => void plans.reload()} type="button">Coba lagi</button></p>}
    {usage.error && <p role="alert">Ringkasan pemakaian gagal dimuat. <button onClick={() => void usage.reload()} type="button">Coba lagi</button></p>}
    {!plans.loading && !plans.error && !approved && <p>Belum ada anggaran yang disetujui untuk periode pratinjau.</p>}
    {approved && <div className="finance-checklist"><strong>Versi disetujui · v{approved.version}</strong><span>{approved.lines.length} pos · {approved.lines.reduce((sum, line) => sum + line.amountMinor, 0).toLocaleString("id-ID")} unit minor pratinjau</span>{usage.items.map((line) => <span key={line.lineId}>{line.name}: alokasi {line.allocatedMinor.toLocaleString("id-ID")} · dibayar {line.spentMinor.toLocaleString("id-ID")} · sisa {line.remainingMinor.toLocaleString("id-ID")}</span>)}{!usage.loading && usage.items.length === 0 && <span>Belum ada pemakaian yang dapat dihitung.</span>}</div>}
    {draft && <div className="finance-checklist"><strong>Draf v{draft.version}{draft.lines.length > 0 ? ` · ${draft.lines.length} pos` : ""}</strong>{draft.lines.length === 0 ? <span>Belum ada pos.</span> : draft.lines.map((line) => <div className="budget-line-row" key={line.id}><span>{line.name} · {line.amountMinor.toLocaleString("id-ID")} unit minor</span>{canManage && draft.createdByAccountId === accountId && <button className="button button--quiet" onClick={() => { setEditingLineId(line.id); setLineName(line.name); setAmountMinor(String(line.amountMinor)); }} type="button">Ubah</button>}</div>)}</div>}
    {canManage && !draft && <button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "CREATE_DRAFT" }, "Draf anggaran baru dibuat.")} type="button">Buat rancangan kosong</button>}
    {canManage && draft && draft.createdByAccountId === accountId && <div className="task-toolbar" aria-label={editingLineId ? "Ubah pos anggaran" : "Tambah pos anggaran"}><label>Nama pos<input maxLength={160} value={lineName} onChange={(event) => setLineName(event.target.value)} /></label><label>Nilai pratinjau · unit minor<input type="number" min="1" inputMode="numeric" value={amountMinor} onChange={(event) => setAmountMinor(event.target.value)} /></label><button className="button button--quiet" disabled={busy || lineName.trim().length < 3 || !Number.isSafeInteger(Number(amountMinor)) || Number(amountMinor) <= 0} onClick={() => void act({ action: editingLineId ? "UPDATE_LINE" : "ADD_LINE", planId: draft.id, expectedVersion: draft.version, ...(editingLineId ? { lineId: editingLineId } : {}), name: lineName, amountMinor: Number(amountMinor) }, editingLineId ? "Pos diperbarui." : "Pos rancangan tersimpan.")} type="button">{editingLineId ? "Simpan revisi" : "Tambah pos"}</button>{editingLineId && <button className="button button--quiet" onClick={() => { setEditingLineId(""); setLineName(""); setAmountMinor(""); }} type="button">Batal</button>}</div>}
    {canManage && draft && draft.createdByAccountId !== accountId && draft.lines.length > 0 && <button className="button button--primary" disabled={busy} onClick={() => void act({ action: "APPROVE", planId: draft.id, expectedVersion: draft.version }, "Rancangan anggaran disetujui di pratinjau lokal.")} type="button">Setujui rancangan</button>}
  </section>;
}
