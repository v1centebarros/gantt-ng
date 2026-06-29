import { describe, expect, it } from "vitest";
import { clampBarDates } from "./bounds";
import { diffDays, parseDay } from "./timescale/units";

const win = { start: "2026-01-01", end: "2026-12-31" };
const span = (r: { start: string; end: string }) =>
  diffDays(parseDay(r.start), parseDay(r.end));

describe("clampBarDates", () => {
  it("move: clamps past the end, preserving duration", () => {
    const r = clampBarDates(
      { start: "2026-12-20", end: "2027-02-01" },
      win,
      "move",
      false,
    );
    expect(r.end).toBe(win.end);
    expect(span(r)).toBe(
      diffDays(parseDay("2026-12-20"), parseDay("2027-02-01")),
    );
  });

  it("move: clamps past the start, preserving duration", () => {
    const r = clampBarDates(
      { start: "2025-12-01", end: "2025-12-11" },
      win,
      "move",
      false,
    );
    expect(r.start).toBe(win.start);
    expect(span(r)).toBe(10);
  });

  it("resize-start: stops at the window start, never inverts", () => {
    const r = clampBarDates(
      { start: "2025-10-01", end: "2026-03-01" },
      win,
      "resize-start",
      false,
    );
    expect(r.start).toBe(win.start);
    expect(r.end).toBe("2026-03-01");
  });

  it("resize-end: stops at the window end", () => {
    const r = clampBarDates(
      { start: "2026-06-01", end: "2027-06-01" },
      win,
      "resize-end",
      false,
    );
    expect(r.end).toBe(win.end);
    expect(span(r)).toBeGreaterThan(0);
  });

  it("edit: pulls an out-of-range start inside and keeps end > start", () => {
    const r = clampBarDates(
      { start: "2025-01-01", end: "2026-02-01" },
      win,
      "edit",
      false,
    );
    expect(r.start).toBe(win.start);
    expect(r.end).toBe("2026-02-01");
    expect(span(r)).toBeGreaterThanOrEqual(1);
  });

  it("edit: an end at/before start is bumped to a 1-day span", () => {
    const r = clampBarDates(
      { start: "2026-06-01", end: "2026-05-01" },
      win,
      "edit",
      false,
    );
    expect(span(r)).toBe(1);
  });

  it("edit: a bar entirely past the end is pulled to the last day", () => {
    const r = clampBarDates(
      { start: "2027-01-01", end: "2027-03-01" },
      win,
      "edit",
      false,
    );
    expect(r.end).toBe(win.end);
    expect(span(r)).toBe(1);
  });

  it("milestone: stays a point and clamps into the window", () => {
    const r = clampBarDates(
      { start: "2027-05-05", end: "2027-05-05" },
      win,
      "move",
      true,
    );
    expect(r.start).toBe(r.end);
    expect(r.start).toBe(win.end);
  });
});
