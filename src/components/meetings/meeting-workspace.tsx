"use client";

import { useState } from "react";

type Meeting = { id: string; title: string; date: string; time: string; status: "Scheduled" | "Draft" | "Archived"; attendance: string; classification: string };
const initialMeetings: Meeting[] = [
  { id: "MEET-TEST-01", title: "Rapat koordinasi fondasi", date: "24 Sep 2026", time: "19.00–20.30", status: "Scheduled", attendance: "3 / 5 hadir", classification: "Internal" },
  { id: "MEET-TEST-02", title: "Review rancangan publikasi", date: "26 Sep 2026", time: "18.30–19.15", status: "Draft", attendance: "Belum dijadwalkan", classification: "Restricted" },
  { id: "MEET-TEST-03", title: "Catatan keputusan awal", date: "18 Sep 2026", time: "17.00–17.45", status: "Archived", attendance: "5 / 5 hadir", classification: "Internal" }
];

export function MeetingWorkspace(): React.JSX.Element {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [selectedId, setSelectedId] = useState(initialMeetings[0].id);
  const [rsvp, setRsvp] = useState("Belum diisi");
  const [vote, setVote] = useState("");
  const [finalized, setFinalized] = useState(false);
  const selected = meetings.find((meeting) => meeting.id === selectedId) ?? meetings[0];

  function scheduleDraft(): void {
    setMeetings((current) => current.map((meeting) => meeting.id === selected.id ? { ...meeting, status: "Scheduled", attendance: "0 / 5 hadir" } : meeting));
  }

  return <>
    <section className="meeting-toolbar"><div><p className="eyebrow">M01 · Kalender</p><h2>Agenda rapat TEST</h2><p className="meeting-toolbar__meta">Semua waktu ditampilkan dalam Africa/Cairo.</p></div><button className="button button--primary" type="button">Buat rapat TEST</button></section>
    <section className="meeting-layout"><div className="meeting-list" aria-label="Daftar rapat TEST">{meetings.map((meeting) => <button className={`meeting-row ${meeting.id === selectedId ? "meeting-row--selected" : ""}`} key={meeting.id} onClick={() => { setSelectedId(meeting.id); setRsvp("Belum diisi"); setVote(""); setFinalized(false); }} type="button"><span className="meeting-row__date">{meeting.date}<small>{meeting.time}</small></span><strong>{meeting.title}</strong><span className={`meeting-status meeting-status--${meeting.status.toLowerCase()}`}>{meeting.status}</span></button>)}</div><aside className="meeting-detail" aria-label="Detail rapat"><div className="intro-panel__topline"><p className="eyebrow">M02–M03 · Detail & kehadiran</p><span className="status-chip">{selected.classification}</span></div><h2>{selected.title}</h2><p className="meeting-detail__meta">{selected.date} · {selected.time} · {selected.attendance}</p><div className="meeting-tabs"><span className="is-active">Agenda</span><span>Kehadiran</span><span>Notulen</span><span>Keputusan</span></div><div className="meeting-agenda"><strong>Agenda TEST</strong><p>Pembaruan pekerjaan fondasi, dependensi E06, dan keputusan yang perlu dicatat.</p></div><div className="rsvp-block"><span className="eyebrow">Konfirmasi kehadiran</span><div className="rsvp-actions"><button className={rsvp === "Hadir" ? "is-selected" : ""} onClick={() => setRsvp("Hadir")} type="button">Hadir</button><button className={rsvp === "Tidak hadir" ? "is-selected" : ""} onClick={() => setRsvp("Tidak hadir")} type="button">Tidak hadir</button><span>{rsvp}</span></div></div>{selected.status === "Draft" ? <button className="button button--quiet" onClick={scheduleDraft} type="button">Jadwalkan TEST</button> : null}</aside></section>
    <section className="decision-grid"><article className="decision-panel"><p className="eyebrow">M04 · Notulen</p><h2>Notulen versi {finalized ? "final" : "draft"}</h2><p>{finalized ? "Notulen TEST dikunci sebagai versi final. Perubahan berikutnya harus menjadi revisi baru." : "Catatan rapat dapat diedit sampai difinalkan oleh pihak berwenang."}</p><textarea aria-label="Notulen rapat" defaultValue="Catatan keputusan dan tindak lanjut · TEST" readOnly={finalized} rows={4} /><button className="button button--primary" disabled={finalized} onClick={() => setFinalized(true)} type="button">{finalized ? "Notulen telah final" : "Finalkan notulen TEST"}</button></article><article className="decision-panel"><p className="eyebrow">M05 · Voting</p><h2>Keputusan: lanjutkan rancangan</h2><p>Pilihan individu TEST tidak ditampilkan sebagai hasil agregat sebelum putaran ditutup.</p><div className="vote-options"><button className={vote === "Setuju" ? "is-selected" : ""} onClick={() => setVote("Setuju")} type="button">Setuju</button><button className={vote === "Tunda" ? "is-selected" : ""} onClick={() => setVote("Tunda")} type="button">Tunda</button><span>{vote ? `Pilihan TEST: ${vote}` : "Belum memilih"}</span></div><button className="button button--quiet" disabled={!vote} type="button">Kirim pilihan TEST</button></article><article className="decision-panel"><p className="eyebrow">M06–M07 · Tindak lanjut & arsip</p><h2>Hubungkan keputusan ke tugas.</h2><p>Follow-up menyimpan tautan ke rapat dan keputusan. Arsip mempertahankan dokumen, notulen, dan histori.</p><div className="followup-line"><span>Draft task · tindak lanjut TEST</span><span className="status-chip">Belum dibuat</span></div><button className="button button--quiet" type="button">Buat task TEST</button></article></section><p className="task-footnote">Data sintetis TEST · quorum, koreksi voting, dan finalisasi resmi menunggu policy KPI.</p>
  </>;
}
