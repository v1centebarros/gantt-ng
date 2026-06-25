import { describe, expect, it } from "vitest";
import type { TimescaleConfig } from "../../types";
import { createScale } from "./scale";
import { generateTicks } from "./ticks";
import { diffDays, isoWeek, parseDay, startOfWeek } from "./units";

const base: TimescaleConfig = {
  start: "2026-01-01",
  end: "2026-04-01",
  primaryUnit: { type: "month" },
  secondaryUnit: { type: "day" },
  pixelsPerDay: 10,
  weekStartsOn: 1,
};

describe("units", () => {
  it("parses date-only ISO at UTC midnight", () => {
    const d = parseDay("2026-06-25");
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(5);
    expect(d.getUTCDate()).toBe(25);
    expect(d.getUTCHours()).toBe(0);
  });

  it("computes whole-day differences without DST drift", () => {
    // Spans the EU/US spring DST transitions — must stay exact in UTC.
    expect(diffDays(parseDay("2026-03-01"), parseDay("2026-04-01"))).toBe(31);
  });

  it("aligns week start to the configured first day", () => {
    // 2026-06-25 is a Thursday; week starting Monday -> 2026-06-22.
    expect(startOfWeek(parseDay("2026-06-25"), 1).getUTCDate()).toBe(22);
  });

  it("computes ISO week numbers", () => {
    expect(isoWeek(parseDay("2026-01-01"))).toBe(1);
  });
});

describe("createScale", () => {
  const scale = createScale(base);

  it("maps the window start to x=0", () => {
    expect(scale.dateToX(parseDay("2026-01-01"))).toBe(0);
  });

  it("maps dates linearly by day", () => {
    expect(scale.dateToX(parseDay("2026-01-11"))).toBe(100);
  });

  it("computes total width across the window", () => {
    expect(scale.totalWidth).toBe(
      diffDays(parseDay(base.start), parseDay(base.end)) * 10,
    );
  });

  it("round-trips date <-> x", () => {
    const d = parseDay("2026-02-15");
    expect(scale.xToDate(scale.dateToX(d)).getTime()).toBe(d.getTime());
  });

  it("snaps to day boundaries by default", () => {
    const snapped = scale.snap(new Date(Date.UTC(2026, 1, 15, 18, 30)));
    expect(snapped.getUTCHours()).toBe(0);
    expect(snapped.getUTCDate()).toBe(15);
  });

  it("snaps to month start when given a month unit", () => {
    const snapped = scale.snap(parseDay("2026-02-15"), { type: "month" });
    expect(snapped.getUTCDate()).toBe(1);
    expect(snapped.getUTCMonth()).toBe(1);
  });
});

describe("generateTicks", () => {
  it("produces one cell per day", () => {
    const ticks = generateTicks("2026-01-01", "2026-01-08", { type: "day" }, 1);
    expect(ticks).toHaveLength(7);
    expect(ticks[0].label).toBe("1");
  });

  it("produces month cells with clamped partials", () => {
    const ticks = generateTicks(
      "2026-01-15",
      "2026-03-10",
      { type: "month" },
      1,
    );
    expect(ticks).toHaveLength(3);
    // First cell clamps to the window start, not the month start.
    expect(ticks[0].start.getTime()).toBe(parseDay("2026-01-15").getTime());
    expect(ticks[0].label).toBe("Jan 2026");
    // Last cell clamps to the window end.
    expect(ticks[2].end.getTime()).toBe(parseDay("2026-03-10").getTime());
  });

  it("tiles custom fixed spans from the window start", () => {
    const ticks = generateTicks(
      "2026-01-01",
      "2026-01-21",
      { type: "custom", spanDays: 10 },
      1,
    );
    expect(ticks).toHaveLength(2);
    expect(diffDays(ticks[0].start, ticks[0].end)).toBe(10);
  });

  it("labels quarters", () => {
    const ticks = generateTicks(
      "2026-01-01",
      "2026-12-31",
      { type: "quarter" },
      1,
    );
    expect(ticks[0].label).toBe("Q1 2026");
    expect(ticks[3].label).toBe("Q4 2026");
  });

  it("returns nothing for an inverted window", () => {
    expect(
      generateTicks("2026-04-01", "2026-01-01", { type: "day" }, 1),
    ).toEqual([]);
  });
});
