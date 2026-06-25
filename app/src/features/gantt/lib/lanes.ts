import type { Bar } from "../types";
import { MS_PER_DAY, parseDay } from "./timescale/units";

export interface RowPacking {
  /** Lane index (0-based) assigned to each bar. */
  laneOf: Record<string, number>;
  /** Number of lanes needed for the row (>= 1 when there are bars). */
  laneCount: number;
}

/** Time interval [start, end) a bar occupies, in ms. Milestones block one day. */
function interval(bar: Bar): [number, number] {
  const s = parseDay(bar.start).getTime();
  const e =
    bar.kind === "milestone" ? s + MS_PER_DAY : parseDay(bar.end).getTime();
  return [s, Math.max(e, s + MS_PER_DAY)];
}

/**
 * Greedy lane packing: bars that overlap in time are placed on separate lanes so
 * they never visually overlap. Sorted by start, each bar takes the first lane
 * whose previous bar has already ended.
 */
export function packBars(bars: Bar[]): RowPacking {
  const sorted = [...bars].sort((a, b) => interval(a)[0] - interval(b)[0]);
  const laneEnds: number[] = [];
  const laneOf: Record<string, number> = {};

  for (const bar of sorted) {
    const [start, end] = interval(bar);
    let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    laneOf[bar.id] = lane;
  }

  return { laneOf, laneCount: laneEnds.length };
}
