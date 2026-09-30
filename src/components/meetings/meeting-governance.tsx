"use client";

import { useState } from "react";
import { IconAlertTriangle, IconCircleCheck, IconCircleX, IconClockHour4, IconLock } from "@tabler/icons-react";
import { apiJson } from "@/components/portal/api-client";

type Attendance = "HADIR" | "IZIN" | "TIDAK_HADIR";
type Choice = "SETUJU" | "TOLAK" | "ABSTAIN";
type Outcome = "ACCEPTED" | "REJECTED" | "NO_QUORUM" | "PENDING_RULE";
type MotionView = { round: number; text: string; openedAt: string; closedAt?: string; presentAtOpen: number; eligibleCount: number; votesCast: number; tally?: Record<Choice, number>; outcome?: Outcome };
export type GovernedMeeting = { id: string; participantAccountIds: string[]; minutesState: "DRAFT" | "FINAL"; archivedAt?: string; quorumMinPresent?: number; attendance?: Record<string, Attendance>; motions?: MotionView[]; myMotionVotes?: Record<string, Choice | "TUNDA" | null>; myEligibleRounds?: number[] };

const names: Record<string, string> = { "00000000-0000-4000-8000-000000000101": "Admin pratinjau", "00000000-0000-4000-8000-000000000102": "Pengurus pratinjau" };
const attendanceLabels: Record<Attendance, string> = { HADIR: "Hadir", IZIN: "Izin", TIDAK_HADIR: "Tidak hadir" };
const choiceLabels: Record<Choice, string> = { SETUJU: "Setuju", TOLAK: "Tolak", ABSTAIN: "Abstain" };
const outcomeView: Record<Outcome, { label: string; icon: React.ReactNode; tone: string }> = {
  ACCEPTED: { label: "Mosi diterima", icon: <IconCircleCheck size={16} aria-hidden="true" />, tone: "ok" },
  REJECTED: { label: "Mosi ditolak", icon: <IconCircleX size={16} aria-hidden="true" />, tone: "no" },
  NO_QUORUM: { label: "Tidak kuorum, hasil tidak sah", icon: <IconAlertTriangle size={16} aria-hidden="true" />, tone: "warn" },
  PENDING_RULE: { label: "Keabsahan menunggu aturan kuorum resmi KPI", icon: <IconClockHour4 size={16} aria-hidden="true" />, tone: "warn" }
};

