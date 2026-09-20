type StateKind = "empty" | "error" | "loading";

type StatePanelProps = {
  description: string;
  kind: StateKind;
  title: string;
};

const labels: Record<StateKind, string> = {
  empty: "Belum ada data",
  error: "Data tidak dapat dimuat",
  loading: "Memuat data"
};

export function StatePanel({ description, kind, title }: StatePanelProps): React.JSX.Element {
  return (
    <section aria-live={kind === "loading" ? "polite" : undefined} className={`state-panel state-panel--${kind}`}>
      <p className="state-panel__label">{labels[kind]}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}
