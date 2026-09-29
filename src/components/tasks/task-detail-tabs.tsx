"use client";

import { useEffect, useState } from "react";
import { IconDownload, IconFileText, IconSend } from "@tabler/icons-react";
import { apiJson } from "@/components/portal/api-client";

type Subtask = { id: string; title: string; done: boolean; doneAt?: string };
type Comment = { id: string; authorAccountId: string; body: string; createdAt: string };
type Asset = { id: string; fileName: string; status: string };

const accountNames: Record<string, string> = { "00000000-0000-4000-8000-000000000101": "Admin pratinjau", "00000000-0000-4000-8000-000000000102": "Pengurus pratinjau" };
const cairoTime = (value: string) => new Date(value).toLocaleString("id-ID", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" });

export function TaskSubtasks({ task, canAdd, canTick, tickHint, onChanged }: { task: { id: string; status: string; subtasks?: Subtask[] }; canAdd: boolean; canTick: boolean; tickHint: string; onChanged: () => Promise<void> }): React.JSX.Element {
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const open = ["IN_PROGRESS", "BLOCKED"].includes(task.status);
  const subtasks = task.subtasks ?? [];
  const done = subtasks.filter((item) => item.done).length;

  async function run(body: Record<string, unknown>): Promise<boolean> {
    setBusy(true); setError("");
    try { await apiJson("/api/v1/tasks/action", { taskId: task.id, ...body }); await onChanged(); return true; }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Sub-tugas gagal diperbarui."); return false; }
    finally { setBusy(false); }
  }

  return <section className="task-tab" aria-label="Sub-tugas">
    {subtasks.length > 0 ? <>
      <p className="task-tab__summary">{done} dari {subtasks.length} selesai{done === subtasks.length ? " · tugas siap diajukan" : ""}</p>
      <ul className="task-subtasks">{subtasks.map((item) => <li className={item.done ? "is-done" : ""} key={item.id}><label><input checked={item.done} disabled={!canTick || !open || busy} onChange={(event) => void run({ action: "SET_SUBTASK", subtaskId: item.id, done: event.target.checked })} type="checkbox" /><span>{item.title}</span></label>{item.doneAt && <small>{cairoTime(item.doneAt)}</small>}</li>)}</ul>
    </> : <p className="task-tab__empty">Belum ada sub-tugas. Pecah pekerjaan besar menjadi langkah yang bisa dicentang.</p>}
    {!canTick && subtasks.length > 0 && open && <p className="task-tab__hint">{tickHint}</p>}
    {canAdd && open && <form className="portal-form-inline" onSubmit={(event) => { event.preventDefault(); void run({ action: "ADD_SUBTASK", title }).then((ok) => { if (ok) setTitle(""); }); }}><label>Sub-tugas baru<input maxLength={180} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Susun kerangka laporan" value={title} /></label><button className="button button--quiet" disabled={busy || title.trim().length < 2} type="submit">Tambah</button></form>}
    {error && <p className="form-message" role="alert">{error}</p>}
  </section>;
}

export function TaskDiscussion({ taskId, accountId, closed }: { taskId: string; accountId: string; closed: boolean }): React.JSX.Element {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void apiJson<{ comments: Comment[] }>(`/api/v1/tasks/comments?taskId=${encodeURIComponent(taskId)}`)
      .then((result) => { if (active) setComments(result.comments); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Diskusi gagal dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [taskId]);

  async function send(): Promise<void> {
    setBusy(true); setError("");
    try {
      const result = await apiJson<{ comment: Comment }>("/api/v1/tasks/action", { action: "COMMENT", taskId, body });
      setComments((items) => [...items, result.comment]);
      setBody("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Komentar gagal dikirim."); }
    finally { setBusy(false); }
  }

  return <section className="task-tab" aria-label="Diskusi tugas">
    {loading ? <p className="task-tab__empty">Memuat diskusi…</p> : comments.length === 0 ? <p className="task-tab__empty">Belum ada diskusi. Gunakan ruang ini untuk pertanyaan dan kabar progres.</p> : <ol className="task-comments">{comments.map((comment) => <li className={comment.authorAccountId === accountId ? "is-mine" : ""} key={comment.id}><div><strong>{comment.authorAccountId === accountId ? "Anda" : accountNames[comment.authorAccountId] ?? "Akun lain"}</strong><time dateTime={comment.createdAt}>{cairoTime(comment.createdAt)}</time></div><p>{comment.body}</p></li>)}</ol>}
    {closed ? <p className="task-tab__hint">Tugas sudah ditutup; diskusi hanya dapat dibaca.</p> : <form className="task-comment-form" onSubmit={(event) => { event.preventDefault(); void send(); }}><label><span className="sr-only">Tulis komentar</span><textarea maxLength={2000} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && body.trim()) void send(); }} placeholder="Tulis komentar… (Ctrl+Enter untuk kirim)" rows={2} value={body} /></label><button className="button button--primary" disabled={busy || !body.trim()} type="submit"><IconSend size={16} aria-hidden="true" />Kirim</button></form>}
    {error && <p className="form-message" role="alert">{error}</p>}
  </section>;
}

export function TaskEvidence({ evidenceAssetId, asset, note }: { evidenceAssetId?: string; asset?: Asset; note?: string }): React.JSX.Element {
  if (!evidenceAssetId) return <section className="task-tab"><p className="task-tab__empty">Belum ada bukti. Bukti dilampirkan saat pemilik mengajukan tugas selesai.</p></section>;
  const available = asset?.status === "AVAILABLE";
  return <section className="task-tab" aria-label="Bukti tugas">
    <div className="task-evidence"><IconFileText size={22} aria-hidden="true" /><div><strong>{asset?.fileName ?? `Aset ${evidenceAssetId.slice(0, 8)}`}</strong><span>{available ? "Lolos pemeriksaan" : "File sedang diperiksa dan belum dapat digunakan."}</span></div>{available && <a className="button button--quiet" href={`/api/v1/documents/file?id=${evidenceAssetId}&download=1`}><IconDownload size={16} aria-hidden="true" />Unduh</a>}</div>
    {note && <div className="task-evidence__note"><span>Catatan pelaksana</span><p>{note}</p></div>}
  </section>;
}
