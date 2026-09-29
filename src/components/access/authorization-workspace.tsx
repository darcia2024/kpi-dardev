"use client";

import { useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import { formatPreviewPeriodLabel } from "@/lib/period-label";

type Grant = { id: string; accountId: string; permission: string; organizationCode?: string; periodCode?: string; divisionCode?: string; objectId?: string; active: boolean; expiresAt?: string };
type Period = { code: string; status: "PLANNED" | "ACTIVE" | "CLOSING" | "CLOSED" };
const accounts = [
  { id: "00000000-0000-4000-8000-000000000101", label: "Admin pratinjau" },
  { id: "00000000-0000-4000-8000-000000000102", label: "Pengurus pratinjau" }
];

export function AuthorizationWorkspace({ accountId, availablePermissions }: { accountId: string; availablePermissions: readonly string[] }): React.JSX.Element {
  const grants = usePortalResource<Grant>("/api/v1/admin/authorization", "grants");
  const periods = usePortalResource<Period>("/api/v1/admin/authorization", "periods");
  const [accountFilter, setAccountFilter] = useState(accounts[1].id);
  const [permission, setPermission] = useState("TASK_READ");
  const [periodCode, setPeriodCode] = useState("2026_2027_TEST");
  const [expiry, setExpiry] = useState("");
  const [divisionCode, setDivisionCode] = useState("");
  const [objectId, setObjectId] = useState("");
  const [preflight, setPreflight] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const visible = grants.items.filter((grant) => grant.accountId === accountFilter);

  async function act(body: unknown, success: string): Promise<void> {
    setBusy(true); setMessage(""); setPreflight(null);
    try { await apiJson("/api/v1/admin/authorization", body); setMessage(success); await grants.reload(); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Perubahan izin gagal."); }
    finally { setBusy(false); }
  }

  const scope = { organizationCode: "KPI_TEST", periodCode, ...(divisionCode.trim() ? { divisionCode: divisionCode.trim() } : {}), ...(objectId.trim() ? { objectId: objectId.trim() } : {}) };

  async function checkPermission(): Promise<void> {
    setBusy(true); setMessage("");
    try {
      const result = await apiJson<{ allowed: boolean }>("/api/v1/admin/authorization", { action: "CHECK", accountId: accountFilter, permission, scope });
      setPreflight(result.allowed ? "Izin efektif: sudah diberikan untuk cakupan ini." : "Izin efektif: belum diberikan untuk cakupan ini.");
    } catch (cause) { setPreflight(null); setMessage(cause instanceof Error ? cause.message : "Pemeriksaan izin gagal."); }
    finally { setBusy(false); }
  }

  return <section className="editor-layout" aria-label="Izin pratinjau"><article className="editor-canvas"><p className="eyebrow">Grant akun</p><h2>Izin yang tersimpan</h2><label>Akun <select onChange={(event) => { setAccountFilter(event.target.value); setPreflight(null); }} value={accountFilter}>{accounts.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>{grants.loading && <p role="status">Memuat izin…</p>}{grants.error && <p role="alert">{grants.error} <button onClick={() => void grants.reload()} type="button">Coba lagi</button></p>}{!grants.loading && !grants.error && visible.length === 0 && <p>Belum ada grant untuk akun ini.</p>}{visible.map((grant) => <div className="knowledge-row" key={grant.id}><div><strong>{grant.permission}</strong><p>{grant.organizationCode === "KPI_TEST" ? "KPI PPMI Mesir" : grant.organizationCode ?? "Semua organisasi"} · {grant.periodCode ? formatPreviewPeriodLabel(grant.periodCode) : "Semua periode"}{grant.divisionCode ? ` · divisi ${grant.divisionCode}` : ""}{grant.objectId ? ` · objek ${grant.objectId.slice(0, 8)}` : ""}{grant.expiresAt ? ` · sampai ${new Date(grant.expiresAt).toLocaleString("id-ID")}` : ""}</p></div><button className="button button--quiet" disabled={busy || (grant.accountId === accountId && grant.permission === "IDENTITY_MANAGE")} onClick={() => void act({ action: "SET_ACTIVE", grantId: grant.id, active: !grant.active }, grant.active ? "Grant dinonaktifkan." : "Grant diaktifkan.")} type="button">{grant.active ? "Nonaktifkan" : "Aktifkan"}</button></div>)}</article><aside className="editor-sidebar"><p className="eyebrow">Matriks izin efektif</p><h2>Periksa sebelum grant</h2><label>Aksi <select onChange={(event) => { setPermission(event.target.value); setPreflight(null); }} value={permission}>{availablePermissions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Periode <select onChange={(event) => { setPeriodCode(event.target.value); setPreflight(null); }} value={periodCode}>{periods.items.filter((item) => item.status !== "CLOSED").map((item) => <option key={item.code} value={item.code}>{formatPreviewPeriodLabel(item.code)} · {item.status}</option>)}</select></label>{periods.loading && <p role="status">Memuat periode…</p>}{periods.error && <p role="alert">{periods.error}</p>}<button className="button button--quiet" onClick={() => void periods.reload()} type="button">Muat ulang periode</button><label>Divisi (opsional) <input maxLength={80} onChange={(event) => { setDivisionCode(event.target.value); setPreflight(null); }} value={divisionCode} /></label><label>ID objek (opsional) <input onChange={(event) => { setObjectId(event.target.value); setPreflight(null); }} value={objectId} /></label><button className="button button--quiet" disabled={busy || !!objectId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(objectId)} onClick={() => void checkPermission()} type="button">Periksa izin efektif</button>{preflight && <p role="status">{preflight}</p>}<label>Kedaluwarsa opsional <input onChange={(event) => setExpiry(event.target.value)} type="datetime-local" value={expiry} /></label><button className="button button--primary" disabled={busy || !!objectId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(objectId)} onClick={() => void act({ action: "CREATE", accountId: accountFilter, permission, scope, ...(expiry ? { expiresAt: new Date(expiry).toISOString() } : {}) }, "Grant baru dibuat.")} type="button">Buat grant</button><p className="editor-note">Grant dibuat untuk organisasi dan periode pratinjau. Akses produksi dan persetujuan grant resmi belum ditetapkan.</p></aside>{message && <p className="form-message" role="status">{message}</p>}</section>;
}
