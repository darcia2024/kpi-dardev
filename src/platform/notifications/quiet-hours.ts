// Quiet hours only hold back optional notices on external channels (email, push).
// The in-app inbox always receives every notice, and mandatory notices are never held.

export type QuietHours = { enabled: boolean; start: string; end: string };
export const organizationTimeZone = "Africa/Cairo";
export const defaultQuietHours: QuietHours = { enabled: false, start: "23:00", end: "06:00" };
const clock = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidClock(value: string): boolean {
  return clock.test(value);
}

function minutes(value: string): number {
  const [, hours, mins] = clock.exec(value)!;
  return Number(hours) * 60 + Number(mins);
}

export function minutesInZone(now: Date, timeZone = organizationTimeZone): number {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return value("hour") * 60 + value("minute");
}

// Windows may cross midnight (23:00–06:00). Start is inclusive, end exclusive; equal start/end means no window.
export function isWithinQuietHours(quiet: QuietHours, now: Date, timeZone = organizationTimeZone): boolean {
  if (!quiet.enabled || !isValidClock(quiet.start) || !isValidClock(quiet.end)) return false;
  const start = minutes(quiet.start);
  const end = minutes(quiet.end);
  if (start === end) return false;
  const current = minutesInZone(now, timeZone);
  return start < end ? current >= start && current < end : current >= start || current < end;
}

export function shouldDeliverExternally(notice: { mandatory: boolean }, quiet: QuietHours, now: Date): boolean {
  return notice.mandatory || !isWithinQuietHours(quiet, now);
}
