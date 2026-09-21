"use client";

import { useMemo, useState } from "react";

const groups = [
  ["P", "Publik", 15, "E04"], ["A", "Akun & akses", 16, "E02/E10"], ["W", "Workspace", 5, "E05"], ["T", "Tugas", 11, "E05"], ["M", "Kalender & rapat", 7, "E06"], ["F", "Dokumen", 6, "E03"], ["K", "Knowledge", 4, "E09"], ["C", "Redaksi/CMS", 7, "E04"], ["S", "Layanan & kasus", 9, "E07"], ["N", "Notifikasi", 4, "E07"], ["B", "Keuangan", 9, "E08"], ["E", "Evaluasi", 8, "E09"], ["H", "Handover", 6, "E10"], ["I", "AI", 6, "E11"]
] as const;
const screens = groups.flatMap(([prefix, label, count, phase]) => Array.from({ length: count }, (_, index) => ({ id: `${prefix}${String(index + 1).padStart(2, "0")}`, label, phase, status: "UI TEST selesai awal" })));

export function ScreenCatalog(): React.JSX.Element {
  const [filter, setFilter] = useState("Semua");
  const visible = useMemo(() => filter === "Semua" ? screens : screens.filter((screen) => screen.label === filter), [filter]);
  return <section className="catalog-section"><div className="catalog-summary"><strong>{screens.length} layar</strong><span>14 kelompok · baseline rancangan</span><span>Mapping detail menyusul per task</span></div><div className="catalog-filter"><label>Kelompok<select aria-label="Filter kelompok" onChange={(event) => setFilter(event.target.value)} value={filter}><option>Semua</option>{groups.map(([, label]) => <option key={label}>{label}</option>)}</select></label><input aria-label="Cari ID layar" onChange={(event) => { const query = event.target.value.toUpperCase(); setFilter(query ? screens.find((screen) => screen.id === query)?.label ?? "__none__" : "Semua"); }} placeholder="Cari ID, contoh P01" /></div><div className="catalog-table" role="table" aria-label="Katalog 113 layar"><div className="catalog-row catalog-row--header" role="row"><span>ID</span><span>Kelompok</span><span>Fase</span><span>Status UI</span></div>{visible.map((screen) => <div className="catalog-row" key={screen.id} role="row"><strong>{screen.id}</strong><span>{screen.label}</span><span>{screen.phase}</span><span className={screen.status === "Belum dibangun" ? "catalog-status catalog-status--pending" : "catalog-status"}>{screen.status}</span></div>)}</div><p className="task-footnote">Katalog ini menghitung baseline 113 ID. Nama layar detail, requirement, owner, acceptance criteria, tes, dan bukti akan ditambahkan sebelum integrasi backend.</p></section>;
}
