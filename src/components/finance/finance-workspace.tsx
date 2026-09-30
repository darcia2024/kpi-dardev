"use client";

import { useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import { BudgetWorkspace } from "@/components/finance/budget-workspace";
import { FinanceApprovalChain, FinanceDashboard, financeStatusLabel, type DashboardRecord } from "@/components/finance/finance-dashboard";

type FinanceRecord = DashboardRecord & { currency: "TEST"; evidenceAssetId?: string };
type BudgetPlan = { id: string; state: "DRAFT" | "APPROVED"; lines: Array<{ id: string; name: string; amountMinor: number }>; updatedAt: string };
type Asset = { id: string; fileName: string; status: string };
type FinanceEvent = { id: string; action: string; actorAccountId: string; status: string; reason?: string; createdAt: string };
const label = financeStatusLabel;
const eventLabel: Record<string, string> = { CREATED: "Draf dibuat", SUBMITTED: "Diajukan", CHECKED: "Diperiksa Bendahara", APPROVED: "Disetujui", REJECTED: "Ditolak", PAID: "Dibayar", RECONCILED: "Direkonsiliasi" };
type Usage = { lineId: string; name: string; allocatedMinor: number; spentMinor: number; remainingMinor: number };

export function FinanceWorkspace({ accountId, canManage, canFinal }: { accountId: string; canManage: boolean; canFinal: boolean }): React.JSX.Element {
  const records = usePortalResource<FinanceRecord>("/api/v1/finance", "records");
  const settings = usePortalResource<{ finalApprovalAboveMinor?: number | null }>("/api/v1/finance", "settings");
  const usage = usePortalResource<Usage>("/api/v1/finance/budget", "usage");
  const assets = usePortalResource<Asset>("/api/v1/documents", "assets");
  const budgets = usePortalResource<BudgetPlan>("/api/v1/finance/budget", "plans");
  const [selectedId, setSelectedId] = useState("");
  const [evidenceAssetId, setEvidenceAssetId] = useState("");
  const [events, setEvents] = useState<FinanceEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [amountMinor, setAmountMinor] = useState("");
  const [budgetLineId, setBudgetLineId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [decisionReason, setDecisionReason] = useState("");
  const visible = records.items.filter((item) => (statusFilter === "ALL" || item.status === statusFilter) && `${item.title} ${item.id}`.toLowerCase().includes(search.toLowerCase()));
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0];
  const approvedBudget = budgets.items.filter((plan) => plan.state === "APPROVED").sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];

  async function loadEvents(id: string): Promise<void> {
    try { setEvents((await apiJson<{ events: FinanceEvent[] }>(`/api/v1/finance/events?recordId=${encodeURIComponent(id)}`)).events); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Riwayat gagal dimuat."); }
  }

  async function act(body: Record<string, unknown>, success: string): Promise<void> {
    setBusy(true); setMessage("");
    try {
      await apiJson("/api/v1/finance/action", body);
      setMessage(success);
      await Promise.all([records.reload(), usage.reload()]);
      if (selected) await loadEvents(selected.id);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Transaksi gagal diproses."); }
    finally { setBusy(false); }
  }

  async function create(): Promise<void> {
    setBusy(true); setMessage("");
    try {
      const result = await apiJson<{ record: FinanceRecord }>("/api/v1/finance", { title: title.trim(), amountMinor: Number(amountMinor), currency: "TEST", ...(budgetLineId ? { budgetLineId } : {}) });
      setTitle(""); setAmountMinor(""); setBudgetLineId(""); setSelectedId(result.record.id);
      await records.reload();
      setMessage("Draf transaksi pratinjau dibuat. Lampirkan bukti sebelum mengajukan.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Draf gagal dibuat."); }
    finally { setBusy(false); }
  }

  return <>
    <BudgetWorkspace accountId={accountId} canManage={canManage} onChanged={() => { void budgets.reload(); void usage.reload(); }} />
    <FinanceDashboard accountId={accountId} canFinal={canFinal} canManage={canManage} key={String(settings.items[0]?.finalApprovalAboveMinor ?? "none")} onChanged={async () => { await settings.reload(); await records.reload(); }} onOpen={(id) => { setStatusFilter("ALL"); setSearch(""); setSelectedId(id); setEvents([]); document.querySelector(".finance-layout")?.scrollIntoView({ behavior: "smooth" }); }} records={records.items} threshold={settings.items[0]?.finalApprovalAboveMinor ?? null} usage={usage.items} />
    <section className="governance-create"><div><p className="eyebrow">Pengajuan baru</p><h2>Buat draf transaksi pratinjau</h2><p>Nilai sintetis dalam satuan terkecil; ini bukan anggaran atau pembayaran resmi.</p></div><label>Judul pengajuan<input maxLength={160} onChange={(event) => setTitle(event.target.value)} value={title} /></label><label>Nilai contoh (satuan terkecil)<input inputMode="numeric" min="1" onChange={(event) => setAmountMinor(event.target.value)} type="number" value={amountMinor} /></label>{approvedBudget && <label>Pos anggaran<select onChange={(event) => setBudgetLineId(event.target.value)} value={budgetLineId}><option value="">Pilih pos</option>{approvedBudget.lines.map((line) => <option key={line.id} value={line.id}>{line.name}</option>)}</select></label>}<button className="button button--primary" disabled={busy || title.trim().length < 3 || !Number.isSafeInteger(Number(amountMinor)) || Number(amountMinor) <= 0 || !!approvedBudget && !budgetLineId} onClick={() => void create()} type="button">Buat draf</button></section>
    <div className="governance-filters"><label>Cari transaksi<input onChange={(event) => setSearch(event.target.value)} placeholder="Judul atau ID" type="search" value={search} /></label><label>Status<select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}><option value="ALL">Semua status</option>{Object.entries(label).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label><span>{visible.length} transaksi</span></div>
    {message && <p className="form-message" role="status">{message}</p>}{records.loading && <p role="status">Memuat transaksi…</p>}{records.error && <p role="alert">{records.error} <button onClick={() => void records.reload()} type="button">Coba lagi</button></p>}{!records.loading && !records.error && visible.length === 0 && <p>{records.items.length ? "Tidak ada transaksi untuk filter ini." : "Belum ada transaksi pratinjau."}</p>}
    {selected && <section className="finance-layout"><div className="finance-list" aria-label="Daftar transaksi">{visible.map((item) => <button className={`finance-row ${item.id === selected.id ? "finance-row--selected" : ""}`} key={item.id} onClick={() => { setSelectedId(item.id); setEvents([]); setEvidenceAssetId(""); setDecisionReason(""); setMessage(""); }} type="button"><span className="finance-row__id">{item.id.slice(0, 8)}<small>Transaksi pratinjau</small></span><strong>{item.title}</strong><span>{item.amountMinor.toLocaleString("id-ID")} satuan terkecil</span><span className="finance-status">{label[item.status]}</span></button>)}</div><aside className="finance-detail"><div className="intro-panel__topline"><p className="eyebrow">Siklus transaksi</p><span className="finance-status">{label[selected.status]}</span></div><h2>{selected.title}</h2><p className="finance-detail__meta">{selected.id} · Diperbarui {new Date(selected.updatedAt).toLocaleString("id-ID")}</p><div className="finance-amount"><span>Nilai contoh (satuan terkecil)</span><strong>{selected.amountMinor.toLocaleString("id-ID")}</strong></div><FinanceApprovalChain record={selected} /><div className="finance-checklist"><span>Request dibuat oleh {selected.requesterAccountId === accountId ? "saya" : "akun lain"}</span><span>{selected.budgetLineId ? `Pos: ${approvedBudget?.lines.find((line) => line.id === selected.budgetLineId)?.name ?? "Pos arsip"}` : "Belum dikaitkan ke pos anggaran"}</span><span>{selected.evidenceAssetId ? `Bukti ${selected.evidenceAssetId.slice(0, 8)}` : "Bukti belum dicantumkan"}</span></div><div className="finance-detail__actions">
      {selected.status === "DRAFT" && selected.requesterAccountId === accountId && <><label>Bukti tersedia<select onChange={(event) => setEvidenceAssetId(event.target.value)} value={evidenceAssetId}><option value="">Pilih aset</option>{assets.items.filter((item) => item.status === "AVAILABLE").map((asset) => <option key={asset.id} value={asset.id}>{asset.fileName}</option>)}</select></label><button className="button button--primary" disabled={busy || !evidenceAssetId} onClick={() => void act({ action: "SUBMIT", recordId: selected.id, evidenceAssetId }, "Transaksi diajukan.")} type="button">Ajukan</button></>}
      {canManage && selected.requesterAccountId !== accountId && selected.status === "PENDING_APPROVAL" && <><button className="button button--primary" disabled={busy} onClick={() => void act({ action: "APPROVE", recordId: selected.id, approved: true }, selected.needsFinalApproval ? "Pemeriksaan tercatat. Pengajuan diteruskan ke Ketua." : "Transaksi disetujui.")} type="button">{selected.needsFinalApproval ? "Periksa & teruskan ke Ketua" : "Setujui"}</button><label>Alasan penolakan<textarea maxLength={500} onChange={(event) => setDecisionReason(event.target.value)} rows={2} value={decisionReason} /></label><button className="button button--quiet" disabled={busy || decisionReason.trim().length < 3} onClick={() => void act({ action: "APPROVE", recordId: selected.id, approved: false, reason: decisionReason.trim() }, "Transaksi ditolak.")} type="button">Tolak dengan alasan</button></>}
      {canFinal && selected.status === "PENDING_FINAL" && selected.requesterAccountId !== accountId && !selected.approvals?.some((approval) => approval.approverAccountId === accountId) && <><button className="button button--primary" disabled={busy} onClick={() => void act({ action: "APPROVE_FINAL", recordId: selected.id, approved: true }, "Persetujuan akhir tercatat.")} type="button">Setujui sebagai Ketua</button><label>Catatan (wajib bila menolak)<textarea maxLength={500} onChange={(event) => setDecisionReason(event.target.value)} rows={2} value={decisionReason} /></label><button className="button button--quiet" disabled={busy || decisionReason.trim().length < 3} onClick={() => void act({ action: "APPROVE_FINAL", recordId: selected.id, approved: false, reason: decisionReason.trim() }, "Pengajuan dikembalikan dengan alasan.")} type="button">Tolak dengan alasan</button></>}
      {selected.status === "PENDING_FINAL" && selected.approvals?.some((approval) => approval.approverAccountId === accountId) && <p className="portal-note">Anda sudah memeriksa pengajuan ini. Persetujuan akhir harus diberikan oleh akun lain.</p>}
      {canManage && selected.requesterAccountId !== accountId && selected.status === "APPROVED" && <button className="button button--primary" disabled={busy} onClick={() => void act({ action: "MARK_PAID", recordId: selected.id }, "Pembayaran dicatat.")} type="button">Tandai dibayar</button>}
      {canManage && selected.requesterAccountId !== accountId && selected.status === "PAID" && <button className="button button--primary" disabled={busy} onClick={() => void act({ action: "RECONCILE", recordId: selected.id }, "Rekonsiliasi dicatat.")} type="button">Rekonsiliasi</button>}
      <button className="button button--quiet" onClick={() => void loadEvents(selected.id)} type="button">Lihat riwayat</button>
    </div>{events.length > 0 && <div className="finance-checklist" aria-label="Riwayat transaksi">{events.map((event) => <span key={event.id}>{eventLabel[event.action] ?? event.action} · {new Date(event.createdAt).toLocaleString("id-ID")} · {event.status}{event.reason ? ` · Alasan: ${event.reason}` : ""}</span>)}</div>}</aside></section>}
    <p className="task-footnote">Nilai menggunakan mata uang sintetis pratinjau dalam satuan terkecil. Anggaran dan pembayaran bank resmi belum terhubung.</p>
  </>;
}