export function MeetingGovernance({ meeting, accountId, canManage, onChanged }: { meeting: GovernedMeeting; accountId: string; canManage: boolean; onChanged: () => Promise<void> }): React.JSX.Element {
  const [quorum, setQuorum] = useState(meeting.quorumMinPresent ? String(meeting.quorumMinPresent) : "");
  const [motionText, setMotionText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const editable = !meeting.archivedAt && meeting.minutesState === "DRAFT";
  const present = meeting.participantAccountIds.filter((id) => meeting.attendance?.[id] === "HADIR").length;
  const total = meeting.participantAccountIds.length;
  const quorumMet = meeting.quorumMinPresent ? present >= meeting.quorumMinPresent : null;
  const openMotion = meeting.motions?.find((motion) => !motion.closedAt);
  const closedMotions = (meeting.motions ?? []).filter((motion) => motion.closedAt).reverse();

  async function act(body: Record<string, unknown>, success: string): Promise<boolean> {
    setBusy(true); setMessage("");
    try { await apiJson("/api/v1/meetings/action", { meetingId: meeting.id, ...body }); await onChanged(); setMessage(success); return true; }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Perubahan gagal disimpan."); return false; }
    finally { setBusy(false); }
  }

  return <section className="decision-grid meeting-governance">
    <article className="decision-panel" aria-labelledby={`attendance-${meeting.id}`}>
      <p className="eyebrow">Presensi & kuorum</p>
      <h2 id={`attendance-${meeting.id}`}>{present} dari {total} peserta hadir</h2>
      <p className={`meeting-quorum meeting-quorum--${quorumMet === null ? "unset" : quorumMet ? "met" : "unmet"}`}>{quorumMet === null ? <><IconClockHour4 size={16} aria-hidden="true" />Kuorum belum ditetapkan. Aturan resmi menunggu keputusan KPI.</> : quorumMet ? <><IconCircleCheck size={16} aria-hidden="true" />Kuorum terpenuhi (minimal {meeting.quorumMinPresent} hadir).</> : <><IconAlertTriangle size={16} aria-hidden="true" />Belum kuorum: perlu {meeting.quorumMinPresent! - present} kehadiran lagi.</>}</p>
      <ul className="meeting-attendance">{meeting.participantAccountIds.map((id) => {
        const status = meeting.attendance?.[id];
        return <li key={id}><span>{id === accountId ? "Anda" : names[id] ?? "Peserta lain"}</span>{canManage && editable ? <div className="meeting-attendance__choices" role="group" aria-label={`Presensi ${names[id] ?? "peserta"}`}>{(Object.keys(attendanceLabels) as Attendance[]).map((value) => <button aria-pressed={status === value} className={status === value ? "is-selected" : ""} disabled={busy} key={value} onClick={() => void act({ action: "ATTENDANCE", accountId: id, status: value }, "Presensi tersimpan.")} type="button">{attendanceLabels[value]}</button>)}</div> : <small>{status ? attendanceLabels[status] : "Belum dicatat"}</small>}</li>;
      })}</ul>
      {canManage && editable && <div className="portal-form-inline"><label>Kuorum minimal hadir (pratinjau)<input inputMode="numeric" max={total} min={1} onChange={(event) => setQuorum(event.target.value)} type="number" value={quorum} /></label><button className="button button--quiet" disabled={busy || !Number.isInteger(Number(quorum)) || Number(quorum) < 1 || Number(quorum) > total || Number(quorum) === meeting.quorumMinPresent} onClick={() => void act({ action: "SET_QUORUM", minPresent: Number(quorum) }, "Kuorum rapat tersimpan.")} type="button">Simpan kuorum</button></div>}
    </article>

    <article className="decision-panel" aria-labelledby={`motion-${meeting.id}`}>
      <p className="eyebrow">Pemungutan suara tertutup</p>
      <h2 id={`motion-${meeting.id}`}>{openMotion ? `Mosi putaran ${openMotion.round}` : "Mosi & hasil"}</h2>
      {openMotion ? <div className="meeting-motion meeting-motion--open">
        <p className="meeting-motion__text">{openMotion.text}</p>
        <p className="meeting-motion__meta"><IconLock size={14} aria-hidden="true" />Suara masuk {openMotion.votesCast} dari {openMotion.eligibleCount} pemilih. Hasil dibuka setelah pemungutan ditutup.</p>
        {meeting.myEligibleRounds?.includes(openMotion.round) ? meeting.myMotionVotes?.[openMotion.round] ? <p className="meeting-motion__mine">Pilihan Anda sudah tercatat dan dirahasiakan.</p> : <div className="vote-options">{(Object.keys(choiceLabels) as Choice[]).map((choice) => <button disabled={busy} key={choice} onClick={() => void act({ action: "VOTE", round: openMotion.round, choice }, "Pilihan tercatat.")} type="button">{choiceLabels[choice]}</button>)}</div> : <p className="meeting-motion__mine">Anda tidak termasuk pemilih putaran ini (daftar diambil saat mosi dibuka).</p>}
        {canManage && <button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "CLOSE_MOTION" }, "Pemungutan suara ditutup.")} type="button">Tutup pemungutan suara</button>}
      </div> : canManage && editable ? <div className="meeting-motion__new"><label>Teks mosi<textarea maxLength={500} onChange={(event) => setMotionText(event.target.value)} placeholder="Contoh: Pengesahan SOP serah terima digital periode 2026/2027." rows={2} value={motionText} /></label><button className="button button--primary" disabled={busy || motionText.trim().length < 5} onClick={() => void act({ action: "OPEN_MOTION", text: motionText }, "Pemungutan suara dibuka.").then((ok) => { if (ok) setMotionText(""); })} type="button">Buka pemungutan suara</button><small>Pemilih diambil dari peserta berstatus Hadir saat mosi dibuka. Jika presensi belum dicatat, semua peserta undangan menjadi pemilih.</small></div> : !closedMotions.length && <p>Belum ada mosi pada rapat ini.</p>}
      {closedMotions.map((motion) => {
        const view = outcomeView[motion.outcome!];
        const cast = motion.votesCast || 1;
        return <div className="meeting-motion" key={motion.round}>
          <p className="meeting-motion__text"><b>Putaran {motion.round}.</b> {motion.text}</p>
          <ul className="meeting-tally">{(Object.keys(choiceLabels) as Choice[]).map((choice) => <li key={choice}><span>{choiceLabels[choice]}</span><span className="meeting-tally__bar"><span className={`meeting-tally__fill meeting-tally__fill--${choice.toLowerCase()}`} style={{ width: `${Math.round((motion.tally?.[choice] ?? 0) / cast * 100)}%` }} /></span><strong>{motion.tally?.[choice] ?? 0}</strong></li>)}</ul>
          <p className={`meeting-outcome meeting-outcome--${view.tone}`}>{view.icon}{view.label} · {motion.votesCast} dari {motion.eligibleCount} pemilih · {motion.presentAtOpen} hadir saat dibuka</p>
        </div>;
      })}
      {message && <p className="form-message" role="status">{message}</p>}
    </article>
  </section>;
}
