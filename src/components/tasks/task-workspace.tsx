"use client";

import { useMemo, useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import { ActivityTimeline } from "@/components/portal/activity-timeline";
import { isTaskOverdue } from "@/platform/work/task-overdue";

type Task = { id: string; title: string; ownerAccountId: string; createdByAccountId: string; status: "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "ACCEPTED" | "ARCHIVED"; progress: number; evidenceAssetId?: string; dependencyTaskIds?: string[]; dueAt?: string; closedAt?: string; sourceTemplateId?: string; sourceTemplateVersion?: number; updatedAt: string };
type Asset = { id: string; fileName: string; status: string };
type TaskTemplate = { id: string; title: string; version: number; createdByAccountId: string };
const statusLabel: Record<Task["status"], string> = { IN_PROGRESS: "Berjalan", BLOCKED: "Terhambat", IN_REVIEW: "Perlu review", ACCEPTED: "Diterima", ARCHIVED: "Diarsipkan" };

export function TaskWorkspace({ accountId, canCreate, canSubmit, canReview, initialSelectedId = "" }: { accountId: string; canCreate: boolean; canSubmit: boolean; canReview: boolean; initialSelectedId?: string }): React.JSX.Element {
  const tasks = usePortalResource<Task>("/api/v1/tasks", "tasks");
  const assets = usePortalResource<Asset>("/api/v1/documents", "assets");
  const templates = usePortalResource<TaskTemplate>("/api/v1/tasks/templates", "templates");
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [filter, setFilter] = useState("all");
  const [evidenceAssetId, setEvidenceAssetId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newOwner, setNewOwner] = useState("00000000-0000-4000-8000-000000000102");
  const [newDependencyId, setNewDependencyId] = useState("");
  const [newDueAt, setNewDueAt] = useState("");
  const [templateTitle, setTemplateTitle] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [extendedDueAt, setExtendedDueAt] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [successorAccountId, setSuccessorAccountId] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const overdueCount = tasks.items.filter((item) => isTaskOverdue(item)).length;
  const visible = useMemo(() => tasks.items.filter((item) => (filter === "all" || item.status === filter || (filter === "mine" && item.ownerAccountId === accountId) || (filter === "overdue" && isTaskOverdue(item))) && item.title.toLowerCase().includes(query.toLowerCase())), [tasks.items, filter, accountId, query]);
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0];
  const availableAssets = assets.items.filter((item) => item.status === "AVAILABLE");

  async function templateAction(body: Record<string, unknown>, success: string): Promise<void> {
    setBusy(true);
    setMessage("");
    try {
      const result = await apiJson<{ task?: Task; template?: TaskTemplate }>("/api/v1/tasks/templates", body);
      if (result.task) { setFilter("all"); setQuery(""); setSelectedId(result.task.id); await tasks.reload(); }
      if (result.template) { setSelectedTemplateId(result.template.id); setTemplateTitle(""); await templates.reload(); }
      setMessage(success);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Template tugas gagal disimpan."); }
    finally { setBusy(false); }
  }

  async function act(body: Record<string, unknown>, success: string): Promise<void> {
    setBusy(true);
    setMessage("");
    try {
      const result = await apiJson<{ task?: Task }>(body.action === "CREATE" ? "/api/v1/tasks" : "/api/v1/tasks/action", body.action === "CREATE" ? { title: body.title, ownerAccountId: body.ownerAccountId, dependencyTaskIds: body.dependencyTaskIds, dueAt: body.dueAt } : body);
      if (body.action === "CREATE" && result.task) { setFilter("all"); setQuery(""); setSelectedId(result.task.id); }
      setMessage(success);
      setNewTitle("");
      setNewDueAt("");
      setExtendedDueAt("");
      setChangeReason("");
      setSuccessorAccountId("");
      setReviewReason("");
      await tasks.reload();
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Aksi tugas gagal."); }
    finally { setBusy(false); }
  }

  return <>
    <section className="task-summary" aria-label="Ringkasan tugas"><div><span className="task-summary__value">{tasks.items.filter((item) => item.status === "IN_PROGRESS").length}</span><span>Berjalan</span></div><div><span className="task-summary__value">{tasks.items.filter((item) => item.status === "IN_REVIEW").length}</span><span>Perlu review</span></div><div><span className="task-summary__value">{tasks.items.filter((item) => item.status === "BLOCKED").length}</span><span>Terhambat</span></div><div><span className="task-summary__value">{tasks.items.filter((item) => item.status === "ACCEPTED").length}</span><span>Diterima</span></div></section>
    <section className="task-toolbar" aria-label="Filter tugas"><div className="segmented-control"><button className={filter === "all" ? "is-selected" : ""} onClick={() => setFilter("all")} type="button">Semua</button><button className={filter === "mine" ? "is-selected" : ""} onClick={() => setFilter("mine")} type="button">Pekerjaan saya</button><button className={filter === "IN_REVIEW" ? "is-selected" : ""} onClick={() => setFilter("IN_REVIEW")} type="button">Perlu review</button><button className={filter === "BLOCKED" ? "is-selected" : ""} onClick={() => setFilter("BLOCKED")} type="button">Terhambat</button><button className={filter === "overdue" ? "is-selected" : ""} onClick={() => setFilter("overdue")} type="button">Lewat tenggat ({overdueCount})</button></div><label className="task-search">Cari tugas<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Judul tugas" /></label><button className="button button--quiet" onClick={() => void tasks.reload()} type="button">Muat ulang</button></section>
    {canCreate && <section className="task-toolbar" aria-label="Buat tugas"><label>Judul tugas <input maxLength={180} onChange={(event) => setNewTitle(event.target.value)} value={newTitle} /></label><label>Pemilik <select onChange={(event) => setNewOwner(event.target.value)} value={newOwner}><option value="00000000-0000-4000-8000-000000000102">Pengurus pratinjau</option><option value="00000000-0000-4000-8000-000000000101">Admin pratinjau</option></select></label><label>Prasyarat <select onChange={(event) => setNewDependencyId(event.target.value)} value={newDependencyId}><option value="">Tanpa prasyarat</option>{tasks.items.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select></label><label>Tenggat (opsional) <input type="datetime-local" onChange={(event) => setNewDueAt(event.target.value)} value={newDueAt} /></label><button className="button button--primary" disabled={busy || newTitle.trim().length < 3 || !!newDueAt && (!Number.isFinite(Date.parse(newDueAt)) || Date.parse(newDueAt) <= Date.now())} onClick={() => void act({ action: "CREATE", title: newTitle, ownerAccountId: newOwner, dependencyTaskIds: newDependencyId ? [newDependencyId] : [], ...(newDueAt ? { dueAt: new Date(newDueAt).toISOString() } : {}) }, "Tugas baru tersimpan.")} type="button">Buat tugas</button></section>}
    {canCreate && <section className="task-toolbar" aria-label="Template tugas">
      <label>Template tersimpan <select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)}><option value="">Pilih template</option>{templates.items.map((template) => <option key={template.id} value={template.id}>{template.title} · v{template.version}</option>)}</select></label>
      <button className="button button--quiet" disabled={busy || !selectedTemplateId || !!newDueAt && (!Number.isFinite(Date.parse(newDueAt)) || Date.parse(newDueAt) <= Date.now())} onClick={() => void templateAction({ action: "INSTANTIATE", templateId: selectedTemplateId, ownerAccountId: newOwner, ...(newDueAt ? { dueAt: new Date(newDueAt).toISOString() } : {}) }, "Tugas dibuat dari template.")} type="button">Buat dari template</button>
      <label>Judul template <input maxLength={180} value={templateTitle} onChange={(event) => setTemplateTitle(event.target.value)} placeholder="Judul tugas yang dapat digunakan lagi" /></label>
      <button className="button button--quiet" disabled={busy || templateTitle.trim().length < 3} onClick={() => void templateAction({ action: "CREATE", title: templateTitle }, "Template tersimpan.")} type="button">Simpan template</button>
      {selectedTemplateId && templates.items.find((item) => item.id === selectedTemplateId)?.createdByAccountId === accountId && <button className="button button--quiet" disabled={busy || templateTitle.trim().length < 3} onClick={() => void templateAction({ action: "REVISE", templateId: selectedTemplateId, title: templateTitle }, "Versi template diperbarui.")} type="button">Perbarui versi</button>}
      {templates.error && <p role="alert">{templates.error}</p>}
    </section>}
    {message && <p className="form-message" role="status">{message}</p>}
    {tasks.loading && <p role="status">Memuat tugas…</p>}{tasks.error && <p className="form-message" role="alert">{tasks.error} <button onClick={() => void tasks.reload()} type="button">Coba lagi</button></p>}
    {!tasks.loading && !tasks.error && visible.length === 0 && <p>Belum ada tugas untuk filter ini.</p>}
    {selected && <section className="task-layout"><div className="task-list" aria-label="Daftar tugas">{visible.map((task) => <button className={`task-row ${task.id === selected.id ? "task-row--selected" : ""}`} key={task.id} onClick={() => { setSelectedId(task.id); setEvidenceAssetId(""); setExtendedDueAt(""); setChangeReason(""); setMessage(""); }} type="button"><span className="task-row__id">{task.id.slice(0, 8)}</span><strong>{task.title}</strong><span className={`task-status task-status--${task.status.toLowerCase()}`}>{statusLabel[task.status]}</span><span className="task-row__due">{task.dueAt ? `Tenggat ${new Date(task.dueAt).toLocaleDateString("id-ID", { timeZone: "Africa/Cairo" })}` : "Tanpa tenggat"}</span></button>)}</div><aside className="task-detail"><div className="intro-panel__topline"><p className="eyebrow">Detail tugas</p><span className="task-status">{statusLabel[selected.status]}</span></div><h2>{selected.title}</h2>{selected.sourceTemplateId && <p className="task-detail__owner">Dibuat dari template {selected.sourceTemplateId.slice(0, 8)} · v{selected.sourceTemplateVersion ?? 1}</p>}<p className="task-detail__owner">Pemilik: {selected.ownerAccountId === accountId ? "Saya" : "Akun pratinjau lain"}</p><p>{selected.dueAt ? `Tenggat: ${new Date(selected.dueAt).toLocaleString("id-ID", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" })} waktu Kairo` : "Tenggat belum ditetapkan."}</p><div className="progress-block"><div><span>Progres</span><strong>{selected.progress}%</strong></div><div className="progress-track"><span style={{ width: `${selected.progress}%` }} /></div></div><div className="task-detail__section"><span className="eyebrow">Bukti</span><p>{selected.evidenceAssetId ? assets.items.find((asset) => asset.id === selected.evidenceAssetId)?.fileName ?? `Aset ${selected.evidenceAssetId.slice(0, 8)}` : "Belum dicantumkan"}</p></div><div className="task-detail__section"><span className="eyebrow">Prasyarat</span>{selected.dependencyTaskIds?.length ? <ul>{selected.dependencyTaskIds.map((id) => { const dependency = tasks.items.find((item) => item.id === id); return <li key={id}>{dependency?.title ?? id.slice(0, 8)} · {dependency ? statusLabel[dependency.status] : "Tidak ditemukan"}</li>; })}</ul> : <p>Tidak ada</p>}</div>
      {selected.status === "IN_PROGRESS" && selected.ownerAccountId === accountId && canSubmit && <div className="task-detail__actions"><label>Bukti tersedia <select onChange={(event) => setEvidenceAssetId(event.target.value)} value={evidenceAssetId}><option value="">Pilih aset</option>{availableAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.fileName}</option>)}</select></label><button className="button button--primary" disabled={busy || !evidenceAssetId || !!selected.dependencyTaskIds?.some((id) => tasks.items.find((item) => item.id === id)?.status !== "ACCEPTED")} onClick={() => void act({ action: "SUBMIT", taskId: selected.id, evidenceAssetId }, "Tugas diajukan untuk review.")} type="button">Ajukan selesai</button>{selected.dependencyTaskIds?.some((id) => tasks.items.find((item) => item.id === id)?.status !== "ACCEPTED") && <p>Prasyarat harus diterima sebelum tugas diajukan.</p>}{assets.error && <p role="alert">{assets.error}</p>}</div>}
      {selected.status === "IN_REVIEW" && selected.ownerAccountId !== accountId && canReview && <div className="task-detail__actions"><label>Alasan jika dikembalikan<input maxLength={500} onChange={(event) => setReviewReason(event.target.value)} value={reviewReason} /></label><button className="button button--primary" disabled={busy} onClick={() => void act({ action: "REVIEW", taskId: selected.id, accepted: true }, "Tugas diterima.")} type="button">Terima</button><button className="button button--quiet" disabled={busy || !reviewReason.trim()} onClick={() => void act({ action: "REVIEW", taskId: selected.id, accepted: false, reason: reviewReason }, "Tugas dikembalikan.")} type="button">Kembalikan</button></div>}
      {canCreate && selected.createdByAccountId === accountId && selected.status !== "ARCHIVED" && <div className="task-detail__actions"><label>Alasan perubahan<input maxLength={500} onChange={(event) => setChangeReason(event.target.value)} value={changeReason} /></label>{selected.dueAt && !["ACCEPTED", "ARCHIVED"].includes(selected.status) && <><label>Tenggat baru<input type="datetime-local" onChange={(event) => setExtendedDueAt(event.target.value)} value={extendedDueAt} /></label><button className="button button--quiet" disabled={busy || changeReason.trim().length < 3 || !extendedDueAt || !Number.isFinite(Date.parse(extendedDueAt)) || Date.parse(extendedDueAt) <= Math.max(Date.parse(selected.dueAt), Date.now())} onClick={() => void act({ action: "EXTEND_DEADLINE", taskId: selected.id, dueAt: new Date(extendedDueAt).toISOString(), reason: changeReason }, "Tenggat diperpanjang.")} type="button">Perpanjang tenggat</button></>}{["IN_PROGRESS", "BLOCKED"].includes(selected.status) && <button className="button button--quiet" disabled={busy || changeReason.trim().length < 3} onClick={() => void act({ action: "CANCEL", taskId: selected.id, reason: changeReason }, "Tugas dibatalkan dan diarsipkan.")} type="button">Batalkan tugas</button>}{selected.status === "ACCEPTED" && <button className="button button--quiet" disabled={busy || changeReason.trim().length < 3} onClick={() => void act({ action: "ARCHIVE", taskId: selected.id, reason: changeReason }, "Tugas diarsipkan.")} type="button">Arsipkan tugas</button>}</div>}
      {canCreate && selected.createdByAccountId === accountId && ["IN_PROGRESS", "BLOCKED"].includes(selected.status) && <div className="task-detail__actions" aria-label="Delegasi tugas">
        <label>Delegasikan kepada <select value={successorAccountId} onChange={(event) => setSuccessorAccountId(event.target.value)}><option value="">Pilih penerus</option>{[{ id: "00000000-0000-4000-8000-000000000101", label: "Admin pratinjau" }, { id: "00000000-0000-4000-8000-000000000102", label: "Pengurus pratinjau" }].filter((candidate) => candidate.id !== selected.ownerAccountId).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.label}</option>)}</select></label>
        <button className="button button--quiet" disabled={busy || !successorAccountId || changeReason.trim().length < 3} onClick={() => void act({ action: "DELEGATE", taskId: selected.id, successorAccountId, reason: changeReason }, "Pemilik tugas diperbarui dan delegasi tercatat.")} type="button">Delegasikan tugas</button>
      </div>}
      <ActivityTimeline key={`${selected.id}:${selected.updatedAt}`} type="task" id={selected.id} />
    </aside></section>}
    <p className="task-footnote">Data sintetis pratinjau. Daftar dan tindakan tugas tersimpan di backend lokal; bukti baru harus lolos alur storage sebelum dapat digunakan.</p>
  </>;
}
