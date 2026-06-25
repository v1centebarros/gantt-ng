import type { Bar } from "../types";
import { addDays, diffDays, formatDay, parseDay } from "./timescale/units";

/** Day-index interval [start, end) occupied by a bar, relative to an origin. */
function occupancy(bar: Bar, origin: Date): [number, number] {
  const s = diffDays(origin, parseDay(bar.start));
  // Milestones are points; block a single day so a task can't start on top.
  const e =
    bar.kind === "milestone" ? s + 1 : diffDays(origin, parseDay(bar.end));
  return [s, Math.max(e, s + 1)];
}

/**
 * Find the nearest free slot of `durationDays` on a row, scanning from the
 * window start. Returns the first gap large enough; if none exists before the
 * last bar, the slot is placed immediately after it.
 */
export function findFreeSlot(
  bars: Bar[],
  windowStartISO: string,
  durationDays: number,
): { start: string; end: string } {
  const origin = parseDay(windowStartISO);
  const intervals = bars
    .map((bar) => occupancy(bar, origin))
    .sort((a, b) => a[0] - b[0]);

  let candidate = 0;
  for (const [s, e] of intervals) {
    // Fits in the gap before this bar.
    if (candidate + durationDays <= s) break;
    // Otherwise jump past it (only if it actually pushes us forward).
    if (e > candidate) candidate = e;
  }

  return {
    start: formatDay(addDays(origin, candidate)),
    end: formatDay(addDays(origin, candidate + durationDays)),
  };
}
