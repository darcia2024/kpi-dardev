import Link from "next/link";

const publications = [
  { type: "Panduan", title: "Panduan kerja pengurus · TEST", date: "Versi rancangan", language: "ID" },
  { type: "Notulen", title: "Catatan rapat persiapan · TEST", date: "Pratinjau internal", language: "ID" },
  { type: "Laporan", title: "Kerangka laporan organisasi · TEST", date: "Belum diterbitkan", language: "ID/EN" }
];

export default function PublicationsPage(): React.JSX.Element {
  return <div className="public-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">P07 · Publikasi & repository</p><span className="status-chip">Preview TEST</span></div><h1>Publikasi yang punya sumber.</h1><p>Daftar ini memperlihatkan bentuk katalog publik. Dokumen draf dan catatan internal tidak masuk ke hasil publikasi nyata.</p></header><section className="public-filter" aria-label="Filter publikasi"><input aria-label="Cari publikasi" placeholder="Cari judul atau kata kunci" type="search" /><select aria-label="Filter tipe" defaultValue="all"><option value="all">Semua tipe</option><option value="panduan">Panduan</option><option value="laporan">Laporan</option></select><select aria-label="Filter bahasa" defaultValue="all"><option value="all">Semua bahasa</option><option value="id">Indonesia</option><option value="en">English</option></select></section><section className="publication-list" aria-label="Daftar publikasi">{publications.map((publication) => <article className="publication-row" key={publication.title}><div><p className="eyebrow">{publication.type} · {publication.language}</p><h2>{publication.title}</h2><p>{publication.date} · Sumber dan versi akan tampil di detail.</p></div><span className="status-chip">TEST</span><button className="row-action" type="button">Detail</button></article>)}</section><div className="public-actions"><Link className="button button--quiet" href="/publik">Kembali ke informasi publik</Link><Link className="button button--primary" href="/publik/aspirasi">Sampaikan aspirasi</Link></div></div>;
}
