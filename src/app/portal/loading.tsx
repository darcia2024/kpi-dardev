// Shown instantly inside the portal frame while the next page waits on the server.
export default function PortalLoading(): React.JSX.Element {
  return <div className="portal-shell portal-loading" role="status" aria-live="polite">
    <span className="sr-only">Memuat halaman…</span>
    <div className="portal-loading__bar" aria-hidden="true" />
    <div className="portal-loading__heading" aria-hidden="true"><span /><span /><span /></div>
    <div className="portal-loading__panels" aria-hidden="true"><span /><span /><span /></div>
  </div>;
}
