"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconAlertTriangle, IconArrowLeft, IconBold, IconCalendarTime, IconCheck, IconCircleCheck, IconCircleX, IconColumns, IconDeviceFloppy, IconEye, IconH2, IconH3, IconHistory, IconItalic, IconLink, IconList, IconListNumbers, IconPencil, IconPhoto, IconQuote, IconSettings, IconShieldCheck } from "@tabler/icons-react";
import { blockingFailures, preflight } from "@/lib/content-preflight";
import { ActivityTimeline } from "@/components/portal/activity-timeline";
import { apiJson } from "@/components/portal/api-client";
import { countWords, readingMinutes, slugify } from "@/lib/rich-text";
import type { AssetRecord } from "@/platform/storage/asset-repository";
import { RichTextView } from "./rich-text-view";
import { contentTypes, draftRules, localeLabels, stateLabels, type ContentState, type Publication, type Revision } from "./editor-types";

type NewDraftSeed = { slug?: string; locale?: Publication["locale"]; type?: string };
type Props = {
  record: Publication | null;
  seed?: NewDraftSeed;
  siblings: Publication[];
  media: AssetRecord[];
  accountId: string;
  canDraft: boolean;
  canReview: boolean;
  canPublish: boolean;
  onBack: () => void;
  onOpen: (id: string) => void;
  onTranslate: (seed: NewDraftSeed) => void;
  onSaved: (record: Publication | null) => Promise<void>;
  initialNotice?: string;
};

type WorkflowAction = { state: ContentState; label: string; success: string; allowed: boolean; needsReason?: boolean; primary?: boolean };
const steps: Array<{ state: ContentState; label: string }> = [{ state: "DRAFT", label: "Draf" }, { state: "IN_REVIEW", label: "Review" }, { state: "APPROVED", label: "Disetujui" }, { state: "PUBLISHED", label: "Terbit" }];
const stepIndex: Record<ContentState, number> = { DRAFT: 0, CHANGES_REQUESTED: 1, IN_REVIEW: 1, APPROVED: 2, PUBLISHED: 3, ARCHIVED: 3 };

function autosize(element: HTMLTextAreaElement | null): void {
  if (!element) return;
  element.style.height = "auto";
  element.style.height = `${element.scrollHeight}px`;
}

