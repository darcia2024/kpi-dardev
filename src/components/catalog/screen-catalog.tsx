"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { internalGroups, internalScreens, internalScreenTotals, type ScreenState } from "@/lib/internal-screen-registry";

const stateLabel: Record<ScreenState, string> = {
  connected: "API pratinjau terhubung",
  partial: "Sebagian tersedia",
  planned: "Belum dibangun"
};

export function ScreenCatalog(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [state, setState] = useState("all");
  const [shown, setShown] = useState(20);
  const visible = useMemo(() => internalScreens.filter((screen) => {
    const matchesQuery = `${screen.id} ${screen.title} ${screen.group}`.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID"));
    return matchesQuery && (group === "all" || screen.id.startsWith(group)) && (state === "all" || screen.state === state);
  }), [query, group, state]);

  return <section className="screen-catalog" aria-labelledby="internal-catalog-title">
    <div className="screen-catalog__summary">
      <div><span>Baseline internal</span><strong>{internalScreenTotals.total}</strong><small>15 ID publik dikelola terpisah</small></div>
      <div><span>API pratinjau terhubung</span><strong>{internalScreenTotals.connected}</strong><small>Belum berarti teruji menyeluruh</small></div>
      <div><span>Sebagian tersedia</span><strong>{internalScreenTotals.partial}</strong><small>Masih ada alur yang belum lengkap</small></div>
      <div><span>Belum dibangun</span><strong>{internalScreenTotals.planned}</strong><small>Belum ada alur operasional</small></div>
    </div>
    <div className="screen-catalog__intro"><div><p className="eyebrow">Registry Fase 0</p><h2 id="internal-catalog-title">Peta layar internal</h2><p>Buka tiap baris untuk melihat target perilaku, izin, dan API terkait. Tautan menuju halaman induk yang tersedia saat ini.</p></div><p>Label status adalah hasil audit awal, bukan sertifikasi siap produksi. Status “terhubung” masih perlu verifikasi lintas role dan alur.</p></div>
    <div className="screen-catalog__filters" role="search">
      <label>Cari ID atau nama<input onChange={(event) => { setQuery(event.target.value); setShown(20); }} placeholder="Contoh: T05 atau bukti" type="search" value={query} /></label>
      <label>Kelompok<select onChange={(event) => { setGroup(event.target.value); setShown(20); }} value={group}><option value="all">Semua kelompok</option>{internalGroups.map((entry) => <option key={entry.code} value={entry.code}>{entry.label}</option>)}</select></label>
      <label>Status<select onChange={(event) => { setState(event.target.value); setShown(20); }} value={state}><option value="all">Semua status</option><option value="connected">API pratinjau terhubung</option><option value="partial">Sebagian tersedia</option><option value="planned">Belum dibangun</option></select></label>
    </div>
    <p className="screen-catalog__count" role="status">Menampilkan {Math.min(shown, visible.length)} dari {visible.length} layar yang cocok.</p>
    {visible.length === 0 ? <div className="state-panel state-panel--empty"><h3>Tidak ada layar yang cocok.</h3><p>Coba ID, nama, atau filter lain.</p></div> : null}
    <div className="screen-catalog__list">
      {visible.slice(0, shown).map((screen) => <details className="screen-catalog__item" key={screen.id}>
        <summary><span className="screen-catalog__id">{screen.id}</span><span className="screen-catalog__name">{screen.title}<small>{screen.group} · {screen.phase}</small></span><span className={`screen-catalog__state screen-catalog__state--${screen.state}`}>{stateLabel[screen.state]}</span></summary>
        <div className="screen-catalog__detail"><div><strong>Kriteria selesai</strong><p>{screen.acceptance}</p></div><div><strong>Izin baca/aksi awal</strong><p>{screen.permission ?? "Sesi pratinjau"}</p></div><div><strong>Endpoint modul yang sudah ada</strong><p>{screen.api.length ? screen.api.join(" · ") : "Belum ada endpoint untuk alur ini."}</p></div><Link href={screen.route}>Buka halaman induk: {screen.route}</Link></div>
      </details>)}
    </div>
    {shown < visible.length ? <button className="button button--quiet screen-catalog__more" onClick={() => setShown((count) => count + 20)} type="button">Tampilkan 20 layar berikutnya</button> : null}
  </section>;
}
