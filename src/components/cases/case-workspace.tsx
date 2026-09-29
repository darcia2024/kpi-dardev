"use client";

import { useEffect, useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import { InternalCommunicationsWorkspace } from "@/components/notifications/internal-communications-workspace";
import { ServiceFormWorkspace } from "@/components/cases/service-form-workspace";

type CaseStatus = "RECEIVED" | "TRIAGED" | "IN_PROGRESS" | "CLOSED";
type Case = { caseId: string; kind: "SARAN" | "PERTANYAAN" | "PENGADUAN"; subject: string; status: CaseStatus; submittedAt: string; ownerAccountId?: string; urgency?: "LOW" | "NORMAL" | "HIGH"; source?: "PORTAL_ASSISTANT" };
type CaseEvent = { id: string; at: string; visibility: "PUBLIC" | "INTERNAL"; message: string; status: CaseStatus };
type CaseDetail = Case & { description: string; triageReason?: string; events: CaseEvent[] };
type Notification = { id: string; event: string; caseId: string; status: "QUEUED" | "DELIVERING" | "SENT"; attempts: number; nextAttemptAt: string; lastFailure?: string };
const labels: Record<CaseStatus, string> = { RECEIVED: "Diterima", TRIAGED: "Ditriase", IN_PROGRESS: "Ditangani", CLOSED: "Ditutup" };

export function CaseWorkspace({ accountId }: { accountId: string }): React.JSX.Element {
  const cases = usePortalResource<Case>("/api/v1/cases", "cases");
  const notifications = usePortalResource<Notification>("/api/v1/notifications", "notifications");
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [detailError, setDetailError] = useState("");
  const [tab, setTab] = useState<"cases" | "communications" | "messages" | "forms">("cases");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [publicUpdate, setPublicUpdate] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [triageReason, setTriageReason] = useState("");
  const [urgency, setUrgency] = useState<"LOW" | "NORMAL" | "HIGH">("NORMAL");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const visible = cases.items.filter((item) => (filter === "all" || item.status === filter) && `${item.subject} ${item.caseId}`.toLowerCase().includes(query.toLowerCase()));
  const selected = visible.find((item) => item.caseId === selectedId) ?? visible[0];

  useEffect(() => {
    if (!selected) return;
    let active = true;
    void apiJson<{ detail: CaseDetail }>(`/api/v1/cases/detail?caseId=${encodeURIComponent(selected.caseId)}`)
      .then((result) => { if (active) { setDetail(result.detail); setDetailError(""); } })
      .catch((cause) => { if (active) setDetailError(cause instanceof Error ? cause.message : "Detail gagal dimuat."); });
    return () => { active = false; };
  }, [selected?.caseId]);

  async function act(action: "TRIAGE" | "START" | "UPDATE" | "CLOSE" | "REOPEN"): Promise<void> {
    if (!selected || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const body = { caseId: selected.caseId, publicUpdate, internalNote };
      if (action === "TRIAGE") await apiJson("/api/v1/cases/triage", { ...body, ownerAccountId: accountId, urgency, reason: triageReason, idempotencyKey: crypto.randomUUID() });
      else await apiJson("/api/v1/cases/action", { ...body, action });
      setPublicUpdate("");
      setInternalNote("");
      setTriageReason("");
      setMessage("Perubahan kasus tersimpan. Pembaruan pelapor masuk antrean pratinjau; belum terkirim ke provider.");
      await Promise.all([cases.reload(), notifications.reload()]);
      const refreshed = await apiJson<{ detail: CaseDetail }>(`/api/v1/cases/detail?caseId=${encodeURIComponent(selected.caseId)}`);
      setDetail(refreshed.detail);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Perubahan kasus gagal disimpan."); }
    finally { setBusy(false); }
  }

  return <>
    <section className="case-tabs" aria-label="Area layanan"><button aria-pressed={tab === "cases"} className={tab === "cases" ? "is-active" : ""} onClick={() => setTab("cases")} type="button">Antrean kasus</button><button aria-pressed={tab === "communications"} className={tab === "communications" ? "is-active" : ""} onClick={() => setTab("communications")} type="button">Monitor notifikasi</button><button aria-pressed={tab === "messages"} className={tab === "messages" ? "is-active" : ""} onClick={() => setTab("messages")} type="button">Pesan internal</button><button aria-pressed={tab === "forms"} className={tab === "forms" ? "is-active" : ""} onClick={() => setTab("forms")} type="button">Form layanan</button></section>
    {message && <p className="form-message" role="status">{message}</p>}
    {tab === "cases" ? <>
      <section className="case-filters" aria-label="Filter kasus"><label>Cari kasus<input type="search" placeholder="Subjek atau ID kasus" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>Status<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">Semua status</option><option value="RECEIVED">Diterima</option><option value="TRIAGED">Ditriase</option><option value="IN_PROGRESS">Ditangani</option><option value="CLOSED">Ditutup</option></select></label></section>
      {cases.loading && <p role="status">Memuat kasus…</p>}{cases.error && <p role="alert">{cases.error} <button onClick={() => void cases.reload()} type="button">Coba lagi</button></p>}
      {!cases.loading && !cases.error && visible.length === 0 && <p>Tidak ada kasus untuk filter ini.</p>}
      {selected && <section className="case-layout"><div className="case-list" aria-label="Daftar kasus pratinjau">{visible.map((item) => <button className={`case-row ${item.caseId === selected.caseId ? "case-row--selected" : ""}`} key={item.caseId} onClick={() => { setSelectedId(item.caseId); setDetail(null); setMessage(""); }} type="button"><span className="case-row__id">{item.caseId}</span><strong>{item.subject}</strong><span className="case-row__meta">{item.kind} · {item.source === "PORTAL_ASSISTANT" ? "Portal pengurus · " : ""}{new Date(item.submittedAt).toLocaleDateString("id-ID")}</span><span className={`case-status case-status--${item.status.toLowerCase()}`}>{labels[item.status]}</span></button>)}</div><aside className="case-detail" aria-label="Detail kasus"><div className="intro-panel__topline"><p className="eyebrow">Detail layanan</p><span className="case-status">{labels[selected.status]}</span></div><h2>{selected.subject}</h2><p className="case-detail__meta">{selected.caseId} · {selected.kind}{selected.source === "PORTAL_ASSISTANT" ? " · Portal pengurus" : ""}</p><p>{detail?.caseId === selected.caseId ? detail.description : detailError || "Memuat uraian…"}</p><div className="case-assignment"><span>Penanggung jawab</span><strong>{selected.ownerAccountId ? "Sudah ditugaskan" : "Belum ditugaskan"}</strong><span>Masuk</span><strong>{new Date(selected.submittedAt).toLocaleString("id-ID")}</strong></div>
        {detail?.caseId === selected.caseId && <section className="case-history" aria-label="Riwayat kasus"><h3>Riwayat kasus</h3>{detail.urgency && <p>Urgensi: {detail.urgency} · Alasan internal: {detail.triageReason ?? "—"}</p>}<ol>{detail.events.map((event) => <li key={event.id}><strong>{labels[event.status]} · {event.visibility === "PUBLIC" ? "Untuk pelapor" : "Internal"}</strong><p>{event.message}</p><small>{new Date(event.at).toLocaleString("id-ID")}</small></li>)}</ol></section>}
        {selected.status === "RECEIVED" && <div className="case-block case-block--internal"><label>Urgensi awal<select onChange={(event) => setUrgency(event.target.value as "LOW" | "NORMAL" | "HIGH")} value={urgency}><option value="LOW">Rendah</option><option value="NORMAL">Normal</option><option value="HIGH">Tinggi</option></select></label><label>Alasan triase<textarea maxLength={500} minLength={10} onChange={(event) => setTriageReason(event.target.value)} rows={2} value={triageReason} /></label><p>Penanggung jawab pratinjau: akun petugas yang sedang masuk. Klasifikasi urgensi ini belum menetapkan SLA resmi.</p></div>}
        <div className="case-block"><label htmlFor="case-public-update" className="eyebrow">Pembaruan untuk pelapor</label><textarea id="case-public-update" maxLength={1000} onChange={(event) => setPublicUpdate(event.target.value)} rows={3} value={publicUpdate} /></div><div className="case-block case-block--internal"><label htmlFor="case-internal-note" className="eyebrow">Catatan internal</label><textarea id="case-internal-note" maxLength={2000} onChange={(event) => setInternalNote(event.target.value)} rows={3} value={internalNote} /></div><div className="case-detail__actions">{(selected.status === "RECEIVED" ? [{ action: "TRIAGE" as const, label: "Triage" }] : selected.status === "TRIAGED" ? [{ action: "START" as const, label: "Mulai penanganan" }] : selected.status === "IN_PROGRESS" ? [{ action: "UPDATE" as const, label: "Simpan pembaruan" }, { action: "CLOSE" as const, label: "Tutup kasus" }] : [{ action: "REOPEN" as const, label: "Buka kembali" }]).map((item) => <button className={`button ${item.action === "CLOSE" ? "button--quiet" : "button--primary"}`} disabled={busy || publicUpdate.trim().length < 3 || internalNote.trim().length < 3 || (item.action === "TRIAGE" && triageReason.trim().length < 10)} key={item.action} onClick={() => void act(item.action)} type="button">{item.label}</button>)}</div>
      </aside></section>}
    </> : tab === "communications" ? <section className="communication-grid"><article className="communication-panel"><p className="eyebrow">Antrean lokal pratinjau</p><h2>Status notifikasi</h2>{notifications.loading && <p>Memuat notifikasi…</p>}{notifications.error && <p role="alert">{notifications.error} <button onClick={() => void notifications.reload()} type="button">Coba lagi</button></p>}{!notifications.loading && !notifications.error && notifications.items.length === 0 && <p>Belum ada notifikasi.</p>}{notifications.items.map((item) => <div className="delivery-row" key={item.id}><span>{item.event} · {item.caseId}</span><span className="delivery-status">{item.status} · {item.attempts} percobaan{item.lastFailure ? ` · ${item.lastFailure}` : ""}</span></div>)}</article><article className="communication-panel"><p className="eyebrow">Kanal pengiriman</p><h2>Belum diaktifkan</h2><p>Antrean dan retry tercatat di backend lokal. Pengiriman ke pelapor memerlukan provider serta persetujuan kebijakan resmi.</p></article></section> : tab === "messages" ? <InternalCommunicationsWorkspace accountId={accountId} canCreate canReview /> : <ServiceFormWorkspace />}
    <p className="task-footnote">Data pratinjau lokal. Catatan internal hanya tersedia bagi petugas berizin; tracking pelapor menampilkan pembaruan publik saja.</p>
  </>;
}
