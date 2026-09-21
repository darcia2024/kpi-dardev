"use client";

import { useMemo, useState } from "react";

type TaskStatus = "In progress" | "Needs review" | "Blocked" | "Done";
type Task = { id: string; title: string; owner: string; due: string; status: TaskStatus; progress: number; kind: string; evidence: string };

const initialTasks: Task[] = [
  { id: "TK-TEST-01", title: "Rancang struktur halaman publik", owner: "Pengurus TEST", due: "24 Sep 2026", status: "In progress", progress: 65, kind: "Pekerjaan saya", evidence: "1 file TEST" },
  { id: "TK-TEST-02", title: "Tinjau draft panduan kerja", owner: "Reviewer TEST", due: "22 Sep 2026", status: "Needs review", progress: 100, kind: "Action Required", evidence: "2 file TEST" },
  { id: "TK-TEST-03", title: "Konfirmasi pemilik konten ID/EN", owner: "Pengurus TEST", due: "20 Sep 2026", status: "Blocked", progress: 30, kind: "Hambatan", evidence: "Belum ada" },
  { id: "TK-TEST-04", title: "Arsipkan checklist fondasi", owner: "Admin TEST", due: "18 Sep 2026", status: "Done", progress: 100, kind: "Riwayat", evidence: "1 file TEST" }
];

const statusClass: Record<TaskStatus, string> = { "In progress": "task-status--progress", "Needs review": "task-status--review", Blocked: "task-status--blocked", Done: "task-status--done" };

export function TaskWorkspace(): React.JSX.Element {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(initialTasks[0].id);
  const selected = tasks.find((task) => task.id === selectedId) ?? tasks[0];
  const visibleTasks = useMemo(() => filter === "all" ? tasks : tasks.filter((task) => task.status === filter || task.kind === filter), [filter, tasks]);

  function markSubmitted(): void {
    if (!selected) return;
    setTasks((current) => current.map((task) => task.id === selected.id ? { ...task, status: "Needs review", progress: 100, evidence: "1 file TEST" } : task));
  }

  return <>
    <section className="task-summary" aria-label="Ringkasan workspace"><div><span className="task-summary__value">{tasks.filter((task) => task.status === "In progress").length}</span><span>Pekerjaan berjalan</span></div><div><span className="task-summary__value">{tasks.filter((task) => task.status === "Needs review").length}</span><span>Action Required</span></div><div><span className="task-summary__value">{tasks.filter((task) => task.status === "Blocked").length}</span><span>Hambatan</span></div><div><span className="task-summary__value">{tasks.filter((task) => task.status === "Done").length}</span><span>Selesai TEST</span></div></section>
    <section className="task-toolbar" aria-label="Filter tugas"><div className="segmented-control"><button className={filter === "all" ? "is-selected" : ""} onClick={() => setFilter("all")} type="button">Semua</button><button className={filter === "Pekerjaan saya" ? "is-selected" : ""} onClick={() => setFilter("Pekerjaan saya")} type="button">Pekerjaan saya</button><button className={filter === "Action Required" ? "is-selected" : ""} onClick={() => setFilter("Action Required")} type="button">Action Required</button><button className={filter === "Blocked" ? "is-selected" : ""} onClick={() => setFilter("Blocked")} type="button">Hambatan</button></div><select aria-label="Tampilan tugas" defaultValue="list"><option value="list">Tampilan daftar</option><option value="board">Tampilan board</option></select><button className="button button--primary" type="button">Buat tugas TEST</button></section>
    <section className="task-layout"><div className="task-list" aria-label="Daftar tugas TEST">{visibleTasks.map((task) => <button className={`task-row ${task.id === selectedId ? "task-row--selected" : ""}`} key={task.id} onClick={() => setSelectedId(task.id)} type="button"><span className="task-row__id">{task.id}</span><strong>{task.title}</strong><span className={`task-status ${statusClass[task.status]}`}>{task.status}</span><span className="task-row__due">{task.due}</span></button>)}</div>{selected ? <aside className="task-detail" aria-label="Detail tugas"><div className="intro-panel__topline"><p className="eyebrow">T03–T06 · Detail tugas</p><span className={`task-status ${statusClass[selected.status]}`}>{selected.status}</span></div><h2>{selected.title}</h2><p className="task-detail__owner">{selected.owner} · {selected.kind} · {selected.due}</p><div className="progress-block"><div><span>Progress</span><strong>{selected.progress}%</strong></div><div className="progress-track"><span style={{ width: `${selected.progress}%` }} /></div></div><div className="task-detail__section"><span className="eyebrow">Bukti</span><p>{selected.evidence}. Versi aktif harus tersedia sebelum diajukan.</p></div><div className="task-detail__section"><span className="eyebrow">Subtask & dependency</span><p>Checklist TEST belum terhubung ke backend. Parent tidak otomatis diterima hanya karena progres 100%.</p></div>{selected.status === "Blocked" ? <div className="task-alert">Hambatan: menunggu keputusan pemilik konten.</div> : null}<div className="task-detail__actions"><button className="button button--primary" disabled={selected.status === "Done"} onClick={markSubmitted} type="button">Ajukan selesai TEST</button><button className="button button--quiet" type="button">Laporkan hambatan</button></div></aside> : null}</section>
    <p className="task-footnote">Data sintetis TEST · status, review, bukti, dan deadline adalah simulasi UI.</p>
  </>;
}
