"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/components/portal/api-client";

type AuditEvent = { id: string; action: string; module: string; entityType: string; entityId?: string; actorAccountId?: string; reason?: string; result: string; createdAt: string };
type Operations = { events: AuditEvent[]; integrations: { databaseConfiguration: string; storage: string; notificationProvider: string; aiProvider: string } };
type BackupRun = { id: string; createdAt: string; status: "VERIFIED"; recordCount: number; assetCount: number };
const statusLabel: Record<string, string> = { READY: "Konfigurasi tersedia", NOT_CONFIGURED: "Belum dikonfigurasi", INVALID_CONFIGURATION: "Konfigurasi tidak valid", NOT_CONNECTED: "Belum terhubung" };

export function OperationsWorkspace(): React.JSX.Element {
  const [data, setData] = useState<Operations | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState("ALL");
  const [actorQuery, setActorQuery] = useState("");
  const [entityQuery, setEntityQuery] = useState("");
  const [backups, setBackups] = useState<BackupRun[]>([]);
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupMessage, setBackupMessage] = useState("");
  async function reload(): Promise<void> {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if (actorQuery.trim()) params.set("actor", actorQuery.trim());
      if (entityQuery.trim()) params.set("entity", entityQuery.trim());
      setData(await apiJson<Operations>(`/api/v1/admin/operations${params.size ? `?${params}` : ""}`));
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Status operasi gagal dimuat."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void reload(); }, []);
  useEffect(() => { void apiJson<{ runs: BackupRun[] }>("/api/v1/admin/backup").then((result) => setBackups(result.runs)).catch(() => setBackupMessage("Riwayat backup belum dapat dimuat.")); }, []);
  async function verifyBackup(): Promise<void> {
    setBackupBusy(true); setBackupMessage("");
    try { const { run } = await apiJson<{ run: BackupRun }>("/api/v1/admin/backup", {}); setBackups((items) => [run, ...items]); setBackupMessage("Snapshot lokal dan uji pemulihan selesai; database serta hash file privat cocok."); await reload(); }
    catch (cause) { setBackupMessage(cause instanceof Error ? cause.message : "Backup lokal gagal diverifikasi."); }
    finally { setBackupBusy(false); }
  }
  const modules = [...new Set(data?.events.map((event) => event.module) ?? [])].sort();
  const events = data?.events.filter((event) => module === "ALL" || event.module === module) ?? [];
  return <>
    {loading && <p role="status">Memuat status operasi…</p>}
    {error && <p role="alert">{error} <button onClick={() => void reload()} type="button">Coba lagi</button></p>}
    <section className="operations-panel" aria-label="Cari jejak audit"><p className="eyebrow">A13 · Audit aktivitas</p><h2>Telusuri aktor atau objek</h2><p>Kosongkan kedua kolom untuk melihat 100 kejadian terbaru. Pencarian ID memeriksa seluruh riwayat lokal, lalu menampilkan hingga 100 hasil terakhir.</p><div className="audit-search"><label>ID aktor<input value={actorQuery} onChange={(event) => setActorQuery(event.target.value)} placeholder="UUID akun (opsional)" /></label><label>ID objek<input value={entityQuery} onChange={(event) => setEntityQuery(event.target.value)} placeholder="UUID objek (opsional)" /></label><button className="button button--quiet" disabled={loading || !!actorQuery && !/^[0-9a-f-]{36}$/i.test(actorQuery.trim()) || !!entityQuery && !/^[0-9a-f-]{36}$/i.test(entityQuery.trim())} onClick={() => void reload()} type="button">Cari audit</button></div></section>
    {data && <><section className="operations-grid" aria-label="Status integrasi"><article className="operations-panel"><p className="eyebrow">Database</p><h2>{statusLabel[data.integrations.databaseConfiguration] ?? data.integrations.databaseConfiguration}</h2><p>Status ini hanya memeriksa konfigurasi; koneksi dan migrasi belum diuji di sini.</p></article><article className="operations-panel"><p className="eyebrow">Storage & provider</p><h2>Belum aktif</h2><p>Storage: {statusLabel[data.integrations.storage] ?? data.integrations.storage}. Notifikasi: {statusLabel[data.integrations.notificationProvider] ?? data.integrations.notificationProvider}. AI: {statusLabel[data.integrations.aiProvider] ?? data.integrations.aiProvider}.</p></article></section><section className="operations-grid" aria-label="Backup lokal"><article className="operations-panel"><p className="eyebrow">A15 · Backup dan restore</p><h2>Uji pemulihan lokal</h2><p>Snapshot SQLite dan file privat diperiksa di lokasi terpisah, di luar folder proyek. Ini belum menggantikan backup infrastruktur produksi.</p><button className="button button--quiet" disabled={backupBusy} onClick={() => void verifyBackup()} type="button">{backupBusy ? "Memverifikasi…" : "Buat snapshot dan uji"}</button>{backupMessage ? <p role="status">{backupMessage}</p> : null}</article><article className="operations-panel"><p className="eyebrow">Riwayat verifikasi</p><h2>{backups.length} snapshot</h2>{backups.length ? <ol>{backups.slice(0, 5).map((run) => <li key={run.id}>{new Date(run.createdAt).toLocaleString("id-ID")} · {run.recordCount} rekaman · {run.assetCount} file · {run.status}</li>)}</ol> : <p>Belum ada snapshot yang diverifikasi.</p>}</article></section><section className="operations-audit"><div className="operations-audit__head"><div><p className="eyebrow">Audit lokal</p><h2>Aktivitas terbaru</h2><p>100 kejadian terakhir di lingkungan pratinjau; tidak mencakup audit infrastruktur.</p></div><label>Modul<select onChange={(event) => setModule(event.target.value)} value={module}><option value="ALL">Semua modul</option>{modules.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div>{events.length ? <ol>{events.map((event) => <li key={event.id}><div><strong>{event.action.replaceAll("_", " ")}</strong><span>{event.module} · {event.entityType}{event.entityId ? ` · ${event.entityId}` : ""}</span><span>Aktor: {event.actorAccountId ?? "Sistem"}</span>{event.reason && <p>Alasan: {event.reason}</p>}</div><small>{new Date(event.createdAt).toLocaleString("id-ID")} · {event.result}</small></li>)}</ol> : <p>Belum ada kejadian untuk filter ini.</p>}</section></>}
  </>;
}
