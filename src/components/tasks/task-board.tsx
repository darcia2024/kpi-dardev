"use client";

import { useState } from "react";
import { IconAlertTriangle, IconCalendarDue, IconChecklist, IconGripVertical } from "@tabler/icons-react";
import { boardColumn, boardColumns, moveIntent, type BoardColumn } from "@/lib/task-board";
import { isTaskOverdue } from "@/platform/work/task-overdue";

type Task = { id: string; title: string; ownerAccountId: string; submittedByAccountId?: string; status: "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "ACCEPTED" | "ARCHIVED"; progress: number; startedAt?: string; blockedReason?: string; dueAt?: string; dependencyTaskIds?: string[]; subtasks?: { done: boolean }[]; updatedAt: string };
type Asset = { id: string; fileName: string };
type Prompt = { taskId: string; action: "SUBMIT" | "RETURN" };

const ownerNames: Record<string, string> = { "00000000-0000-4000-8000-000000000101": "Admin", "00000000-0000-4000-8000-000000000102": "Pengurus", "00000000-0000-4000-8000-000000000103": "Ketua" };

export function TaskBoard({ tasks, allTasks, assets, accountId, canSubmit, canReview, busy, selectedId, onSelect, onAct }: { tasks: Task[]; allTasks: Task[]; assets: Asset[]; accountId: string; canSubmit: boolean; canReview: boolean; busy: boolean; selectedId?: string; onSelect: (id: string) => void; onAct: (body: Record<string, unknown>, success: string) => Promise<void> }): React.JSX.Element {
  const [dragId, setDragId] = useState("");
  const [overColumn, setOverColumn] = useState<BoardColumn | "">("");
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [evidenceAssetId, setEvidenceAssetId] = useState("");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const context = (task: Task) => ({ accountId, canSubmit, canReview, dependenciesAccepted: (task.dependencyTaskIds ?? []).every((id) => allTasks.find((item) => item.id === id)?.status === "ACCEPTED") });
  const promptTask = prompt ? allTasks.find((task) => task.id === prompt.taskId) : undefined;

  function move(task: Task, target: BoardColumn): void {
    const intent = moveIntent(task, target, context(task));
    if (!intent.ok) { setNotice(intent.reason); return; }
    setNotice("");
    if (intent.action === "START") void onAct({ action: "START", taskId: task.id }, "Tugas mulai dikerjakan.");
    if (intent.action === "ACCEPT") void onAct({ action: "REVIEW", taskId: task.id, accepted: true }, "Hasil tugas diterima.");
    if (intent.action === "SUBMIT" || intent.action === "RETURN") { setPrompt({ taskId: task.id, action: intent.action }); setEvidenceAssetId(""); setNote(""); onSelect(task.id); }
  }

  async function confirmPrompt(): Promise<void> {
    if (!prompt) return;
    if (prompt.action === "SUBMIT") await onAct({ action: "SUBMIT", taskId: prompt.taskId, evidenceAssetId, ...(note.trim() ? { note } : {}) }, "Tugas diajukan untuk diperiksa.");
    else await onAct({ action: "REVIEW", taskId: prompt.taskId, accepted: false, reason: note }, "Tugas dikembalikan ke pelaksana.");
    setPrompt(null);
  }

  return <section className="task-board" aria-label="Papan tugas">
    <p className="task-board__rule">Kartu hanya bisa digeser ke tahap yang sah. Tahap &quot;Menunggu diperiksa&quot; tidak bisa dilompati.</p>
    {notice && <p className="task-board__notice" role="alert"><IconAlertTriangle size={16} aria-hidden="true" />{notice}</p>}
    {prompt && promptTask && <div className="task-board__prompt" role="dialog" aria-label={prompt.action === "SUBMIT" ? "Ajukan untuk diperiksa" : "Kembalikan tugas"}>
      <strong>{prompt.action === "SUBMIT" ? "Ajukan untuk diperiksa" : "Kembalikan ke pelaksana"} · {promptTask.title}</strong>
      {prompt.action === "SUBMIT" ? <div className="portal-form-grid">
        <label>Bukti hasil kerja<select onChange={(event) => setEvidenceAssetId(event.target.value)} value={evidenceAssetId}><option value="">{assets.length ? "Pilih bukti" : "Belum ada bukti yang lolos pemeriksaan"}</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.fileName}</option>)}</select></label>
        <label>Catatan untuk pemeriksa (opsional)<input maxLength={1000} onChange={(event) => setNote(event.target.value)} value={note} /></label>
      </div> : <label>Alasan dikembalikan (wajib)<textarea maxLength={500} onChange={(event) => setNote(event.target.value)} rows={2} value={note} /></label>}
      <div className="portal-form-actions"><button className="button button--primary" disabled={busy || (prompt.action === "SUBMIT" ? !evidenceAssetId : !note.trim())} onClick={() => void confirmPrompt()} type="button">{prompt.action === "SUBMIT" ? "Ajukan" : "Kembalikan"}</button><button className="button button--quiet" onClick={() => setPrompt(null)} type="button">Batal</button></div>
    </div>}
    <div className="task-board__columns">{boardColumns.map((column) => {
      const cards = tasks.filter((task) => boardColumn(task) === column.id);
      const dragged = allTasks.find((task) => task.id === dragId);
      const legal = dragged ? moveIntent(dragged, column.id, context(dragged)).ok : false;
      return <div className={`task-board__column ${overColumn === column.id ? legal ? "is-over" : "is-illegal" : ""}`} key={column.id}
        onDragLeave={() => setOverColumn("")}
        onDragOver={(event) => { if (!dragged) return; event.preventDefault(); event.dataTransfer.dropEffect = legal ? "move" : "none"; setOverColumn(column.id); }}
        onDrop={(event) => { event.preventDefault(); setOverColumn(""); if (dragged) move(dragged, column.id); setDragId(""); }}>
        <header><h3>{column.label}</h3><span>{cards.length}</span></header>
        <ol>{cards.map((task) => {
          const done = task.subtasks?.filter((subtask) => subtask.done).length ?? 0;
          const overdue = isTaskOverdue(task);
          return <li className={`task-card ${task.id === selectedId ? "is-selected" : ""} ${task.status === "BLOCKED" ? "is-blocked" : ""}`} draggable={!busy} key={task.id} onDragEnd={() => { setDragId(""); setOverColumn(""); }} onDragStart={(event) => { setDragId(task.id); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", task.id); }}>
            <button className="task-card__open" onClick={() => onSelect(task.id)} type="button"><IconGripVertical className="task-card__grip" size={14} aria-hidden="true" /><strong>{task.title}</strong></button>
            <div className="task-card__meta">
              {task.status === "BLOCKED" && <span className="task-card__tag task-card__tag--blocked" title={task.blockedReason}>Terhambat</span>}
              {task.dueAt && <span className={`task-card__tag ${overdue ? "task-card__tag--overdue" : ""}`}><IconCalendarDue size={13} aria-hidden="true" />{overdue ? "Lewat tenggat" : new Date(task.dueAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Africa/Cairo" })}</span>}
              {task.subtasks?.length ? <span className="task-card__tag"><IconChecklist size={13} aria-hidden="true" />{done}/{task.subtasks.length}</span> : null}
              <span className="task-card__owner">{task.ownerAccountId === accountId ? "Anda" : ownerNames[task.ownerAccountId] ?? "Akun lain"}</span>
            </div>
            <label className="task-card__move"><span className="sr-only">Pindahkan {task.title} ke</span><select disabled={busy} onChange={(event) => { if (event.target.value) move(task, event.target.value as BoardColumn); event.target.value = ""; }} value=""><option value="">Pindahkan ke…</option>{boardColumns.filter((target) => target.id !== column.id).map((target) => <option disabled={!moveIntent(task, target.id, context(task)).ok} key={target.id} value={target.id}>{target.label}</option>)}</select></label>
          </li>;
        })}</ol>
        {cards.length === 0 && <p className="task-board__empty">Belum ada tugas.</p>}
      </div>;
    })}</div>
  </section>;
}
