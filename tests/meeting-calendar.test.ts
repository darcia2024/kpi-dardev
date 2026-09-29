import assert from "node:assert/strict";
import test from "node:test";
import { cairoDateKey, cairoMonthKey, calendarCells, shiftMonth } from "@/lib/meeting-calendar";

test("meeting calendar groups timestamps by Cairo date across midnight and year end", () => {
  assert.equal(cairoDateKey("2026-09-24T22:30:00.000Z"), "2026-09-25");
  assert.equal(cairoMonthKey("2026-12-31T22:30:00.000Z"), "2027-01");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2027-01", -1), "2026-12");
});

test("calendar cells start Monday and include leap day", () => {
  const cells = calendarCells("2028-02");
  assert.equal(cells[1]?.key, "2028-02-01");
  assert.equal(cells.filter((cell) => cell !== null).length, 29);
  assert.equal(cells.length % 7, 0);
});
