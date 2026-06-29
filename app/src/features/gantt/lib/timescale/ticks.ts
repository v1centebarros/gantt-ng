import type { TimeUnit } from "../../types";
import {
  addDays,
  addMonths,
  isoWeek,
  monthShort,
  parseDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  type WeekStart,
} from "./units";

/** One header cell, covering [start, end) clamped to the chart window. */
export interface Tick {
  /** Cell start (clamped to window start). */
  start: Date;
  /** Cell end, exclusive (clamped to window end). */
  end: Date;
  label: string;
  /** Absolute cell index from the window start (stable while virtualizing). */
  index: number;
}

/** Step to the boundary that begins the cell *after* the given one. */
function nextBoundary(date: Date, unit: TimeUnit): Date {
  switch (unit.type) {
    case "day":
      return addDays(date, 1);
    case "week":
      return addDays(date, 7);
    case "month":
      return addMonths(date, 1);
    case "quarter":
      return addMonths(date, 3);
    case "year":
      return addMonths(date, 12);
    case "custom":
      return addDays(date, Math.max(1, unit.spanDays));
    default: {
      const _exhaustive: never = unit;
      return _exhaustive;
    }
  }
}

/** First boundary at or before `date` for the unit. */
function alignToBoundary(
  date: Date,
  unit: TimeUnit,
  windowStart: Date,
  weekStartsOn: WeekStart,
): Date {
  switch (unit.type) {
    case "day":
      return date;
    case "week":
      return startOfWeek(date, weekStartsOn);
    case "month":
      return startOfMonth(date);
    case "quarter":
      return startOfQuarter(date);
    case "year":
      return startOfYear(date);
    case "custom":
      // Tile fixed spans from the window start.
      return windowStart;
    default: {
      const _exhaustive: never = unit;
      return _exhaustive;
    }
  }
}

export interface TickOptions {
  /** Month label rendering. Default "name". */
  monthLabelStyle?: "name" | "number";
  /** Only emit cells intersecting [clipStart, clipEnd) (viewport virtualization). */
  clipStart?: Date;
  clipEnd?: Date;
}

function labelFor(date: Date, unit: TimeUnit, opts: TickOptions): string {
  switch (unit.type) {
    case "day":
      return String(date.getUTCDate());
    case "week":
      return `W${isoWeek(date)}`;
    case "month":
      return opts.monthLabelStyle === "number"
        ? `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${date.getUTCFullYear()}`
        : `${monthShort(date)} ${date.getUTCFullYear()}`;
    case "quarter":
      return `Q${Math.floor(date.getUTCMonth() / 3) + 1} ${date.getUTCFullYear()}`;
    case "year":
      return String(date.getUTCFullYear());
    case "custom":
      return unit.label ?? `${unit.spanDays}d`;
    default: {
      const _exhaustive: never = unit;
      return _exhaustive;
    }
  }
}

/**
 * Generate header cells for one tier across [windowStart, windowEnd). Partial
 * first/last cells are clamped to the window so they line up with the chart.
 */
export function generateTicks(
  startISO: string,
  endISO: string,
  unit: TimeUnit,
  weekStartsOn: WeekStart,
  opts: TickOptions = {},
): Tick[] {
  const windowStart = parseDay(startISO);
  const windowEnd = parseDay(endISO);
  if (windowEnd <= windowStart) return [];

  const ticks: Tick[] = [];
  let boundary = alignToBoundary(windowStart, unit, windowStart, weekStartsOn);

  // Guard against pathological configs producing unbounded loops.
  let safety = 0;
  let index = 0;
  const maxCells = 100_000;
  const { clipStart, clipEnd } = opts;
  while (boundary < windowEnd && safety++ < maxCells) {
    const next = nextBoundary(boundary, unit);
    // Virtualization: skip cells that don't intersect the visible window, but
    // keep counting so `index` stays absolute and major grid lines don't shift.
    const visible =
      (!clipEnd || boundary < clipEnd) && (!clipStart || next > clipStart);
    if (visible) {
      const cellStart = boundary < windowStart ? windowStart : boundary;
      const cellEnd = next > windowEnd ? windowEnd : next;
      if (cellEnd > cellStart) {
        ticks.push({
          start: cellStart,
          end: cellEnd,
          label: labelFor(boundary, unit, opts),
          index,
        });
      }
    }
    boundary = next;
    index++;
  }
  return ticks;
}
