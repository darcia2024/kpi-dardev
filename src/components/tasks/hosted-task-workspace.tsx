"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hasHostedPermission, type HostedAccess } from "@/platform/authorization/hosted-access";
import { hostedTaskDetailSchema, hostedTaskSchema, type HostedTask, type HostedTaskDetail, type HostedTaskScope } from "@/platform/work/hosted-task-contract";
import { z } from "zod";
import {HostedTaskTools,HostedTaskTemplatePicker} from "./hosted-task-tools";

const labels: Record<HostedTask["status"], string> = { OPEN: "Belum dimulai", IN_PROGRESS: "Dikerjakan", IN_REVIEW: "Menunggu review", REVISION: "Perlu revisi", DONE: "Selesai", CANCELLED: "Dibatalkan" };
const dateLabel = (value: string | null) => value ? new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Tanpa tenggat";
async function readApi(url: string, body?: unknown): Promise<unknown> {
  const response = await fetch(url, { method: body ? "POST" : "GET", headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 409 ? "Tugas sudah berubah. Muat ulang sebelum bertindak." : response.status === 403 ? "Izin untuk tindakan ini tidak tersedia. Periksa hak akses Anda." : response.status === 401 ? "Sesi berakhir. Silakan masuk kembali." : response.status === 400 ? "Periksa isi formulir dan tahap tugas." : "Layanan tugas belum dapat dihubungi. Coba lagi.");
  return response.json();
}

export function HostedTaskWorkspace({ identity, scopes }: { identity: HostedAccess; scopes: HostedTaskScope[] }): React.JSX.Element {
  const [scopeIndex, setScopeIndex] = useState(0);
  const scope = scopes[scopeIndex];
  const [tasks, setTasks] = useState<HostedTask[]>([]);
  const [selected, setSelected] = useState<HostedTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const [note, setNote] = useState("");
  const createKey = useRef<string | null>(null);
  const loadGeneration = useRef(0);
  const detailGeneration = useRef(0);
  const reload = useCallback(async () => {
    const generation = ++loadGeneration.current;
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ organizationCode: scope.organizationCode, periodCode: scope.periodCode });
      if (scope.divisionCode) params.set("divisionCode", scope.divisionCode);
      const result = z.object({ tasks: z.array(hostedTaskSchema) }).parse(await readApi(`/api/v1/work/tasks?${params}`));
      if (generation === loadGeneration.current) setTasks(result.tasks);
    } catch (failure) { if (generation === loadGeneration.current) { setTasks([]); setError(failure instanceof Error ? failure.message : "Gagal membaca tugas."); } }
    finally { if (generation === loadGeneration.current) setLoading(false); }
  }, [scope.organizationCode, scope.periodCode, scope.divisionCode]);
  useEffect(() => { setSelected(null); setNotice(""); detailGeneration.current++; void reload(); return () => { loadGeneration.current++; detailGeneration.current++; }; }, [reload]);
  async function openTask(task: HostedTask) {
    const generation = ++detailGeneration.current;
    setSelected(null); setNote(""); setError("");
    try { const result = z.object({ task: hostedTaskDetailSchema }).parse(await readApi(`/api/v1/work/tasks/${task.id}`)); if (generation === detailGeneration.current) setSelected(result.task); }
    catch (failure) { if (generation === detailGeneration.current) setError(failure instanceof Error ? failure.message : "Gagal membuka tugas."); }
  }
  useEffect(()=>{if(loading)return;const id=new URL(window.location.href).searchParams.get("task");if(id&&z.string().uuid().safeParse(id).success){const task=tasks.find(t=>t.id===id);if(task)void openTask(task);}},[loading,scopeIndex]);
  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return; setBusy(true); setNotice(""); setError("");
    createKey.current ??= crypto.randomUUID();
    try {
      const result = z.object({ task: hostedTaskSchema }).parse(await readApi("/api/v1/work/tasks", { ...scope, title, description, ownerAccountId: identity.accountId, idempotencyKey: createKey.current, dueAt: due ? new Date(due).toISOString() : null }));
      createKey.current = null; setTitle(""); setDescription(""); setDue(""); await reload(); await openTask(result.task); setNotice("Tugas tersimpan di database KPI.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Gagal menyimpan tugas."); }
    finally { setBusy(false); }
  }
  async function act(action: string) {
    if (!selected || busy) return; setBusy(true); setNotice(""); setError("");
    try { const result = z.object({ task: hostedTaskSchema }).parse(await readApi(`/api/v1/work/tasks/${selected.id}`, { expectedVersion: selected.version, action, note })); await reload(); await openTask(result.task); setNotice("Perubahan tugas tersimpan."); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Gagal memperbarui tugas."); }
    finally { setBusy(false); }
  }
  const canCreate = hasHostedPermission(identity,"TASK_CREATE",{ ...scope, divisionCode: scope.divisionCode || undefined });
  const selectedScope = { ...scope, divisionCode: selected?.divisionCode || undefined, objectId: selected?.id };
  const own = selected?.ownerAccountId === identity.accountId;
  const canSubmit = own && hasHostedPermission(identity,"TASK_SUBMIT",selectedScope);
  const canReview = selected && !own && selected.createdByAccountId !== identity.accountId && hasHostedPermission(identity,"TASK_REVIEW",selectedScope);
  const actions = selected ? [
    ...(canSubmit && ["OPEN","REVISION"].includes(selected.status) ? [{ action: "START", label: "Mulai tugas" }] : []),
    ...(canSubmit && selected.status === "IN_PROGRESS" ? [{ action: "SUBMIT", label: "Ajukan review" }] : []),
    ...(canReview && selected.status === "IN_REVIEW" ? [{ action: "APPROVE", label: "Setujui hasil" }, { action: "REQUEST_REVISION", label: "Minta revisi" }] : []),
    ...(hasHostedPermission(identity,"TASK_CREATE",selectedScope) && ["OPEN","IN_PROGRESS","REVISION"].includes(selected.status) ? [{ action: "CANCEL", label: "Batalkan tugas" }] : [])
  ] : [];
  const visible = tasks.filter(task => (!status || task.status === status) && `${task.title} ${task.description}`.toLocaleLowerCase("id-ID").includes(query.toLocaleLowerCase("id-ID")));
  return <div className="hosted-task-workspace">
    <section className="portal-form-card"><div className="portal-form-inline"><label>Penugasan aktif<select value={scopeIndex} disabled={busy} onChange={event => { createKey.current=null; setScopeIndex(Number(event.target.value)); }}>{scopes.map((item,index) => <option key={index} value={index}>{item.organizationCode} · {item.periodCode}{item.divisionCode ? ` · ${item.divisionCode}` : " · Semua divisi yang diizinkan"}</option>)}</select></label><button type="button" className="button button--quiet" disabled={loading || busy} onClick={() => { setSelected(null); detailGeneration.current++; void reload(); }}>Muat ulang</button></div></section>
    {error ? <p role="alert">{error}</p> : null}{notice ? <p role="status">{notice}</p> : null}
    {canCreate ? <form className="portal-form-card" onSubmit={createTask}><header className="portal-form-card__head"><h2>Buat tugas</h2><p>Tugas ini ditugaskan kepada Anda dalam penugasan yang dipilih.</p></header><HostedTaskTemplatePicker scope={scope} disabled={busy} onSelect={(title,description)=>{createKey.current=null;setTitle(title);setDescription(description);}}/><div className="portal-form-grid"><label>Judul<input required minLength={3} maxLength={180} value={title} disabled={busy} onChange={event => { createKey.current=null; setTitle(event.target.value); }} /></label><label>Tenggat (opsional)<input type="datetime-local" value={due} disabled={busy} onChange={event => { createKey.current=null; setDue(event.target.value); }} /></label></div><label>Uraian pekerjaan<textarea maxLength={4000} rows={3} value={description} disabled={busy} onChange={event => { createKey.current=null; setDescription(event.target.value); }} /></label><div className="portal-form-actions"><button className="button button--primary" disabled={busy || title.trim().length<3} type="submit">{busy ? "Menyimpan…" : "Simpan tugas"}</button></div></form> : null}
    <section className="operations-panel" aria-labelledby="hosted-task-list"><h2 id="hosted-task-list">Daftar tugas</h2><div className="portal-form-inline"><label>Cari tugas<input type="search" value={query} onChange={event=>setQuery(event.target.value)} /></label><label>Status<select value={status} onChange={event=>setStatus(event.target.value)}><option value="">Semua status</option>{Object.entries(labels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div>{loading ? <p role="status">Membaca tugas…</p> : visible.length ? <ul className="hosted-task-list">{visible.map(task=><li key={task.id}><button type="button" className="hosted-task-list__row" aria-pressed={selected?.id === task.id} disabled={busy} onClick={()=>void openTask(task)}><span><strong>{task.title}</strong><small>{task.ownerName} · {dateLabel(task.dueAt)}</small></span><span>{labels[task.status]}</span></button></li>)}</ul> : <p>{query || status ? "Tidak ada tugas yang cocok dengan filter." : "Belum ada tugas untuk penugasan ini."}</p>}<p>Menampilkan paling banyak 200 tugas terbaru dalam penugasan yang dipilih.</p></section>
    {selected ? <section className="portal-form-card" aria-labelledby="hosted-task-detail"><h2 id="hosted-task-detail">{selected.title}</h2><p>{labels[selected.status]} · Versi {selected.version} · {dateLabel(selected.dueAt)}</p><p style={{whiteSpace:"pre-wrap"}}>{selected.description || "Belum ada uraian tambahan."}</p>{actions.length ? <><label>Catatan tindakan<textarea value={note} maxLength={2000} rows={3} disabled={busy} onChange={event=>setNote(event.target.value)} /></label><div className="portal-form-actions">{actions.map(item=><button type="button" className="button button--quiet" key={item.action} disabled={busy || note.trim().length<3} onClick={()=>void act(item.action)}>{item.label}</button>)}</div><p>Review dilakukan oleh pengurus berizin yang bukan pembuat atau pemilik tugas.</p></> : <p>Tidak ada tindakan yang tersedia untuk akun Anda pada tahap ini.</p>}<HostedTaskTools task={selected} tasks={tasks} accountId={identity.accountId} canManage={hasHostedPermission(identity,"TASK_CREATE",selectedScope)} onChanged={async task=>{await reload();await openTask(task);}} onOpen={task=>void openTask(task)}/><h3>Riwayat tugas</h3><ol>{selected.events.map(event=><li key={event.id}><strong>{event.action} · {event.actorName}</strong><p style={{whiteSpace:"pre-wrap"}}>{event.note}</p><small>{dateLabel(event.createdAt)}</small></li>)}</ol></section> : null}
  </div>;
}
