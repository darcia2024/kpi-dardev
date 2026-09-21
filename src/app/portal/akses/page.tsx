import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";

const accessScreens = [
  { id: "A04", title: "Profil & sesi", description: "Profil yang diizinkan, sesi aktif, preferensi, dan pencabutan sesi.", state: "Sesi TEST aktif" },
  { id: "A05", title: "Pengguna", description: "Daftar identitas, status, role, membership, dan histori perubahan.", state: "Menunggu service identitas" },
  { id: "A06", title: "Role & permission", description: "Matriks aksi, scope, masa berlaku, dan ringkasan dampak sebelum disimpan.", state: "Menunggu OD-01" },
  { id: "A07", title: "Organisasi", description: "Divisi, jabatan, dan membership per periode.", state: "Menunggu migrasi organisasi" },
  { id: "A08", title: "Periode", description: "Konteks periode planned, active, closing, atau closed.", state: "Konteks TEST belum dipilih" },
  { id: "A09", title: "Akses khusus", description: "Grant sementara dengan tujuan, scope, approver, dan expiry yang terlihat.", state: "Menunggu policy grant" },
  { id: "A10", title: "Akses darurat", description: "Request, persetujuan, countdown, dan post-review tanpa bypass langsung.", state: "Menunggu policy darurat" },
  { id: "A11", title: "Audit", description: "Jejak actor, aksi, resource, waktu, hasil, dan ekspor terkontrol.", state: "Menunggu audit query" }
];

export default async function AccessPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Identitas & akses</p><h1>Masuk diperlukan.</h1><p>Halaman ini hanya dapat dibuka setelah sesi TEST terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E02 · Akses dan identitas</p><span className="status-chip">UI TEST</span></div><h1>Pusat identitas & akses</h1><p>Rangkaian layar A04–A11 untuk mengelola konteks akses dengan jejak yang dapat ditelusuri.</p></header><section className="portal-context" aria-label="Identitas saat ini"><span>Akun</span><strong>{identity.email}</strong><span>Role</span><strong>{identity.roles.join(" · ")}</strong></section><section className="access-grid" aria-label="Daftar layar akses">{accessScreens.map((screen) => <article className="access-card" key={screen.id}><div className="access-card__top"><span className="workspace-card__number">{screen.id}</span><span className="status-chip">{screen.state}</span></div><h2>{screen.title}</h2><p>{screen.description}</p><span className="access-card__hint">Preview struktur UI</span></article>)}</section><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
