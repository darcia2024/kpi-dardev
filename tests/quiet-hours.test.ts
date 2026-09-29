import assert from "node:assert/strict";
import test from "node:test";
import { isWithinQuietHours, shouldDeliverExternally } from "@/platform/notifications/quiet-hours";

// Cairo is UTC+3 during summer time (late September 2026).
const cairo = (time: string) => new Date(`2026-09-15T${time}:00+03:00`);
const overnight = { enabled: true, start: "23:00", end: "06:00" };

test("overnight quiet hours follow Cairo time and cross midnight", () => {
  assert.equal(isWithinQuietHours(overnight, cairo("23:00")), true);
  assert.equal(isWithinQuietHours(overnight, cairo("02:30")), true);
  assert.equal(isWithinQuietHours(overnight, cairo("05:59")), true);
  assert.equal(isWithinQuietHours(overnight, cairo("06:00")), false);
  assert.equal(isWithinQuietHours(overnight, cairo("22:59")), false);
});

test("same-day windows, disabled windows, and invalid clocks never hold notices", () => {
  const afternoon = { enabled: true, start: "13:00", end: "15:00" };
  assert.equal(isWithinQuietHours(afternoon, cairo("14:00")), true);
  assert.equal(isWithinQuietHours(afternoon, cairo("15:00")), false);
  assert.equal(isWithinQuietHours({ ...overnight, enabled: false }, cairo("02:00")), false);
  assert.equal(isWithinQuietHours({ enabled: true, start: "10:00", end: "10:00" }, cairo("10:00")), false);
  assert.equal(isWithinQuietHours({ enabled: true, start: "25:00", end: "06:00" }, cairo("02:00")), false);
});

test("mandatory notices are delivered even during quiet hours", () => {
  assert.equal(shouldDeliverExternally({ mandatory: true }, overnight, cairo("02:00")), true);
  assert.equal(shouldDeliverExternally({ mandatory: false }, overnight, cairo("02:00")), false);
  assert.equal(shouldDeliverExternally({ mandatory: false }, overnight, cairo("12:00")), true);
});
