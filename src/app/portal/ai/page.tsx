import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTestSession, sessionCookieName } from "@/platform/identity/test-auth";
import { AiWorkspace } from "@/components/ai/ai-workspace";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { PortalAccessDenied } from "@/components/portal/portal-access-denied";

export default async function AiPage(): Promise<React.JSX.Element> {
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return <div className="portal-shell"><header className="page-heading"><p className="eyebrow">I01–I06 · AI</p><h1>Masuk diperlukan.</h1><p>AI terkendali hanya dapat dibuka setelah sesi pratinjau terbentuk.</p></header><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;
  if (!hasTestPermission(identity, "AI_READ", scope)) return <PortalAccessDenied area="AI terkendali" />;
  return <div className="portal-shell"><header className="page-heading"><div className="intro-panel__topline"><p className="eyebrow">E11 · AI terkendali</p><span className="status-chip">Pratinjau lokal · provider nonaktif</span></div><h1>Periksa sumber sebelum bertindak.</h1><p>Tanya jawab tanpa provider, riwayat sesi, serta draf tata kelola dapat diperiksa di sini. Tidak ada jawaban AI eksternal atau tindakan otomatis sampai konfigurasi dan kebijakan disahkan.</p></header><section className="portal-context" aria-label="Konteks AI"><span>Akun</span><strong>{identity.email}</strong><span>Riwayat pertanyaan</span><strong>Memori sesi halaman</strong></section><AiWorkspace /><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></div>;
}
