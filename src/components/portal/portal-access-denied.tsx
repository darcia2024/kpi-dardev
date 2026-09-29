import Link from "next/link";

export function PortalAccessDenied({ area }: { area: string }): React.JSX.Element {
  return <div className="portal-shell"><section className="state-panel state-panel--empty" role="alert"><p className="state-panel__label">Akses dibatasi</p><h1>Belum ada izin untuk {area}.</h1><p>Halaman ini memerlukan grant yang sesuai dengan organisasi dan periode aktif. Minta pengelola akses memeriksa penugasan akun jika pekerjaan ini seharusnya tersedia.</p><Link className="button button--quiet" href="/portal">Kembali ke portal</Link></section></div>;
}
