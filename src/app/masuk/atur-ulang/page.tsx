import { ResetPasswordForm } from "@/components/auth/password-recovery-forms";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";

export const dynamic = "force-dynamic";

// Local previews link with ?token=; hosted Supabase recovery links return ?code=.
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string | string[]; code?: string | string[] }> }): Promise<React.JSX.Element> {
  const params = await searchParams;
  const value = params.token ?? params.code;
  const token = typeof value === "string" && /^[\w-]{16,200}$/.test(value) ? value : "";
  return <div className="auth-shell">
    <section aria-labelledby="reset-title" className="auth-panel">
      <div className="intro-panel__topline"><p className="eyebrow">Pemulihan akun</p>{isTestAuthEnabled() && <span className="status-chip">Pratinjau lokal</span>}</div>
      <h1 id="reset-title">Buat kata sandi baru</h1>
      <p className="intro-panel__lead">Gunakan kata sandi yang belum pernah dipakai di layanan lain.</p>
      <ResetPasswordForm token={token} />
    </section>
  </div>;
}
