import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { hasTestPermission, permissions } from "@/platform/authorization/permissions";
import { AuthorizationWorkspace } from "@/components/access/authorization-workspace";
import { DirectoryWorkspace } from "@/components/access/directory-workspace";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";

export default async function AccessPage(): Promise<React.JSX.Element> {
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">Identitas & akses</p><h1>Masuk diperlukan.</h1><p>Halaman ini hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "IDENTITY_READ") && !hasTestPermission(identity, "IDENTITY_MANAGE")) return <PortalAccessDenied area="identitas dan akses" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E02 · Akses dan identitas</p><span className="status-chip">Pratinjau lokal</span></div><h1>Pusat identitas & akses</h1><p>Lihat akun, periode, dan penugasan dalam cakupan KPI. Pengelola dapat mengatur grant pratinjau di bawah.</p></header><section className="portal-context" aria-label="Identitas saat ini"><span>Akun</span><strong>{identity.email}</strong><span>Role</span><strong>{identity.roles.join(" · ")}</strong></section><DirectoryWorkspace canManage={hasTestPermission(identity, "IDENTITY_MANAGE")} />{hasTestPermission(identity, "IDENTITY_MANAGE") ? <AuthorizationWorkspace accountId={identity.accountId} availablePermissions={permissions} /> : <p>Akun ini tidak memiliki izin untuk mengelola grant.</p>}<section className="state-panel state-panel--empty"><p className="state-panel__label">Langkah menuju operasional</p><h2>Lengkapi daftar pengurus resmi.</h2><p>Jabatan, divisi, penugasan, dan periode aktif perlu data yang disahkan KPI. Setelah itu akses akun dapat dikaitkan ke posisi tanpa mencampur periode.</p>{hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ") ? <Link className="button button--quiet" href="/portal/katalog">Lihat katalog internal</Link> : null}</section><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
