"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/components/portal/api-client";

type Event = { id: string; action: string; actorAccountId?: string; reason?: string; createdAt: string; metadata?: { previousState?: string; nextState?: string; version?: number } };
const labels: Record<string, string> = {
  TASK_CREATED: "Tugas dibuat", TASK_SUBMITTED: "Diajukan untuk review", TASK_ACCEPTED: "Tugas diterima", TASK_RETURNED: "Dikembalikan untuk revisi", TASK_DEADLINE_EXTENDED: "Tenggat diperpanjang", TASK_CANCELLED: "Tugas dibatalkan", TASK_ARCHIVED: "Tugas diarsipkan",
  MEETING_MINUTES_REVISED: "Notulen direvisi", MEETING_MINUTES_FINALIZED: "Notulen difinalkan", MEETING_FOLLOW_UP_CREATED: "Tugas tindak lanjut dibuat",
  ASSET_REGISTERED: "Metadata didaftarkan", ASSET_SCAN_COMPLETED: "Pemeriksaan selesai", ASSET_ACCESS_REVOKED: "Akses dicabut",
  CONTENT_DRAFT_CREATED: "Draf dibuat", CONTENT_DRAFT_UPDATED: "Draf diperbarui", CONTENT_MEDIA_CHANGED: "Media konten diubah", CONTENT_STATE_CHANGED: "Status konten berubah", KNOWLEDGE_ARTICLE_CREATED: "Rujukan dibuat", KNOWLEDGE_ARTICLE_PUBLISHED: "Rujukan diterbitkan", HANDOVER_ACCEPTED: "Paket diterima penerus"
};

export function ActivityTimeline({ type, id }: { type: "task" | "meeting" | "asset" | "content" | "knowledge" | "handover"; id: string }): React.JSX.Element {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void apiJson<{ events: Event[] }>(`/api/v1/portal/activity?type=${type}&id=${encodeURIComponent(id)}`)
      .then((result) => { if (active) setEvents([...result.events].reverse()); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Riwayat gagal dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [type, id]);
  return <section className="activity-timeline" aria-label="Riwayat tindakan"><h3>Riwayat tindakan</h3>{loading ? <p>Memuat riwayat…</p> : error ? <p role="alert">{error}</p> : events.length ? <ol>{events.map((event) => <li key={event.id}><strong>{labels[event.action] ?? event.action.replaceAll("_", " ")}{event.metadata?.nextState ? `: ${event.metadata.nextState}` : ""}{type === "content" && event.metadata?.version ? ` · v${event.metadata.version}` : ""}</strong><span>{new Date(event.createdAt).toLocaleString("id-ID")} · {event.actorAccountId?.slice(0, 8) ?? "Sistem"}</span>{event.reason && <p>Alasan: {event.reason}</p>}</li>)}</ol> : <p>Belum ada tindakan tercatat untuk item ini.</p>}</section>;
}
