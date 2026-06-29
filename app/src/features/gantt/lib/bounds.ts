import {
  addDays,
  clampDay,
  diffDays,
  formatDay,
  parseDay,
} from "./timescale/units";

export type ClampMode = "move" | "resize-start" | "resize-end" | "edit";

export interface DateRange {
  start: string;
  end: string;
}

/**
 * Constrain a bar's [start, end] (ISO days) to the chart window [winStart,
 * winEnd], honoring the gesture that produced it:
 *  - "move":         shift the bar inside, PRESERVING its duration.
 *  - "resize-start": clamp the start edge to [winStart, end - 1].
 *  - "resize-end":   clamp the end edge to [start + 1, winEnd].
 *  - "edit":         clamp both edges into the window, then enforce end > start.
 * Milestones (end === start) stay a point: the start is clamped and end follows.
 */
export function clampBarDates(
  range: DateRange,
  win: DateRange,
  mode: ClampMode,
  isMilestone: boolean,
): DateRange {
  const winStart = parseDay(win.start);
  const winEnd = parseDay(win.end);
  let start = parseDay(range.start);
  let end = parseDay(range.end);

  if (isMilestone) {
    const s = clampDay(start, winStart, winEnd);
    return { start: formatDay(s), end: formatDay(s) };
  }

  switch (mode) {
    case "move": {
      const duration = Math.max(1, diffDays(start, end));
      // Latest start that still fits the whole bar inside the window.
      const maxStart = addDays(winEnd, -duration);
      start = clampDay(start, winStart, maxStart);
      end = addDays(start, duration);
      break;
    }
    case "resize-start": {
      start = clampDay(start, winStart, addDays(end, -1));
      break;
    }
    case "resize-end": {
      end = clampDay(end, addDays(start, 1), winEnd);
      break;
    }
    default: {
      // "edit": clamp each edge independently, then keep at least a 1-day span.
      start = clampDay(start, winStart, winEnd);
      end = clampDay(end, winStart, winEnd);
      if (diffDays(start, end) < 1) {
        // Prefer pushing the end out; if there's no room, pull the start in.
        if (diffDays(start, winEnd) >= 1) end = addDays(start, 1);
        else start = addDays(end, -1);
      }
      break;
    }
  }

  return { start: formatDay(start), end: formatDay(end) };
}
