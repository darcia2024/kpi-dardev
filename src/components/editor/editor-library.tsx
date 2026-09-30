"use client";

import { useState } from "react";
import { IconArticle, IconPencilPlus, IconSearch } from "@tabler/icons-react";
import { stateLabels, localeLabels, type ContentState, type Publication } from "./editor-types";

const filters: Array<ContentState | "all"> = ["all", "DRAFT", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "PUBLISHED", "ARCHIVED"];

export function EditorLibrary({ records, loading, error, accountId, canDraft, canReview, onOpen, onCreate, onReload }: { records: Publication[]; loading: boolean; error: string; accountId: string; canDraft: boolean; canReview: boolean; onOpen: (id: string) => void; onCreate: () => void; onReload: () => void }): React.JSX.Element {
  const [filter, setFilter] = useState<ContentState | "all">("all");
  const [query, setQuery] = useState("");
  const visible = records.filter((item) => (filter === "all" || item.state === filter) && `${item.title} ${item.slug} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  const awaitingMe = canReview ? records.filter((item) => item.state === "IN_REVIEW" && item.authorAccountId !== accountId).length : 0;

  return <section className="cms-library" aria-label="Pustaka naskah">
    <div className="cms-library__head">
      <div><p className="eyebrow">Naskah</p><h2>Semua naskah</h2></div>
      {canDraft && <button className="button button--primary" onClick={onCreate} type="button"><IconPencilPlus size={18} aria-hidden="true" />Tulis naskah</button>}
    </div>
    {awaitingMe > 0 && filter !== "IN_REVIEW" && <div className="cms-callout" role="status"><span><strong>{awaitingMe} naskah</strong> menunggu review Anda.</span><button className="button button--quiet" onClick={() => setFilter("IN_REVIEW")} type="button">Buka antrean</button></div>}
    <div className="cms-library__toolbar">
      <nav className="cms-tabs" aria-label="Saring status naskah">{filters.map((value) => {
        const count = value === "all" ? records.length : records.filter((item) => item.state === value).length;
        return <button aria-pressed={filter === value} className={filter === value ? "is-selected" : ""} key={value} onClick={() => setFilter(value)} type="button">{value === "all" ? "Semua" : stateLabels[value]}<span>{count}</span></button>;
      })}</nav>
      <label className="cms-search"><span className="sr-only">Cari naskah</span><IconSearch size={16} aria-hidden="true" /><input type="search" placeholder="Cari judul, slug, atau ringkasan" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    </div>
    {loading && <p className="cms-library__state" role="status">Memuat naskah…</p>}
    {error && <p className="form-message" role="alert">{error} <button className="button button--quiet" onClick={onReload} type="button">Coba lagi</button></p>}
    {!loading && !error && visible.length === 0 && <div className="portal-empty" role="status"><span className="portal-empty__icon"><IconArticle size={22} aria-hidden="true" /></span><strong>{records.length === 0 ? "Belum ada naskah." : "Tidak ada naskah yang cocok."}</strong><span>{records.length === 0 ? canDraft ? "Mulai dengan menulis naskah pertama. Naskah tersimpan sebagai draf sampai direview dan diterbitkan." : "Naskah dari penulis akan muncul di sini untuk ditinjau." : "Ubah status atau kata kunci pencarian."}</span>{records.length === 0 && canDraft && <button className="button button--primary" onClick={onCreate} type="button">Tulis naskah</button>}</div>}
    {visible.length > 0 && <ul className="cms-list">{visible.map((item) => <li key={item.id}><button onClick={() => onOpen(item.id)} type="button">
      <span className="cms-list__main"><strong>{item.title}</strong><span>{item.description}</span></span>
      <span className="cms-list__meta"><span className={`cms-state cms-state--${item.state.toLowerCase()}`}>{stateLabels[item.state]}</span><small>{localeLabels[item.locale]} · {item.type} · v{item.version}{item.authorAccountId === accountId ? " · Anda" : ""}{item.scheduledPublishAt ? ` · terbit ${new Date(item.scheduledPublishAt).toLocaleString("id-ID", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" })}` : ""}</small></span>
    </button></li>)}</ul>}
  </section>;
}
