import { formatPreviewPeriodLabel } from "@/lib/period-label";
import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";

export default async function ProfilePage(): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">A04–A05 · Profil</p><h1>Masuk diperlukan.</h1></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">A04–A05 · Profil & preferensi</p><span className="status-chip">Akun pratinjau</span></div><h1>Profil saya.</h1><p>Identitas sesi dan preferensi tampilan untuk portal lokal.</p></header><section className="profile-grid"><article className="operations-panel"><p className="eyebrow">Identitas sesi</p><h2>{identity.name}</h2><dl><div><dt>Email</dt><dd>{identity.email}</dd></div><div><dt>Role pratinjau</dt><dd>{identity.roles.join(" · ")}</dd></div><div><dt>Periode</dt><dd>{formatPreviewPeriodLabel(scope.periodCode)}</dd></div></dl><p>Nama, email, dan keanggotaan resmi belum dapat diubah dari portal pratinjau.</p></article><article className="operations-panel"><p className="eyebrow">Preferensi perangkat</p><h2>Tampilan</h2><p>Gunakan tombol tema di kanan atas portal. Pilihan terang atau gelap tersimpan pada browser ini.</p><div className="profile-actions"><SignOutButton /></div></article></section><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
