"use client";

import Link from "next/link";
import { IconArrowUpRight, IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { publicServices } from "@/lib/public-services";

export function ServiceFinder(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const categories = ["Semua", ...new Set(publicServices.map((service) => service.category))];
  const services = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("id");
    return publicServices.filter((service) => (category === "Semua" || service.category === category) && (!term || `${service.title} ${service.description} ${service.category}`.toLocaleLowerCase("id").includes(term)));
  }, [category, query]);

  return <>
    <div className="kp-service-filter"><label><span className="sr-only">Cari informasi publik</span><IconSearch size={19} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Cari topik atau informasi" /></label><div aria-label="Filter topik" className="kp-service-filter__chips">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={category === item ? "is-active" : ""}>{item}</button>)}</div></div>
    <p className="kp-service-result" aria-live="polite"><span>{String(services.length).padStart(2, "0")}</span> halaman ditemukan</p>
    {services.length ? <div className="kp-service-grid">{services.map((service, index) => <Link href={service.href} key={service.href}><div><span>0{index + 1}</span><service.icon size={27} stroke={1.45} aria-hidden="true" /></div><p>{service.category}</p><strong>{service.title}</strong><small>{service.description}</small><IconArrowUpRight className="kp-service-grid__arrow" size={20} aria-hidden="true" /></Link>)}</div> : <div className="kp-service-empty"><IconSearch size={26} aria-hidden="true" /><strong>Halaman belum ditemukan.</strong><p>Coba kata kunci atau kategori lain.</p></div>}
  </>;
}
