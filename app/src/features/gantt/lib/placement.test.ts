import { describe, expect, it } from "vitest";
import type { Bar } from "../types";
import { findFreeSlot } from "./placement";

function task(start: string, end: string): Bar {
  return { id: start, rowId: "r", kind: "task", label: "t", start, end };
}

const WIN = "2026-01-01";

describe("findFreeSlot", () => {
  it("places at the window start on an empty row", () => {
    expect(findFreeSlot([], WIN, 7)).toEqual({
      start: "2026-01-01",
      end: "2026-01-08",
    });
  });

  it("uses a gap before the first bar when it fits", () => {
    const bars = [task("2026-01-20", "2026-01-25")];
    expect(findFreeSlot(bars, WIN, 7)).toEqual({
      start: "2026-01-01",
      end: "2026-01-08",
    });
  });

  it("jumps past an overlapping bar to the next free slot", () => {
    const bars = [task("2026-01-01", "2026-01-05")];
    expect(findFreeSlot(bars, WIN, 7)).toEqual({
      start: "2026-01-05",
      end: "2026-01-12",
    });
  });

  it("finds a gap between two bars", () => {
    const bars = [
      task("2026-01-01", "2026-01-05"),
      task("2026-01-20", "2026-01-25"),
    ];
    // Gap from Jan 5 to Jan 20 (15 days) fits a 7-day task.
    expect(findFreeSlot(bars, WIN, 7)).toEqual({
      start: "2026-01-05",
      end: "2026-01-12",
    });
  });

  it("appends after the last bar when no earlier gap fits", () => {
    const bars = [
      task("2026-01-01", "2026-01-05"),
      task("2026-01-08", "2026-01-30"),
    ];
    // Jan 5-8 gap is only 3 days; must go after Jan 30.
    expect(findFreeSlot(bars, WIN, 7)).toEqual({
      start: "2026-01-30",
      end: "2026-02-06",
    });
  });

  it("does not start on top of a milestone", () => {
    const milestone: Bar = {
      id: "m",
      rowId: "r",
      kind: "milestone",
      label: "m",
      start: "2026-01-01",
      end: "2026-01-01",
    };
    const slot = findFreeSlot([milestone], WIN, 7);
    expect(slot.start).toBe("2026-01-02");
  });
});
