const cairo = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" });

export function cairoDateKey(timestamp: string): string {
  const values = Object.fromEntries(cairo.formatToParts(new Date(timestamp)).map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function cairoMonthKey(timestamp: string): string { return cairoDateKey(timestamp).slice(0, 7); }

export function shiftMonth(monthKey: string, offset: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + offset, 1)).toISOString().slice(0, 7);
}

export function calendarCells(monthKey: string): Array<{ key: string; day: number } | null> {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const leading = (firstDay + 6) % 7;
  const total = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: Array<{ key: string; day: number } | null> = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= total; day += 1) cells.push({ key: `${monthKey}-${String(day).padStart(2, "0")}`, day });
  while (cells.length % 7) cells.push(null);
  return cells;
}
