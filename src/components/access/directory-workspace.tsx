"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/components/portal/api-client";
import { formatPreviewPeriodLabel } from "@/lib/period-label";
import type { DirectorySnapshot } from "@/platform/identity/directory-service";

type HistoryEvent = { id: string; action: string; actorAccountId?: string; createdAt: string; metadata?: Record<string, unknown> };

const periodLabels: Record<string, string> = { PLANNED: "Direncanakan", ACTIVE: "Aktif", CLOSING: "Penutupan", CLOSED: "Ditutup" };

export function DirectoryWorkspace({ canManage }: { canManage: boolean }): React.JSX.Element {
  const [directory, setDirectory] = useState<DirectorySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [periodCode, setPeriodCode] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [positionCode, setPositionCode] = useState("");
  const [positionName, setPositionName] = useState("");
  const [divisionCode, setDivisionCode] = useState("");
  const [divisionName, setDivisionName] = useState("");
  const [positionDivisionId, setPositionDivisionId] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [accountHistory, setAccountHistory] = useState<HistoryEvent[]>([]);
  const [accountId, setAccountId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [assignmentPeriodId, setAssignmentPeriodId] = useState("");
  const [assignmentStartsOn, setAssignmentStartsOn] = useState("");
  const [assignmentEndDate, setAssignmentEndDate] = useState("");

  async function reload(): Promise<void> {
    const result = await apiJson<{ directory: DirectorySnapshot }>("/api/v1/admin/directory");
    setDirectory(result.directory);
  }

  async function act(body: Record<string, unknown>, success: string): Promise<void> {
    setBusy(true); setMessage(""); setError("");
    try {
      await apiJson("/api/v1/admin/directory", body);
      await reload();
      if (body.action === "CREATE_PERIOD") { setPeriodCode(""); setStartsOn(""); setEndsOn(""); }
      if (body.action === "CREATE_POSITION") { setPositionCode(""); setPositionName(""); }
      if (body.action === "CREATE_DIVISION") { setDivisionCode(""); setDivisionName(""); }
      if (body.action === "ASSIGN") { setAssignmentStartsOn(""); }
      if (body.action === "END_ASSIGNMENT") { setAssignmentEndDate(""); }
      setMessage(success);
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Perubahan direktori gagal disimpan."); }
    finally { setBusy(false); }
  }

  useEffect(() => {
    let cancelled = false;
    apiJson<{ directory: DirectorySnapshot }>("/api/v1/admin/directory")
      .then((result) => { if (!cancelled) setDirectory(result.directory); })
      .catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Direktori gagal dimuat."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedAccountId) return;
    let cancelled = false;
    apiJson<{ history: HistoryEvent[] }>(`/api/v1/admin/directory?accountId=${encodeURIComponent(selectedAccountId)}`)
      .then((result) => { if (!cancelled) setAccountHistory(result.history); })
      .catch(() => { if (!cancelled) setAccountHistory([]); });
    return () => { cancelled = true; };
  }, [selectedAccountId, directory]);

  return <section className="access-directory" aria-labelledby="directory-title">
    <div className="access-directory__heading"><div><p className="eyebrow">A06–A09 · Direktori dan periode</p><h2 id="directory-title">Orang, jabatan, dan masa kerja</h2><p>Dasar untuk memastikan penugasan dan hak akses mengikuti periode yang tepat.</p></div>{directory && <span className="status-chip">{directory.source === "LOCAL_PREVIEW" ? "Pratinjau lokal" : "Database terhubung"}</span>}</div>
    {loading && <p role="status">Memuat direktori…</p>}
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    {directory && <div className="access-directory__grid">
      <article className="access-directory__panel"><div className="access-directory__panel-head"><h3>Akun dalam cakupan</h3><span>{directory.accounts.length}</span></div>{directory.accounts.length ? <ul>{directory.accounts.map((account) => <li key={account.id}><div><strong>{account.name}</strong><small>{account.email}</small></div><div className="access-directory__meta"><span>{account.status === "ACTIVE" ? "Aktif" : account.status}</span><small>{account.roles.join(" · ") || "Belum ada role"}</small><button className="button button--quiet" onClick={() => setSelectedAccountId(account.id)} type="button">Lihat detail</button></div></li>)}</ul> : <p>Belum ada akun yang ditugaskan ke organisasi ini.</p>}{directory.source === "LOCAL_PREVIEW" && <p className="access-directory__note">Akun di atas hanya untuk masuk dan menguji portal; bukan daftar pengurus KPI.</p>}</article>
      <article className="access-directory__panel"><div className="access-directory__panel-head"><h3>Periode</h3><span>{directory.periods.length}</span></div>{directory.periods.length ? <ul>{directory.periods.map((period) => <li key={period.id}><div><strong>{formatPreviewPeriodLabel(period.code)}</strong><small>{period.startsOn} — {period.endsOn}</small></div><span className="access-directory__period-state">{periodLabels[period.status]}</span></li>)}</ul> : <p>Belum ada periode organisasi.</p>}{!directory.periods.some((period) => period.status === "ACTIVE") && <p className="access-directory__note">Belum ada periode aktif yang ditetapkan.</p>}</article>
      <article className="access-directory__panel access-directory__panel--wide"><div className="access-directory__panel-head"><h3>Divisi, jabatan, dan penugasan</h3><span>{directory.assignments.length} penugasan</span></div>{directory.divisions.length > 0 && <p>{directory.divisions.map((division) => division.name).join(" · ")}</p>}{directory.positions.length > 0 && <p>{directory.positions.map((position) => position.name).join(" · ")}</p>}{directory.assignments.length ? <ul>{directory.assignments.map((assignment) => { const account = directory.accounts.find((item) => item.id === assignment.accountId); const position = directory.positions.find((item) => item.id === assignment.positionId); const division = directory.divisions.find((item) => item.id === position?.divisionId); return <li key={assignment.id}><div><strong>{account?.name ?? "Akun tidak tersedia"}</strong><small>{position?.name ?? "Jabatan tidak tersedia"}{division ? ` · ${division.name}` : ""} · {directory.periods.find((period) => period.id === assignment.periodId)?.code ?? "Periode tidak tersedia"}</small></div><div><small>{assignment.startsOn}{assignment.endsOn ? ` — ${assignment.endsOn}` : " — masih ditugaskan"}</small>{canManage && directory.source === "LOCAL_PREVIEW" && !assignment.endsOn && <div className="access-directory__end"><label>Berakhir pada<input aria-label={`Tanggal akhir penugasan ${account?.name ?? assignment.id}`} onChange={(event) => setAssignmentEndDate(event.target.value)} type="date" value={assignmentEndDate} /></label><button className="button button--quiet" disabled={busy || !assignmentEndDate} onClick={() => void act({ action: "END_ASSIGNMENT", assignmentId: assignment.id, endsOn: assignmentEndDate }, "Penugasan diakhiri.")} type="button">Akhiri</button></div>}</div></li>; })}</ul> : <p>Belum ada penugasan yang tercatat. Pengurus resmi akan diisi setelah daftar disahkan KPI.</p>}</article>
    </div>}
    {directory && selectedAccountId && <article className="access-directory__panel" aria-label="Detail akun terpilih">
      <div className="access-directory__panel-head"><h3>{directory.accounts.find((account) => account.id === selectedAccountId)?.name ?? "Detail akun"}</h3><button className="button button--quiet" onClick={() => setSelectedAccountId("")} type="button">Tutup</button></div>
      <p>{directory.accounts.find((account) => account.id === selectedAccountId)?.email}</p>
      <h4>Penugasan lintas periode</h4>
      <ul>{directory.assignments.filter((assignment) => assignment.accountId === selectedAccountId).map((assignment) => {
        const position = directory.positions.find((item) => item.id === assignment.positionId);
        const division = directory.divisions.find((item) => item.id === position?.divisionId);
        return <li key={assignment.id}><strong>{position?.name ?? "Jabatan tidak tersedia"}</strong><small>{division?.name ?? "Tingkat organisasi"} · {directory.periods.find((period) => period.id === assignment.periodId)?.code ?? "Periode tidak tersedia"} · {assignment.startsOn}—{assignment.endsOn ?? "berlangsung"}</small></li>;
      })}</ul>
      <h4>Riwayat perubahan</h4>
      {accountHistory.length ? <ul>{accountHistory.map((event) => <li key={event.id}><strong>{event.action === "ASSIGNMENT_CREATED" ? "Penugasan dibuat" : event.action === "ASSIGNMENT_ENDED" ? "Penugasan diakhiri" : event.action}</strong><small>{new Date(event.createdAt).toLocaleString("id-ID")} · Aktor {directory.accounts.find((account) => account.id === event.actorAccountId)?.name ?? "Tidak tersedia"}</small></li>)}</ul> : <p>Belum ada perubahan penugasan yang tercatat.</p>}
    </article>}
    {directory?.source === "LOCAL_PREVIEW" && canManage && <div className="access-directory__manage" aria-label="Kelola struktur pratinjau">
      <p className="access-directory__note">Perubahan di bawah hanya untuk organisasi pratinjau lokal. Data ini tidak membuat akun produksi atau menetapkan struktur resmi KPI.</p>
      <div className="access-directory__form-grid"><form onSubmit={(event) => { event.preventDefault(); void act({ action: "CREATE_PERIOD", code: periodCode, startsOn, endsOn }, "Periode pratinjau dibuat."); }}><h3>Buat periode</h3><label>Kode periode<input maxLength={40} onChange={(event) => setPeriodCode(event.target.value)} placeholder="Contoh: PERIODE_2027" required value={periodCode} /></label><label>Mulai<input onChange={(event) => setStartsOn(event.target.value)} required type="date" value={startsOn} /></label><label>Selesai<input onChange={(event) => setEndsOn(event.target.value)} required type="date" value={endsOn} /></label><button className="button button--quiet" disabled={busy || !periodCode.trim() || !startsOn || !endsOn || startsOn >= endsOn} type="submit">Simpan periode</button></form>
      <form onSubmit={(event) => { event.preventDefault(); void act({ action: "CREATE_DIVISION", code: divisionCode, name: divisionName }, "Divisi pratinjau dibuat."); }}><h3>Buat divisi</h3><label>Kode divisi<input maxLength={40} onChange={(event) => setDivisionCode(event.target.value)} required value={divisionCode} /></label><label>Nama divisi<input maxLength={120} onChange={(event) => setDivisionName(event.target.value)} required value={divisionName} /></label><button className="button button--quiet" disabled={busy || !divisionCode.trim() || divisionName.trim().length < 3} type="submit">Simpan divisi</button></form>
      <form onSubmit={(event) => { event.preventDefault(); void act({ action: "CREATE_POSITION", code: positionCode, name: positionName, divisionId: positionDivisionId || undefined }, "Jabatan pratinjau dibuat."); }}><h3>Buat jabatan</h3><label>Kode jabatan<input maxLength={40} onChange={(event) => setPositionCode(event.target.value)} placeholder="Contoh: KOORDINATOR" required value={positionCode} /></label><label>Nama jabatan<input maxLength={120} onChange={(event) => setPositionName(event.target.value)} required value={positionName} /></label><label>Divisi (opsional)<select onChange={(event) => setPositionDivisionId(event.target.value)} value={positionDivisionId}><option value="">Tingkat organisasi</option>{directory.divisions.map((division) => <option key={division.id} value={division.id}>{division.name}</option>)}</select></label><button className="button button--quiet" disabled={busy || !positionCode.trim() || positionName.trim().length < 3} type="submit">Simpan jabatan</button></form>
      <form onSubmit={(event) => { event.preventDefault(); void act({ action: "ASSIGN", accountId, positionId, periodId: assignmentPeriodId, startsOn: assignmentStartsOn }, "Penugasan pratinjau dibuat."); }}><h3>Tugaskan akun</h3><label>Akun<select onChange={(event) => setAccountId(event.target.value)} required value={accountId}><option value="">Pilih akun</option>{directory.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select></label><label>Jabatan<select onChange={(event) => setPositionId(event.target.value)} required value={positionId}><option value="">Pilih jabatan</option>{directory.positions.map((position) => <option key={position.id} value={position.id}>{position.name}</option>)}</select></label><label>Periode<select onChange={(event) => setAssignmentPeriodId(event.target.value)} required value={assignmentPeriodId}><option value="">Pilih periode</option>{directory.periods.filter((period) => period.status !== "CLOSED").map((period) => <option key={period.id} value={period.id}>{formatPreviewPeriodLabel(period.code)}</option>)}</select></label><label>Mulai bertugas<input onChange={(event) => setAssignmentStartsOn(event.target.value)} required type="date" value={assignmentStartsOn} /></label><button className="button button--quiet" disabled={busy || !accountId || !positionId || !assignmentPeriodId || !assignmentStartsOn} type="submit">Simpan penugasan</button></form></div>
      <div className="access-directory__transitions"><h3>Status periode</h3>{directory.periods.filter((period) => period.status !== "CLOSED").map((period) => { const next = period.status === "PLANNED" ? "ACTIVE" : period.status === "ACTIVE" ? "CLOSING" : "CLOSED"; return <div key={period.id}><span>{formatPreviewPeriodLabel(period.code)} · {periodLabels[period.status]}</span><button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "SET_PERIOD_STATUS", periodId: period.id, status: next }, `Periode menjadi ${periodLabels[next].toLowerCase()}.`)} type="button">Ubah ke {periodLabels[next]}</button></div>; })}</div>
    </div>}
  </section>;
}
