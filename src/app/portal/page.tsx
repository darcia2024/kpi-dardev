import { StatePanel } from "@/components/ui/state-panel";

export default function PortalPage(): React.JSX.Element {
  return (
    <div className="portal-shell">
      <header className="page-heading">
        <p className="eyebrow">Portal pengurus</p>
        <h1>Ruang kerja pengurus</h1>
        <p>Halaman ini menjadi titik masuk workspace setelah autentikasi dan hak akses selesai dibangun.</p>
      </header>
      <StatePanel
        description="Belum ada sesi pengurus yang dapat digunakan. Login dan pengelolaan hak akses dikerjakan pada fase berikutnya."
        kind="empty"
        title="Portal belum dapat diakses"
      />
    </div>
  );
}
