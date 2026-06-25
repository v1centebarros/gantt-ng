import { describe, expect, it } from "vitest";
import type { Bar } from "../types";
import { packBars } from "./lanes";

function task(id: string, start: string, end: string): Bar {
  return { id, rowId: "r", kind: "task", label: id, start, end };
}

describe("packBars", () => {
  it("keeps non-overlapping bars on a single lane", () => {
    const { laneCount, laneOf } = packBars([
      task("a", "2026-01-01", "2026-01-05"),
      task("b", "2026-01-05", "2026-01-10"),
    ]);
    expect(laneCount).toBe(1);
    expect(laneOf.a).toBe(0);
    expect(laneOf.b).toBe(0);
  });

  it("stacks overlapping bars onto separate lanes", () => {
    const { laneCount, laneOf } = packBars([
      task("a", "2026-01-01", "2026-01-10"),
      task("b", "2026-01-05", "2026-01-15"),
    ]);
    expect(laneCount).toBe(2);
    expect(laneOf.a).toBe(0);
    expect(laneOf.b).toBe(1);
  });

  it("reuses a freed lane once an earlier bar ends", () => {
    const { laneCount, laneOf } = packBars([
      task("a", "2026-01-01", "2026-01-10"),
      task("b", "2026-01-05", "2026-01-15"),
      task("c", "2026-01-11", "2026-01-20"),
    ]);
    // c starts after a ends, so it reuses lane 0.
    expect(laneCount).toBe(2);
    expect(laneOf.c).toBe(0);
  });

  it("handles an empty row", () => {
    expect(packBars([])).toEqual({ laneOf: {}, laneCount: 0 });
  });

  it("treats milestones as one-day blocks", () => {
    const milestone: Bar = {
      id: "m",
      rowId: "r",
      kind: "milestone",
      label: "m",
      start: "2026-01-01",
      end: "2026-01-01",
    };
    const { laneCount } = packBars([
      milestone,
      task("a", "2026-01-01", "2026-01-05"),
    ]);
    // The milestone blocks Jan 1, so the task overlapping it needs a 2nd lane.
    expect(laneCount).toBe(2);
  });
});
