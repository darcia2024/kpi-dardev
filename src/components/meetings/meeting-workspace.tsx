"use client";

import { useEffect, useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import { ActivityTimeline } from "@/components/portal/activity-timeline";
import { MeetingCalendar } from "@/components/meetings/meeting-calendar";

type Meeting = { id: string; title: string; startsAt: string; agenda?: string; minutesState: "DRAFT" | "FINAL"; minutesVersion: number; minutesSummary: string; participantAccountIds: string[]; decisionId?: string; archivedAt?: string; myVote?: "SETUJU" | "TUNDA" | null; myRsvp?: "HADIR" | "TIDAK_HADIR" | "RAGU" | null };
type Task = { id: string; title: string; sourceDecisionId?: string; status: string };

export function MeetingWorkspace({ accountId, canManage, initialSelectedId = "" }: { accountId: string; canManage: boolean; initialSelectedId?: string }): React.JSX.Element {
  const meetings = usePortalResource<Meeting>("/api/v1/meetings", "meetings");
  const tasks = usePortalResource<Task>("/api/v1/tasks", "tasks");
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [minutes, setMinutes] = useState<string | null>(null);
  const [followUpTitle, setFollowUpTitle] = useState("");
  const [vote, setVote] = useState<"SETUJU" | "TUNDA" | "">("");
  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery] = useState("");
  const [archiveReason, setArchiveReason] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAgenda, setNewAgenda] = useState("");
  const [newStartsAt, setNewStartsAt] = useState("");
  const [newParticipantIds, setNewParticipantIds] = useState<string[]>([accountId]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (initialSelectedId && meetings.items.find((item) => item.id === initialSelectedId)?.archivedAt) setShowArchived(true);
  }, [initialSelectedId, meetings.items]);
  const visibleMeetings = meetings.items.filter((item) => Boolean(item.archivedAt) === showArchived && item.title.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID")));
  const selected = visibleMeetings.find((item) => item.id === selectedId) ?? visibleMeetings[0];

  async function act(body: Record<string, unknown>, success: string): Promise<void> {
    setBusy(true);
    setMessage("");
    try {
      const result = await apiJson<{ choice?: "SETUJU" | "TUNDA" }>("/api/v1/meetings/action", body);
      if (result.choice) setVote(result.choice);
      setMessage(success);
      await meetings.reload();
      if (body.action === "REVISE_MINUTES" || body.action === "FINALIZE_MINUTES") setMinutes(null);
      if (body.action === "CREATE_FOLLOW_UP") { setFollowUpTitle(""); await tasks.reload(); }
      if (body.action === "ARCHIVE") { setArchiveReason(""); setSelectedId(""); }
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Aksi rapat gagal."); }
    finally { setBusy(false); }
  }

  async function createMeeting(): Promise<void> {
    setBusy(true);
    setMessage("");
    try {
      const result = await apiJson<{ meeting: Meeting }>("/api/v1/meetings", { title: newTitle, agenda: newAgenda, startsAt: new Date(newStartsAt).toISOString(), participantAccountIds: newParticipantIds });
      setNewTitle(""); setNewAgenda(""); setNewStartsAt(""); setSelectedId(result.meeting.id); setShowArchived(false); setQuery("");
      await meetings.reload();
      setMessage("Undangan rapat tersimpan.");
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Undangan rapat gagal disimpan."); }
    finally { setBusy(false); }
  }

  return <>
    {canManage && <section className="task-toolbar" aria-label="Buat undangan rapat">
      <label>Judul rapat<input maxLength={180} value={newTitle} onChange={(event) => setNewTitle(event.target.value)} /></label>
      <label>Waktu rapat<input type="datetime-local" value={newStartsAt} onChange={(event) => setNewStartsAt(event.target.value)} /></label>
      <label>Agenda<textarea rows={2} maxLength={5000} value={newAgenda} onChange={(event) => setNewAgenda(event.target.value)} /></label>
      <fieldset><legend>Peserta</legend>{[{ id: "00000000-0000-4000-8000-000000000101", label: "Admin pratinjau" }, { id: "00000000-0000-4000-8000-000000000102", label: "Pengurus pratinjau" }].map((candidate) => <label key={candidate.id}><input type="checkbox" checked={newParticipantIds.includes(candidate.id)} onChange={(event) => setNewParticipantIds((current) => event.target.checked ? [...current, candidate.id] : current.filter((id) => id !== candidate.id))} /> {candidate.label}</label>)}</fieldset>
      <button className="button button--primary" type="button" disabled={busy || newTitle.trim().length < 3 || newAgenda.trim().length < 3 || !newStartsAt || Date.parse(newStartsAt) <= Date.now() || newParticipantIds.length === 0} onClick={() => void createMeeting()}>Buat undangan</button>
    </section>}
    <MeetingCalendar meetings={meetings.items} onSelect={(id) => { setShowArchived(false); setQuery(""); setSelectedId(id); setMinutes(null); }} />
    <section className="meeting-toolbar"><div><p className="eyebrow">Agenda rapat</p><h2>Rapat pratinjau yang tercatat</h2><p className="meeting-toolbar__meta">Waktu ditampilkan dalam zona Africa/Cairo.</p></div><button className="button button--quiet" onClick={() => void meetings.reload()} type="button">Muat ulang</button></section>
    <div className="segmented-control" aria-label="Status arsip rapat"><button className={!showArchived ? "is-selected" : ""} onClick={() => { setShowArchived(false); setSelectedId(""); setMinutes(null); }} type="button">Aktif ({meetings.items.filter((item) => !item.archivedAt).length})</button><button className={showArchived ? "is-selected" : ""} onClick={() => { setShowArchived(true); setSelectedId(""); setMinutes(null); }} type="button">Arsip ({meetings.items.filter((item) => item.archivedAt).length})</button></div>
    <label className="task-search">Cari rapat<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Judul rapat" /></label>
    {message && <p className="form-message" role="status">{message}</p>}{meetings.loading && <p role="status">Memuat rapat…</p>}{meetings.error && <p role="alert">{meetings.error} <button onClick={() => void meetings.reload()} type="button">Coba lagi</button></p>}{!meetings.loading && !meetings.error && visibleMeetings.length === 0 && <p>{showArchived ? "Belum ada rapat di arsip." : "Belum ada rapat aktif."}</p>}
    {selected && <section className="decision-panel" aria-label="Undangan dan RSVP"><p className="eyebrow">Undangan & RSVP</p><h2>Agenda rapat</h2><p>{selected.agenda ?? "Agenda belum dicatat."}</p><p>Peserta yang diundang: {selected.participantAccountIds.length}</p>{selected.participantAccountIds.includes(accountId) ? <><p>Respons saya: {selected.myRsvp ? selected.myRsvp.replaceAll("_", " ").toLowerCase() : "Belum diisi"}</p><div className="task-detail__actions">{(["HADIR", "RAGU", "TIDAK_HADIR"] as const).map((response) => <button className="button button--quiet" key={response} type="button" disabled={busy || !!selected.archivedAt || Date.parse(selected.startsAt) <= Date.now() || selected.myRsvp === response} onClick={() => void act({ action: "RSVP", meetingId: selected.id, response }, "Respons kehadiran tersimpan.")}>{response === "TIDAK_HADIR" ? "Tidak hadir" : response === "RAGU" ? "Belum pasti" : "Hadir"}</button>)}</div></> : <p>Akun ini tidak termasuk undangan.</p>}</section>}
    {selected && <><section className="meeting-layout"><div className="meeting-list" aria-label="Daftar rapat">{[...visibleMeetings].sort((a, b) => b.startsAt.localeCompare(a.startsAt)).map((item) => <button className={`meeting-row ${item.id === selected.id ? "meeting-row--selected" : ""}`} key={item.id} onClick={() => { setSelectedId(item.id); setMinutes(item.minutesSummary); setVote(""); setMessage(""); }} type="button"><span className="meeting-row__date">{new Date(item.startsAt).toLocaleDateString("id-ID", { timeZone: "Africa/Cairo" })}<small>{new Date(item.startsAt).toLocaleTimeString("id-ID", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit" })}</small></span><strong>{item.title}</strong><span className="meeting-status">{item.archivedAt ? "Diarsipkan" : item.minutesState === "FINAL" ? "Notulen final" : "Notulen draf"}</span></button>)}</div><aside className="meeting-detail"><div className="intro-panel__topline"><p className="eyebrow">Detail rapat</p><span className="status-chip">{selected.participantAccountIds.length} peserta</span></div><h2>{selected.title}</h2><p className="meeting-detail__meta">{new Date(selected.startsAt).toLocaleString("id-ID", { timeZone: "Africa/Cairo", dateStyle: "full", timeStyle: "short" })} · waktu Kairo · Notulen v{selected.minutesVersion}</p><div className="meeting-agenda"><strong>Keputusan</strong><p>{selected.decisionId ? `Tertaut ke keputusan ${selected.decisionId.slice(0, 8)}.` : "Belum ada tindak lanjut dari keputusan."}</p></div><ActivityTimeline key={`${selected.id}:${selected.minutesVersion}:${selected.decisionId ?? ""}`} type="meeting" id={selected.id} /></aside></section>
      <section className="decision-grid"><article className="decision-panel"><p className="eyebrow">Notulen</p><h2>Versi {selected.minutesVersion} · {selected.minutesState === "FINAL" ? "Final" : "Draf"}</h2><textarea aria-label="Ringkasan notulen" onChange={(event) => setMinutes(event.target.value)} readOnly={!canManage || selected.minutesState === "FINAL" || !!selected.archivedAt} rows={4} value={minutes ?? selected.minutesSummary} />{canManage && selected.minutesState === "DRAFT" && !selected.archivedAt && <div className="task-detail__actions"><button className="button button--quiet" disabled={busy || (minutes ?? selected.minutesSummary).trim().length < 3} onClick={() => void act({ action: "REVISE_MINUTES", meetingId: selected.id, summary: minutes ?? selected.minutesSummary }, "Revisi notulen tersimpan.")} type="button">Simpan revisi</button><button className="button button--primary" disabled={busy} onClick={() => void act({ action: "FINALIZE_MINUTES", meetingId: selected.id }, "Notulen difinalkan.")} type="button">Finalkan notulen</button></div>}</article>
      <article className="decision-panel"><p className="eyebrow">Voting</p><h2>Pilihan putaran 1</h2><p>Satu akun peserta hanya dapat memilih sekali. Pilihan yang sudah tersimpan tidak dapat diubah.</p>{selected.participantAccountIds.includes(accountId) ? <div className="vote-options"><button disabled={busy || !!selected.archivedAt || !!selected.myVote || !!vote} onClick={() => void act({ action: "VOTE", meetingId: selected.id, round: 1, choice: "SETUJU" }, "Pilihan tersimpan." )} type="button">Setuju</button><button disabled={busy || !!selected.archivedAt || !!selected.myVote || !!vote} onClick={() => void act({ action: "VOTE", meetingId: selected.id, round: 1, choice: "TUNDA" }, "Pilihan tersimpan." )} type="button">Tunda</button><span>{selected.myVote || vote ? `Pilihan saya tercatat: ${selected.myVote ?? vote}` : "Belum memilih"}</span></div> : <p>Akun ini tidak tercatat sebagai peserta.</p>}</article>
      <article className="decision-panel"><p className="eyebrow">Tindak lanjut</p><h2>Hubungkan keputusan ke tugas</h2><p>Tindak lanjut hanya dapat dibuat dari notulen final.</p>{selected.decisionId && <ul>{tasks.items.filter((task) => task.sourceDecisionId === selected.decisionId).map((task) => <li key={task.id}>{task.title} · {task.status}</li>)}</ul>}{canManage && !selected.archivedAt && <><label>Judul tugas<input maxLength={180} onChange={(event) => setFollowUpTitle(event.target.value)} value={followUpTitle} /></label><button className="button button--quiet" disabled={busy || selected.minutesState !== "FINAL" || followUpTitle.trim().length < 3} onClick={() => void act({ action: "CREATE_FOLLOW_UP", meetingId: selected.id, title: followUpTitle, ownerAccountId: "00000000-0000-4000-8000-000000000102" }, "Tugas tindak lanjut dibuat.")} type="button">Buat tugas pengurus pratinjau</button></>}</article></section>
      {canManage && selected.minutesState === "FINAL" && !selected.archivedAt && <section className="task-detail__actions" aria-label="Arsip rapat"><label>Alasan pengarsipan<input maxLength={500} onChange={(event) => setArchiveReason(event.target.value)} value={archiveReason} /></label><button className="button button--quiet" disabled={busy || archiveReason.trim().length < 3} onClick={() => void act({ action: "ARCHIVE", meetingId: selected.id, reason: archiveReason }, "Rapat dipindahkan ke arsip.")} type="button">Arsipkan rapat</button></section>}
    </>}
    <p className="task-footnote">Data sintetis pratinjau. Quorum dan kebijakan voting resmi masih menunggu keputusan KPI.</p>
  </>;
}