export function EditorComposer({ record, seed, initialNotice, siblings, media, accountId, canDraft, canReview, canPublish, onBack, onOpen, onTranslate, onSaved }: Props): React.JSX.Element {
  const isNew = record === null;
  const editable = isNew ? canDraft : canDraft && record.authorAccountId === accountId && ["DRAFT", "CHANGES_REQUESTED"].includes(record.state);
  const [title, setTitle] = useState(record?.title ?? "");
  const [description, setDescription] = useState(record?.description ?? "");
  const [body, setBody] = useState(record?.body ?? "");
  const [slug, setSlug] = useState(record?.slug ?? seed?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!seed?.slug);
  const [locale, setLocale] = useState<Publication["locale"]>(record?.locale ?? seed?.locale ?? "id");
  const [type, setType] = useState(record?.type ?? seed?.type ?? contentTypes[0]);
  const [mode, setMode] = useState<"write" | "preview" | "compare">(editable ? "write" : "preview");
  const [publishAt, setPublishAt] = useState("");
  const [reason, setReason] = useState("");
  const [mediaAssetId, setMediaAssetId] = useState(record?.mediaAssetId ?? "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(initialNotice ? { tone: "ok", text: initialNotice } : null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [viewing, setViewing] = useState<Revision | null>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Server state changed (saved, transitioned, or another record opened): resync the form.
  useEffect(() => {
    setTitle(record?.title ?? ""); setDescription(record?.description ?? ""); setBody(record?.body ?? "");
    setMediaAssetId(record?.mediaAssetId ?? ""); setViewing(null); setReason("");
    if (!editable) setMode("preview");
  }, [record?.id, record?.version, record?.state]);

  useEffect(() => {
    if (!record) { setRevisions([]); return; }
    let active = true;
    void apiJson<{ revisions: Revision[] }>(`/api/v1/editor/publications?contentId=${encodeURIComponent(record.id)}`)
      .then((result) => { if (active) setRevisions([...result.revisions].sort((a, b) => b.version - a.version)); })
      .catch(() => { if (active) setRevisions([]); });
    return () => { active = false; };
  }, [record?.id, record?.version]);

  useLayoutEffect(() => { autosize(titleRef.current); autosize(descriptionRef.current); autosize(bodyRef.current); }, [title, description, body, mode]);

  const dirty = isNew ? !!(title || description || body) : !!record && (title !== record.title || description !== record.description || body !== (record.body ?? ""));
  const problems = [
    title.trim().length < draftRules.titleMin && `Judul minimal ${draftRules.titleMin} karakter`,
    description.trim().length < draftRules.descriptionMin && `Ringkasan minimal ${draftRules.descriptionMin} karakter`,
    body.trim().length < draftRules.bodyMin && `Isi minimal ${draftRules.bodyMin} karakter`,
    isNew && !draftRules.slug.test(slug) && "Slug hanya huruf kecil, angka, dan tanda hubung"
  ].filter((item): item is string => !!item);
  const canSave = editable && dirty && problems.length === 0 && !busy;

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent): void => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function save(): Promise<void> {
    if (!canSave) return;
    setBusy(true); setNotice(null);
    try {
      if (isNew) {
        const result = await apiJson<{ record: Publication }>("/api/v1/editor/publications", { title, description, body, slug, locale, type, meta: "KPI pratinjau", href: "/publik/publikasi", accent: "red" });
        await onSaved(result.record);
      } else {
        await apiJson("/api/v1/editor/publications/update", { contentId: record.id, expectedVersion: record.version, title, description, body });
        await onSaved(null);
      }
      setNotice({ tone: "ok", text: isNew ? "Draf dibuat. Lanjutkan menulis atau ajukan review." : "Perubahan tersimpan sebagai versi baru." });
    } catch {
      setNotice({ tone: "error", text: isNew ? "Draf gagal dibuat. Pastikan slug belum dipakai naskah lain dalam bahasa yang sama." : "Perubahan gagal disimpan. Naskah mungkin sudah diubah di tempat lain; muat ulang lalu coba lagi." });
    } finally { setBusy(false); }
  }

  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); void saveRef.current(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function transition(target: ContentState, success: string, needsReason: boolean): Promise<void> {
    if (!record) return;
    setBusy(true); setNotice(null);
    try {
      await apiJson("/api/v1/editor/publications/transition", { contentId: record.id, targetState: target, reason: needsReason ? reason : undefined });
      await onSaved(null);
      setNotice({ tone: "ok", text: success });
    } catch (cause) { setNotice({ tone: "error", text: target === "PUBLISHED" ? "Naskah belum lolos pemeriksaan sebelum terbit." : cause instanceof Error ? cause.message : "Status gagal diubah." }); }
    finally { setBusy(false); }
  }

  async function schedule(at: string | null): Promise<void> {
    if (!record) return;
    setBusy(true); setNotice(null);
    try {
      await apiJson("/api/v1/editor/publications/schedule", { contentId: record.id, publishAt: at ? new Date(at).toISOString() : null });
      await onSaved(null);
      setPublishAt("");
      setNotice({ tone: "ok", text: at ? "Naskah dijadwalkan terbit." : "Jadwal terbit dibatalkan." });
    } catch { setNotice({ tone: "error", text: "Jadwal gagal disimpan. Waktu harus minimal satu menit ke depan dan pemeriksaan sebelum terbit harus lolos." }); }
    finally { setBusy(false); }
  }

  async function saveMedia(): Promise<void> {
    if (!record) return;
    setBusy(true); setNotice(null);
    try {
      await apiJson("/api/v1/editor/publications/media", { contentId: record.id, expectedVersion: record.version, mediaAssetId: mediaAssetId || null });
      await onSaved(null);
      setNotice({ tone: "ok", text: "Gambar utama diperbarui." });
    } catch (cause) { setNotice({ tone: "error", text: cause instanceof Error ? cause.message : "Gambar gagal disimpan." }); }
    finally { setBusy(false); }
  }

  function edit(transform: (value: string, start: number, end: number) => { value: string; start: number; end: number }): void {
    const element = bodyRef.current;
    if (!element) return;
    const next = transform(body, element.selectionStart, element.selectionEnd);
    setBody(next.value);
    requestAnimationFrame(() => { element.focus(); element.setSelectionRange(next.start, next.end); });
  }
  const wrap = (mark: string, placeholder: string) => edit((value, start, end) => {
    const selected = value.slice(start, end) || placeholder;
    return { value: `${value.slice(0, start)}${mark}${selected}${mark}${value.slice(end)}`, start: start + mark.length, end: start + mark.length + selected.length };
  });
  const link = () => edit((value, start, end) => {
    const label = value.slice(start, end) || "teks tautan";
    const inserted = `[${label}](https://)`;
    const urlStart = start + label.length + 3;
    return { value: `${value.slice(0, start)}${inserted}${value.slice(end)}`, start: urlStart, end: urlStart + 8 };
  });
  const prefixLines = (prefix: (index: number) => string, pattern: RegExp) => edit((value, start, end) => {
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIndex = value.indexOf("\n", end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const lines = value.slice(lineStart, lineEnd).split("\n");
    const removing = lines.every((line) => pattern.test(line));
    const replaced = lines.map((line, index) => removing ? line.replace(pattern, "") : `${prefix(index)}${line.replace(/^(#{2,3}\s+|>\s?|[-*]\s+|\d+[.)]\s+)/, "")}`).join("\n");
    return { value: `${value.slice(0, lineStart)}${replaced}${value.slice(lineEnd)}`, start: lineStart, end: lineStart + replaced.length };
  });

  function onBodyKey(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "b") { event.preventDefault(); wrap("**", "teks tebal"); }
    if (key === "i") { event.preventDefault(); wrap("*", "teks miring"); }
    if (key === "k") { event.preventDefault(); link(); }
  }

  const tools: Array<{ label: string; shortcut?: string; icon: React.ReactNode; run: () => void }> = [
    { label: "Subjudul", icon: <IconH2 size={18} />, run: () => prefixLines(() => "## ", /^##\s+/) },
    { label: "Subjudul kecil", icon: <IconH3 size={18} />, run: () => prefixLines(() => "### ", /^###\s+/) },
    { label: "Tebal", shortcut: "Ctrl+B", icon: <IconBold size={18} />, run: () => wrap("**", "teks tebal") },
    { label: "Miring", shortcut: "Ctrl+I", icon: <IconItalic size={18} />, run: () => wrap("*", "teks miring") },
    { label: "Tautan", shortcut: "Ctrl+K", icon: <IconLink size={18} />, run: link },
    { label: "Daftar poin", icon: <IconList size={18} />, run: () => prefixLines(() => "- ", /^[-*]\s+/) },
    { label: "Daftar bernomor", icon: <IconListNumbers size={18} />, run: () => prefixLines((index) => `${index + 1}. `, /^\d+[.)]\s+/) },
    { label: "Kutipan", icon: <IconQuote size={18} />, run: () => prefixLines(() => "> ", /^>\s?/) }
  ];

  const actions: WorkflowAction[] = record ? ([
    { state: "IN_REVIEW", label: "Ajukan review", success: "Naskah dikirim ke antrean review.", allowed: canDraft && record.state === "DRAFT" && record.authorAccountId === accountId, primary: true },
    { state: "DRAFT", label: "Kembali ke draf", success: "Naskah kembali menjadi draf.", allowed: canDraft && record.state === "CHANGES_REQUESTED" },
    { state: "APPROVED", label: "Setujui", success: "Naskah disetujui.", allowed: canReview && record.state === "IN_REVIEW" && record.authorAccountId !== accountId, primary: true },
    { state: "CHANGES_REQUESTED", label: "Minta revisi", success: "Permintaan revisi dikirim ke penulis.", allowed: canReview && record.state === "IN_REVIEW" && record.authorAccountId !== accountId, needsReason: true },
    { state: "PUBLISHED", label: "Terbitkan", success: "Naskah terbit di situs publik.", allowed: canPublish && record.state === "APPROVED", primary: true },
    { state: "ARCHIVED", label: "Arsipkan", success: "Naskah diarsipkan.", allowed: canDraft && ["DRAFT", "CHANGES_REQUESTED", "APPROVED", "PUBLISHED"].includes(record.state), needsReason: true }
  ] satisfies WorkflowAction[]).filter((action) => action.allowed) : [];
  const needsReason = actions.some((action) => action.needsReason);
  const shown = viewing?.snapshot ?? { title, description, body };
  const words = countWords(body);
  const otherLocale: Publication["locale"] = (record?.locale ?? locale) === "id" ? "en" : "id";
  const translation = record ? siblings.find((item) => item.locale === otherLocale) : undefined;
  const images = media.filter((asset) => asset.status === "AVAILABLE" && !!asset.contentSha256 && ["image/png", "image/jpeg"].includes(asset.mimeType));
  // Same checks the server enforces on publish and schedule.
  const checks = preflight({ title, description, body, locale: record?.locale ?? locale, mediaStatus: record?.mediaAssetId ? media.find((asset) => asset.id === record.mediaAssetId)?.status ?? "UNAVAILABLE" : null, translationState: translation?.state ?? null });
  const blocked = blockingFailures(checks).length > 0;

  return <section className="cms-composer" aria-label={isNew ? "Naskah baru" : `Naskah ${record.title}`}>
    <header className="cms-composer__bar">
      <button className="cms-back" onClick={() => { if (!dirty || window.confirm("Perubahan belum disimpan. Tinggalkan naskah ini?")) onBack(); }} type="button"><IconArrowLeft size={18} aria-hidden="true" />Semua naskah</button>
      <span className={`cms-save-state ${dirty ? "is-dirty" : ""}`} role="status">{isNew ? dirty ? "Belum disimpan" : "Naskah baru" : dirty ? "Perubahan belum disimpan" : `Tersimpan · v${record.version}`}</span>
      <div className="cms-mode" role="group" aria-label="Mode editor">
        <button aria-pressed={mode === "write"} className={mode === "write" ? "is-selected" : ""} disabled={!editable || !!viewing} onClick={() => setMode("write")} type="button"><IconPencil size={16} aria-hidden="true" />Tulis</button>
        <button aria-pressed={mode === "preview"} className={mode === "preview" ? "is-selected" : ""} onClick={() => setMode("preview")} type="button"><IconEye size={16} aria-hidden="true" />Pratinjau</button>
        {translation && <button aria-pressed={mode === "compare"} className={mode === "compare" ? "is-selected" : ""} disabled={!!viewing} onClick={() => setMode("compare")} type="button"><IconColumns size={16} aria-hidden="true" />Bandingkan ID/EN</button>}
      </div>
      {editable && <button className="button button--primary" disabled={!canSave} onClick={() => void save()} title="Ctrl+S" type="button"><IconDeviceFloppy size={17} aria-hidden="true" />{busy ? "Menyimpan…" : isNew ? "Simpan draf" : "Simpan"}</button>}
    </header>

    {notice && <p className={`cms-notice cms-notice--${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.text}</p>}

    <div className="cms-composer__grid">
      <div className="cms-paper">
        {viewing && <div className="cms-banner"><IconHistory size={17} aria-hidden="true" /><span>Anda melihat <strong>v{viewing.version}</strong> ({stateLabels[viewing.snapshot.state]}) dari {new Date(viewing.recordedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}.</span><button className="button button--quiet" onClick={() => setViewing(null)} type="button">Kembali ke versi terkini</button></div>}
        {!editable && !viewing && record && <div className="cms-banner"><span>{record.authorAccountId === accountId ? `Naskah berstatus ${stateLabels[record.state].toLowerCase()} tidak dapat diubah.` : "Anda meninjau naskah milik penulis lain. Isi hanya dapat diubah oleh penulisnya."}</span></div>}
        {mode === "compare" && translation && record && !viewing ? <div className="cms-compare">{[record, translation].sort((a, b) => a.locale === b.locale ? 0 : a.locale === "id" ? -1 : 1).map((item) => {
          const own = item.id === record.id;
          const shownItem = own ? { ...item, title, description, body } : item;
          return <article className="cms-compare__col" key={item.id}>
            <header><strong>{localeLabels[item.locale]}</strong><span className={`cms-state cms-state--${item.state.toLowerCase()}`}>{stateLabels[item.state]}</span>{!own && <button className="cms-compare__open" onClick={() => onOpen(item.id)} type="button">Buka</button>}</header>
            <h2>{shownItem.title}</h2><p className="cms-preview__lead">{shownItem.description}</p>
            {shownItem.body ? <RichTextView className="cms-prose" source={shownItem.body} /> : <p className="cms-preview__empty">Isi belum ditulis.</p>}
          </article>;
        })}</div> : mode === "write" && editable && !viewing ? <>
          <textarea ref={titleRef} aria-label="Judul naskah" className="cms-surface cms-title" maxLength={draftRules.titleMax} onChange={(event) => { setTitle(event.target.value.replace(/\n/g, " ")); if (isNew && !slugTouched) setSlug(slugify(event.target.value)); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); descriptionRef.current?.focus(); } }} placeholder="Judul naskah" rows={1} value={title} />
          <textarea ref={descriptionRef} aria-label="Ringkasan naskah" className="cms-surface cms-lead" maxLength={draftRules.descriptionMax} onChange={(event) => setDescription(event.target.value)} placeholder="Tulis ringkasan singkat yang muncul di daftar publikasi…" rows={2} value={description} />
          <div className="cms-toolbar" role="toolbar" aria-label="Format teks">{tools.map((tool) => <button aria-label={tool.label} key={tool.label} onClick={tool.run} title={tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label} type="button">{tool.icon}</button>)}</div>
          <textarea ref={bodyRef} aria-label="Isi naskah" className="cms-surface cms-body" maxLength={draftRules.bodyMax} onChange={(event) => setBody(event.target.value)} onKeyDown={onBodyKey} placeholder={"Mulai menulis…\n\nGunakan toolbar untuk subjudul, daftar, kutipan, dan tautan."} value={body} />
        </> : <article className="cms-preview">
          <p className="eyebrow">{(viewing?.snapshot.type ?? type)} · {localeLabels[viewing?.snapshot.locale ?? record?.locale ?? locale]}</p>
          <h1>{shown.title || "Judul naskah"}</h1>
          {shown.description && <p className="cms-preview__lead">{shown.description}</p>}
          {shown.body ? <RichTextView className="cms-prose" source={shown.body} /> : <p className="cms-preview__empty">Isi naskah belum ditulis.</p>}
        </article>}
        <footer className="cms-paper__foot"><span>{words} kata · ±{readingMinutes(body)} menit baca</span><span>{body.length.toLocaleString("id-ID")} / {draftRules.bodyMax.toLocaleString("id-ID")} karakter</span></footer>
      </div>

      <aside className="cms-side">
        <section className="cms-panel" aria-labelledby="cms-status-title">
          <h3 id="cms-status-title"><IconCheck size={16} aria-hidden="true" />Status & alur</h3>
          <ol className="cms-steps">{steps.map((step, index) => {
            const current = record ? stepIndex[record.state] : -1;
            return <li className={index < current ? "is-done" : index === current ? "is-current" : ""} key={step.state}><span>{index < current ? <IconCheck size={12} aria-hidden="true" /> : index + 1}</span>{index === 1 && record?.state === "CHANGES_REQUESTED" ? "Perlu revisi" : index === 3 && record?.state === "ARCHIVED" ? "Arsip" : step.label}</li>;
          })}</ol>
          {isNew ? <p className="cms-panel__hint">Simpan sebagai draf dulu. Setelah itu naskah bisa diajukan untuk review oleh akun lain sebelum terbit.</p> : <>
            {actions.length === 0 && <p className="cms-panel__hint">{record.state === "PUBLISHED" ? "Naskah sudah tampil di situs publik." : record.state === "IN_REVIEW" && record.authorAccountId === accountId ? "Menunggu review dari akun lain. Penulis tidak dapat menyetujui naskahnya sendiri." : "Tidak ada tindakan yang tersedia untuk akun ini."}</p>}
            {needsReason && <label>Alasan (untuk revisi atau arsip)<textarea maxLength={500} onChange={(event) => setReason(event.target.value)} placeholder="Jelaskan singkat alasannya" rows={2} value={reason} /></label>}
            {actions.length > 0 && <div className="cms-actions">{actions.map((action) => <button className={`button ${action.primary ? "button--primary" : "button--quiet"}`} disabled={busy || dirty || !!action.needsReason && !reason.trim() || action.state === "PUBLISHED" && blocked} key={action.state} onClick={() => void transition(action.state, action.success, !!action.needsReason)} type="button">{action.label}</button>)}</div>}
            {record.state === "APPROVED" && canPublish && <div className="cms-schedule"><h4><IconCalendarTime size={15} aria-hidden="true" />Jadwalkan terbit</h4>{record.scheduledPublishAt ? <><p>Terbit otomatis {new Date(record.scheduledPublishAt).toLocaleString("id-ID", { timeZone: "Africa/Cairo", dateStyle: "full", timeStyle: "short" })} waktu Kairo.</p><button className="button button--quiet" disabled={busy} onClick={() => void schedule(null)} type="button">Batalkan jadwal</button></> : <><label>Waktu terbit (waktu perangkat)<input onChange={(event) => setPublishAt(event.target.value)} type="datetime-local" value={publishAt} /></label><button className="button button--quiet" disabled={busy || blocked || !publishAt || Date.parse(publishAt) <= Date.now() + 60_000} onClick={() => void schedule(publishAt)} type="button">Jadwalkan</button></>}</div>}
            {dirty && actions.length > 0 && <p className="cms-panel__hint">Simpan perubahan dulu sebelum mengubah status.</p>}
          </>}
        </section>

        {(editable || record && ["IN_REVIEW", "APPROVED"].includes(record.state)) && <section className="cms-panel" aria-labelledby="cms-checks-title">
          <h3 id="cms-checks-title"><IconShieldCheck size={16} aria-hidden="true" />Pemeriksaan sebelum terbit</h3>
          <ul className="cms-checks">{checks.map((check) => <li className={check.ok ? "is-ok" : check.blocking ? "is-fail" : "is-warn"} key={check.id}>{check.ok ? <IconCircleCheck size={16} aria-hidden="true" /> : check.blocking ? <IconCircleX size={16} aria-hidden="true" /> : <IconAlertTriangle size={16} aria-hidden="true" />}<span><strong>{check.label}</strong><small>{check.ok ? "Lolos" : check.blocking ? "Belum lolos" : "Perlu perhatian"} · {check.detail}</small></span></li>)}</ul>
          {blocked && <p className="cms-panel__hint">Naskah tidak dapat diterbitkan atau dijadwalkan sampai pemeriksaan bertanda merah lolos.</p>}
        </section>}

        <section className="cms-panel" aria-labelledby="cms-settings-title">
          <h3 id="cms-settings-title"><IconSettings size={16} aria-hidden="true" />Pengaturan</h3>
          {isNew ? <>
            <label>Bahasa<select disabled={!!seed?.locale} onChange={(event) => setLocale(event.target.value as Publication["locale"])} value={locale}><option value="id">Indonesia</option><option value="en">English</option></select></label>
            <label>Jenis konten<select onChange={(event) => setType(event.target.value)} value={type}>{contentTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Slug URL<input disabled={!!seed?.slug} maxLength={120} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value.toLowerCase()); }} value={slug} /><small className="cms-field-hint">Terisi otomatis dari judul. Tidak dapat diubah setelah draf dibuat.</small></label>
          </> : <dl className="cms-meta">
            <div><dt>Jenis</dt><dd>{record.type}</dd></div>
            <div><dt>Slug</dt><dd>/{record.slug}</dd></div>
            <div><dt>Bahasa</dt><dd><span className="cms-locales">{[record, ...siblings.filter((item) => item.id !== record.id)].sort((a, b) => a.locale.localeCompare(b.locale, "en") * -1).map((item) => <button className={item.id === record.id ? "is-selected" : ""} disabled={item.id === record.id} key={item.id} onClick={() => onOpen(item.id)} type="button">{item.locale.toUpperCase()}</button>)}</span></dd></div>
          </dl>}
          {!isNew && !translation && canDraft && <button className="button button--quiet" onClick={() => onTranslate({ slug: record.slug, locale: otherLocale, type: record.type })} type="button">Buat versi {localeLabels[otherLocale]}</button>}
        </section>

        {!isNew && <section className="cms-panel" aria-labelledby="cms-media-title">
          <h3 id="cms-media-title"><IconPhoto size={16} aria-hidden="true" />Gambar utama</h3>
          {editable ? <>
            <label>Pilih gambar<select onChange={(event) => setMediaAssetId(event.target.value)} value={mediaAssetId}><option value="">Tanpa gambar</option>{images.map((asset) => <option key={asset.id} value={asset.id}>{asset.fileName} · v{asset.version}</option>)}</select></label>
            {images.length === 0 && <p className="cms-panel__hint">Belum ada gambar PNG/JPG yang lulus pemeriksaan. Unggah lewat halaman Dokumen.</p>}
            <button className="button button--quiet" disabled={busy || dirty || mediaAssetId === (record.mediaAssetId ?? "")} onClick={() => void saveMedia()} type="button">Simpan gambar</button>
          </> : <p className="cms-panel__hint">{record.mediaAssetId ? media.find((asset) => asset.id === record.mediaAssetId)?.fileName ?? "Gambar terhubung" : "Tanpa gambar utama."}</p>}
        </section>}

        {!isNew && <section className="cms-panel" aria-labelledby="cms-history-title">
          <h3 id="cms-history-title"><IconHistory size={16} aria-hidden="true" />Riwayat versi</h3>
          {revisions.length === 0 ? <p className="cms-panel__hint">Belum ada versi tercatat.</p> : <ol className="cms-versions">{revisions.map((revision) => <li key={revision.id}><button className={viewing?.id === revision.id ? "is-selected" : ""} onClick={() => { setViewing(revision.version === record.version ? null : revision); setMode("preview"); }} type="button"><strong>v{revision.version}{revision.version === record.version ? " · terkini" : ""}</strong><span>{stateLabels[revision.snapshot.state]} · {new Date(revision.recordedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span></button></li>)}</ol>}
        </section>}

        {!isNew && <section className="cms-panel"><ActivityTimeline key={`${record.id}:${record.version}`} type="content" id={record.id} /></section>}
        {editable && problems.length > 0 && dirty && <section className="cms-panel cms-panel--todo" aria-label="Syarat menyimpan"><h3>Sebelum menyimpan</h3><ul>{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul></section>}
      </aside>
    </div>
  </section>;
}
