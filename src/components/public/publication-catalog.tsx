"use client";

import Link from "next/link";
import { IconArrowUpRight, IconBook2, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";

type Publication = { type: string; title: string; description: string; meta: string; href: string; accent: "red" | "rose" | "plum" | "sand" };

export function PublicationCatalog({ publications }: { publications: Publication[] }): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("Semua");
  const types = ["Semua", ...new Set(publications.map((publication) => publication.type))];
  const visiblePublications = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    return publications.filter((publication) => {
      const searchable = `${publication.type} ${publication.title} ${publication.description} ${publication.meta}`.toLocaleLowerCase("id");
      return (type === "Semua" || publication.type === type) && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [publications, query, type]);

  return <>
    <div className="kp-library-filter"><label><span className="sr-only">Cari materi publik</span><IconSearch size={19} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Cari topik atau judul" /></label><div className="kp-library-chips" aria-label="Filter kategori">{types.map((item) => <button type="button" key={item} className={type === item ? "is-active" : ""} aria-pressed={type === item} onClick={() => setType(item)}>{item}</button>)}</div></div>
    <p className="kp-library-result" aria-live="polite"><span>{String(visiblePublications.length).padStart(2, "0")}</span> materi ditemukan</p>
    {visiblePublications.length > 0 ? <div className="kp-library-grid">{visiblePublications.map((publication, index) => <article className={`kp-library-card kp-library-card--${publication.accent}`} key={publication.title}><div className="kp-library-card__top"><span>{publication.type}</span><small>{String(index + 1).padStart(2, "0")}</small></div><IconBook2 className="kp-library-card__icon" size={34} stroke={1.35} aria-hidden="true" /><h3>{publication.title}</h3><p>{publication.description}</p><div className="kp-library-card__foot"><span>{publication.href.startsWith("/#") ? `${publication.meta} · ringkasan beranda` : publication.meta}</span><Link href={publication.href} aria-label={`Baca ${publication.title}`}>Baca artikel <IconArrowUpRight size={18} aria-hidden="true" /></Link></div></article>)}</div> : <div className="kp-library-empty"><IconSearch size={26} aria-hidden="true" /><strong>Materi belum ditemukan.</strong><p>Coba gunakan kata kunci lain atau pilih semua kategori.</p></div>}
  </>;
}
