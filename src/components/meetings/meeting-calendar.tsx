"use client";

import { useState } from "react";
import { cairoDateKey, cairoMonthKey, calendarCells, shiftMonth } from "@/lib/meeting-calendar";

type CalendarMeeting = { id: string; title: string; startsAt: string; archivedAt?: string };

export function MeetingCalendar({ meetings, onSelect }: { meetings: CalendarMeeting[]; onSelect: (id: string) => void }): React.JSX.Element {
  const [month, setMonth] = useState(() => cairoMonthKey(new Date().toISOString()));
  const active = meetings.filter((meeting) => !meeting.archivedAt);
  const byDay = new Map<string, CalendarMeeting[]>();
  for (const meeting of active) {
    const key = cairoDateKey(meeting.startsAt);
    byDay.set(key, [...(byDay.get(key) ?? []), meeting]);
  }
  const monthLabel = new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", year: "numeric", month: "long" }).format(new Date(`${month}-01T00:00:00Z`));
  return <section className="meeting-calendar" aria-label="Kalender rapat waktu Kairo">
    <div className="meeting-calendar__head"><div><p className="eyebrow">M01 · Kalender rapat</p><h2>{monthLabel}</h2><p>Agenda dikelompokkan menurut tanggal di Kairo.</p></div><div className="ai-form-actions"><button className="button button--quiet" onClick={() => setMonth(cairoMonthKey(new Date().toISOString()))} type="button">Hari ini</button><button aria-label="Bulan sebelumnya" className="button button--quiet" onClick={() => setMonth(shiftMonth(month, -1))} type="button">←</button><button aria-label="Bulan berikutnya" className="button button--quiet" onClick={() => setMonth(shiftMonth(month, 1))} type="button">→</button></div></div>
    <div className="meeting-calendar__grid">{["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => <span className="meeting-calendar__weekday" key={day}>{day}</span>)}{calendarCells(month).map((cell, index) => {
      if (!cell) return <span className="meeting-calendar__day meeting-calendar__day--empty" key={`empty-${index}`} />;
      const entries = byDay.get(cell.key) ?? [];
      return entries.length ? <button className="meeting-calendar__day meeting-calendar__day--has-meeting" key={cell.key} onClick={() => onSelect(entries[0].id)} title={entries.map((meeting) => meeting.title).join("; ")} type="button"><strong>{cell.day}</strong><small>{entries.length} rapat</small></button> : <span className="meeting-calendar__day" key={cell.key}><strong>{cell.day}</strong></span>;
    })}</div>
    <p>{active.filter((meeting) => cairoMonthKey(meeting.startsAt) === month).length} rapat pada bulan ini.</p>
  </section>;
}
