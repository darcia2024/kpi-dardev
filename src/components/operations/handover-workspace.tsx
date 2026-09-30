"use client";

import { useEffect, useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import { ActivityTimeline } from "@/components/portal/activity-timeline";
import { HandoverChecklist } from "@/components/operations/handover-checklist";
import { blockingItems, HandoverItems, type HandoverItem } from "@/components/operations/handover-items";

type Handover = { id: string; title: string; outgoingOwnerAccountId: string; successorAccountId: string; sourceAssetIds: string[]; items?: HandoverItem[]; status: "PENDING" | "ACCEPTED" | "ARCHIVED"; acceptedByAccountId?: string; archiveSha256?: string; updatedAt: string };
type AccessPlan = { handoverId: string; status: Handover["status"]; sources: { assetId: string; status: string; successorCanRead: boolean; outgoingCanRead: boolean }[]; proposedActions: string[]; executable: false };

export function HandoverWorkspace({ accountId, canAccept }: { accountId: string; canAccept: boolean }): React.JSX.Element {
  const items = usePortalResource<Handover>("/api/v1/handover", "items");
  const [selectedId, setSelectedId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [accessPlan, setAccessPlan] = useState<AccessPlan | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newSuccessor, setNewSuccessor] = useState("");
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

  async function createPackage(): Promise<void> {
    setBusy(true); setMessage("");
    try {
      const result = await apiJson<{ item: Handover }>("/api/v1/handover", { action: "CREATE", title: newTitle, successorAccountId: newSuccessor });
      setNewTitle(""); setNewSuccessor("");
      await items.reload();
      setSelectedId(result.item.id);
      setMessage("Paket dibuat. Tambahkan item yang perlu diserahkan.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Paket gagal dibuat."); }
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
    <section className="handover-summary"><div><span className="finance-summary__label">Paket</span><strong>{items.items.length}</strong><small>Mode pratinjau</small></div><div><span className="finance-summary__label">Diterima</span><strong>{items.items.filter((item) => item.status === "ACCEPTED").length}</strong><small>Penerus tercatat</small></div><div><span className="finance-summary__label">Menunggu</span><strong>{items.items.filter((item) => item.status === "PENDING").length}</strong><small>Perlu pemeriksaan</small></div><div><span className="finance-summary__label">Uji pemulihan</span><strong>Belum</strong><small>Menunggu staging</small></div></section>
    {message && <p className="form-message" role="status">{message}</p>}{items.loading && <p role="status">Memuat paket handover…</p>}{items.error && <p role="alert">{items.error} <button onClick={() => void items.reload()} type="button">Coba lagi</button></p>}{!items.loading && !items.error && items.items.length === 0 && <p className="portal-note">Belum ada paket serah terima. Pengurus lama membuat paket untuk penerusnya.</p>}
    {canAccept && <section className="portal-form-card" aria-labelledby="handover-create-title"><header className="portal-form-card__head"><p className="eyebrow">Paket baru</p><h2 id="handover-create-title">Buat paket serah terima</h2><p>Anda tercatat sebagai pengurus lama. Penerus memeriksa dan menerima setiap item.</p></header><div className="portal-form-grid"><label>Judul paket<input maxLength={180} onChange={(event) => setNewTitle(event.target.value)} placeholder="Contoh: Serah terima Sekretaris 2025/2026" value={newTitle} /></label><label>Penerus<select onChange={(event) => setNewSuccessor(event.target.value)} value={newSuccessor}><option value="">Pilih akun</option>{[["00000000-0000-4000-8000-000000000101", "Admin pratinjau"], ["00000000-0000-4000-8000-000000000102", "Pengurus pratinjau"]].filter(([id]) => id !== accountId).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div><div className="portal-form-actions"><button className="button button--primary" disabled={busy || newTitle.trim().length < 3 || !newSuccessor} onClick={() => void createPackage()} type="button">Buat paket</button></div></section>}
    {selected && <section className="handover-layout"><div className="handover-list" aria-label="Daftar paket handover">{items.items.map((item) => <button className={`handover-row ${item.id === selected.id ? "handover-row--selected" : ""}`} key={item.id} onClick={() => { setSelectedId(item.id); setConfirmed(false); setMessage(""); setAccessPlan(null); }} type="button"><span className="workspace-card__number">{item.id.slice(0, 8)}</span><strong>{item.title}</strong><span>{item.successorAccountId === accountId ? "Penerus: saya" : "Penerus: akun lain"}</span><span className="status-chip">{item.status === "ARCHIVED" ? "Arsip" : item.status === "ACCEPTED" ? "Diterima" : "Menunggu"}</span></button>)}</div><aside className="handover-detail"><p className="eyebrow">Penerimaan paket</p><h2>{selected.title}</h2><p>{selected.status === "ARCHIVED" ? "Arsip terkunci" : selected.status === "ACCEPTED" ? "Sudah diterima" : "Menunggu penerus"} · {new Date(selected.updatedAt).toLocaleString("id-ID")}</p><div className="handover-checks"><span>{selected.sourceAssetIds.length} sumber tercatat</span><span>Akses penerus ke sumber diperiksa saat penerimaan</span><span>Pencabutan akses lama belum dijalankan</span></div>
      <HandoverItems accountId={accountId} canAct={canAccept} onChanged={() => items.reload()} record={selected} />
      {selected.status === "PENDING" && blockingItems(selected).length > 0 && <p className="portal-note">Paket belum bisa ditutup selama masih ada {blockingItems(selected).length} item wajib yang belum diterima.</p>}
      {selected.status === "PENDING" && selected.successorAccountId === accountId && canAccept && <><label className="check-field"><input checked={confirmed} disabled={blockingItems(selected).length > 0} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" /> Saya sudah memeriksa seluruh isi paket ini</label><button className="button button--primary" disabled={!confirmed || busy || blockingItems(selected).length > 0} onClick={() => void accept()} type="button">{busy ? "Menyimpan…" : "Tutup serah terima"}</button></>}{selected.status === "ACCEPTED" && selected.outgoingOwnerAccountId === accountId && canAccept && <button className="button button--quiet" disabled={busy} onClick={() => void archive()} type="button">Kunci sebagai arsip</button>}{selected.archiveSha256 && <p>Jejak integritas: {selected.archiveSha256}</p>}<section className="case-history"><h3>Rencana peralihan akses</h3>{accessPlan ? <><ul>{accessPlan.sources.map((source) => <li key={source.assetId}>{source.assetId.slice(0, 8)} · {source.status} · penerus {source.successorCanRead ? "dapat membaca" : "belum dapat membaca"} · pemilik lama {source.outgoingCanRead ? "masih memiliki akses" : "tidak memiliki akses"}</li>)}</ul><ol>{accessPlan.proposedActions.map((step) => <li key={step}>{step}</li>)}</ol><p>Rencana ini belum mengubah hak akses.</p></> : <p>Memeriksa akses sumber…</p>}</section><ActivityTimeline key={`${selected.id}:${selected.status}`} type="handover" id={selected.id} /></aside></section>}
    <HandoverChecklist accountId={accountId} canManage={canAccept} />
    <section className="operations-grid"><article className="operations-panel"><p className="eyebrow">Konfigurasi & retensi</p><h2>Keputusan resmi diperlukan.</h2><p>Retensi dokumen dan pencabutan akses periode lama belum ditetapkan.</p></article><article className="operations-panel"><p className="eyebrow">Backup & pemulihan</p><h2>Menunggu staging.</h2><p>Uji pemulihan harus dijalankan pada infrastruktur yang disetujui KPI.</p></article></section>
    <p className="task-footnote">Data sintetis pratinjau. Penerimaan tersimpan; perpindahan akses nyata dan restore belum aktif.</p>
  </>;
}
