"use client";

import Link from "next/link";
import { useState } from "react";
import { IconBell, IconChecks } from "@tabler/icons-react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import type { InboxNotice } from "@/platform/notifications/inbox-service";

type Filter = "all" | "unread" | "action";
const cairoDay = (value: string | Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date(value));

function dayLabel(day: string): string {
  const today = cairoDay(new Date());
  const yesterday = cairoDay(new Date(Date.now() - 86_400_000));
  if (day === today) return "Hari ini";
  if (day === yesterday) return "Kemarin";
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function InboxWorkspace(): React.JSX.Element {
  const notices = usePortalResource<InboxNotice>("/api/v1/notifications/inbox", "notices");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const unread = notices.items.filter((notice) => !notice.readAt);
  const counts: Record<Filter, number> = { all: notices.items.length, unread: unread.length, action: notices.items.filter((notice) => notice.actionRequired).length };
  const visible = [...notices.items]
    .filter((notice) => filter === "all" || (filter === "unread" ? !notice.readAt : notice.actionRequired))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const groups = visible.reduce<Array<{ day: string; items: InboxNotice[] }>>((result, notice) => {
    const day = cairoDay(notice.createdAt);
    const group = result.at(-1);
    if (group?.day === day) group.items.push(notice); else result.push({ day, items: [notice] });
    return result;
  }, []);

  async function markRead(ids: string[]): Promise<void> {
    setBusyId(ids.length > 1 ? "all" : ids[0]); setActionError("");
    try {
      for (const noticeId of ids) await apiJson("/api/v1/notifications/inbox", { action: "MARK_READ", noticeId });
      await notices.reload();
    } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Status baca gagal disimpan."); }
    finally { setBusyId(""); }
  }

  return <section aria-labelledby="inbox-title" className="inbox-panel">
    <div className="inbox-panel__head">
      <div><p className="eyebrow">Pusat notifikasi</p><h2 id="inbox-title">Untuk akun Anda</h2></div>
      <div className="inbox-panel__head-actions"><span>{unread.length ? `${unread.length} belum dibaca` : "Semua sudah dibaca"}</span>{unread.length > 0 && <button className="button button--quiet" disabled={!!busyId} onClick={() => void markRead(unread.map((notice) => notice.id))} type="button"><IconChecks size={16} aria-hidden="true" />{busyId === "all" ? "Menyimpan…" : "Tandai semua dibaca"}</button>}</div>
    </div>
    <nav className="inbox-filters" aria-label="Saring notifikasi">{([["all", "Semua"], ["unread", "Belum dibaca"], ["action", "Perlu tindakan"]] as const).map(([key, label]) => <button aria-pressed={filter === key} className={filter === key ? "is-selected" : ""} key={key} onClick={() => setFilter(key)} type="button">{label}<span>{counts[key]}</span></button>)}</nav>
    {actionError && <p className="form-message" role="alert">{actionError}</p>}
    {notices.loading ? <p className="inbox-panel__empty" role="status">Memuat notifikasi…</p>
      : notices.error ? <p role="alert">{notices.error} <button className="button button--quiet" onClick={() => void notices.reload()} type="button">Coba lagi</button></p>
      : groups.length === 0 ? <div className="inbox-empty" role="status"><IconBell size={22} aria-hidden="true" /><span>{filter === "all" ? "Belum ada pesan atau penugasan untuk Anda pada periode ini." : filter === "unread" ? "Tidak ada notifikasi yang belum dibaca." : "Tidak ada yang menunggu tindakan Anda."}</span></div>
      : groups.map((group) => <div className="inbox-group" key={group.day}><h3>{dayLabel(group.day)}</h3><ol>{group.items.map((notice) => <li className={notice.readAt ? "" : "is-unread"} key={notice.id}>
        <div><strong>{notice.title}</strong><p>{notice.description}</p><span className="inbox-panel__meta"><time dateTime={notice.createdAt}>{new Date(notice.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" })} Kairo</time>{notice.actionRequired ? <span className="inbox-tag inbox-tag--action">Perlu tindakan</span> : <span className="inbox-tag">Info</span>}</span></div>
        <div className="inbox-panel__actions">{!notice.readAt && <button className="button button--quiet" disabled={!!busyId} onClick={() => void markRead([notice.id])} type="button">{busyId === notice.id ? "Menyimpan…" : "Tandai dibaca"}</button>}{notice.id.startsWith("task-") ? <Link href={notice.href}>Buka tugas <span aria-hidden="true">↗</span></Link> : null}</div>
      </li>)}</ol></div>)}
  </section>;
}
