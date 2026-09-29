"use client";

import { useEffect, useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import { ActivityTimeline } from "@/components/portal/activity-timeline";
import { HandoverChecklist } from "@/components/operations/handover-checklist";

type Handover = { id: string; title: string; outgoingOwnerAccountId: string; successorAccountId: string; sourceAssetIds: string[]; status: "PENDING" | "ACCEPTED" | "ARCHIVED"; acceptedByAccountId?: string; archiveSha256?: string; updatedAt: string };
type AccessPlan = { handoverId: string; status: Handover["status"]; sources: { assetId: string; status: string; successorCanRead: boolean; outgoingCanRead: boolean }[]; proposedActions: string[]; executable: false };

export function HandoverWorkspace({ accountId, canAccept }: { accountId: string; canAccept: boolean }): React.JSX.Element {
  const items = usePortalResource<Handover>("/api/v1/handover", "items");
  const [selectedId, setSelectedId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [accessPlan, setAccessPlan] = useState<AccessPlan | null>(null);
  const selected = items.items.find((item) => item.id === selectedId) ?? items.items[0];
  useEffect(() => { if (!selected) return; let active = true; void apiJson<{ plan: AccessPlan }>(`/api/v1/handover/access-plan?handoverId=${selected.id}`).then((result) => { if (active) setAccessPlan(result.plan); }).catch(() => { if (active) setAccessPlan(null); }); return () => { active = false; }; }, [selected?.id, selected?.status]);

  async function accept(): Promise<void> {
    if (!selected || busy) return;
    setBusy(true); setMessage("");
    try {
      await apiJson("/api/v1/handover/accept", { handoverId: selected.id });
      setConfirmed(false);
      setMessage("Penerimaan paket tercatat di backend pratinjau.");
      await items.reload();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Penerimaan gagal."); }
    finally { setBusy(false); }
  }

  async function archive(): Promise<void> {
    if (!selected || busy) return;
    setBusy(true); setMessage("");
    try { await apiJson("/api/v1/handover/archive", { handoverId: selected.id }); await items.reload(); setMessage("Paket pratinjau diarsipkan dengan jejak integritas."); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Arsip gagal dibuat."); }
    finally { setBusy(false); }
  }

  return <>
    <section className="handover-summary"><div><span className="finance-summary__label">Paket</span><strong>{items.items.length}</strong><small>Penyimpanan lokal</small></div><div><span className="finance-summary__label">Diterima</span><strong>{items.items.filter((item) => item.status === "ACCEPTED").length}</strong><small>Penerus tercatat</small></div><div><span className="finance-summary__label">Menunggu</span><strong>{items.items.filter((item) => item.status === "PENDING").length}</strong><small>Perlu pemeriksaan</small></div><div><span className="finance-summary__label">Restore drill</span><strong>Belum</strong><small>Menunggu staging</small></div></section>
    {message && <p className="form-message" role="status">{message}</p>}{items.loading && <p role="status">Memuat paket handover…</p>}{items.error && <p role="alert">{items.error} <button onClick={() => void items.reload()} type="button">Coba lagi</button></p>}{!items.loading && !items.error && items.items.length === 0 && <p>Belum ada paket handover.</p>}
    {selected && <section className="handover-layout"><div className="handover-list" aria-label="Daftar paket handover">{items.items.map((item) => <button className={`handover-row ${item.id === selected.id ? "handover-row--selected" : ""}`} key={item.id} onClick={() => { setSelectedId(item.id); setConfirmed(false); setMessage(""); setAccessPlan(null); }} type="button"><span className="workspace-card__number">{item.id.slice(0, 8)}</span><strong>{item.title}</strong><span>{item.successorAccountId === accountId ? "Penerus: saya" : "Penerus: akun lain"}</span><span className="status-chip">{item.status === "ARCHIVED" ? "Arsip" : item.status === "ACCEPTED" ? "Diterima" : "Menunggu"}</span></button>)}</div><aside className="handover-detail"><p className="eyebrow">Penerimaan paket</p><h2>{selected.title}</h2><p>{selected.status === "ARCHIVED" ? "Arsip terkunci" : selected.status === "ACCEPTED" ? "Sudah diterima" : "Menunggu penerus"} · {new Date(selected.updatedAt).toLocaleString("id-ID")}</p><div className="handover-checks"><span>{selected.sourceAssetIds.length} sumber tercatat</span><span>Akses penerus ke sumber diperiksa saat penerimaan</span><span>Pencabutan akses lama belum dijalankan</span></div>{selected.status === "PENDING" && selected.successorAccountId === accountId && canAccept && <><label className="check-field"><input checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" /> Saya sudah memeriksa sumber paket pratinjau ini</label><button className="button button--primary" disabled={!confirmed || busy} onClick={() => void accept()} type="button">{busy ? "Menyimpan…" : "Catat penerimaan"}</button></>}{selected.status === "ACCEPTED" && selected.outgoingOwnerAccountId === accountId && canAccept && <button className="button button--quiet" disabled={busy} onClick={() => void archive()} type="button">Kunci sebagai arsip</button>}{selected.archiveSha256 && <p>Jejak integritas: {selected.archiveSha256}</p>}<section className="case-history"><h3>Rencana peralihan akses</h3>{accessPlan ? <><ul>{accessPlan.sources.map((source) => <li key={source.assetId}>{source.assetId.slice(0, 8)} · {source.status} · penerus {source.successorCanRead ? "dapat membaca" : "belum dapat membaca"} · pemilik lama {source.outgoingCanRead ? "masih memiliki akses" : "tidak memiliki akses"}</li>)}</ul><ol>{accessPlan.proposedActions.map((step) => <li key={step}>{step}</li>)}</ol><p>Rencana ini belum mengubah grant.</p></> : <p>Memeriksa akses sumber…</p>}</section><ActivityTimeline key={`${selected.id}:${selected.status}`} type="handover" id={selected.id} /></aside></section>}
    <HandoverChecklist accountId={accountId} canManage={canAccept} />
    <section className="operations-grid"><article className="operations-panel"><p className="eyebrow">Konfigurasi & retensi</p><h2>Keputusan resmi diperlukan.</h2><p>Retensi dokumen dan pencabutan akses periode lama belum ditetapkan.</p></article><article className="operations-panel"><p className="eyebrow">Backup & pemulihan</p><h2>Menunggu staging.</h2><p>Restore drill harus dijalankan pada infrastruktur yang disetujui KPI.</p></article></section>
    <p className="task-footnote">Data sintetis pratinjau. Penerimaan tersimpan; perpindahan akses nyata dan restore belum aktif.</p>
  </>;
}
