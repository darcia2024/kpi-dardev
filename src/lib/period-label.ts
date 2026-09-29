export function formatPreviewPeriodLabel(code: string): string {
  return code.replace(/^(\d{4})_(\d{4})(?:_TEST)?$/, "$1–$2").replace(/_TEST$/, "").replaceAll("_", " ");
}
