import type { TimescaleConfig, TimeUnit } from "../../types";
import {
  addDays,
  diffDays,
  parseDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  type WeekStart,
} from "./units";

/**
 * Maps dates to x-pixel coordinates and back. MVP uses linear px-per-day
 * spacing (calendar-irregular months therefore vary slightly in width). The
 * interface hides this so the mapping can become piecewise-linear later without
 * touching renderers.
 */
export interface Scale {
  readonly start: Date;
  readonly end: Date;
  readonly pixelsPerDay: number;
  readonly totalWidth: number;
  /** x offset (px) for a date, measured from the window start. */
  dateToX(date: Date): number;
  /** Inverse of dateToX; returns a (possibly fractional-day) Date. */
  xToDate(x: number): Date;
  /** Round a date to the start of the given unit (defaults to whole days). */
  snap(date: Date, unit?: TimeUnit): Date;
}

function snapToUnit(date: Date, unit: TimeUnit, weekStartsOn: WeekStart): Date {
  switch (unit.type) {
    case "day":
      return startOfDay(date);
    case "week":
      return startOfWeek(date, weekStartsOn);
    case "month":
      return startOfMonth(date);
    case "quarter":
      return startOfQuarter(date);
    case "year":
      return startOfYear(date);
    case "custom":
      return startOfDay(date);
    default: {
      const _exhaustive: never = unit;
      return _exhaustive;
    }
  }
}

function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function createScale(config: TimescaleConfig): Scale {
  const start = parseDay(config.start);
  const end = parseDay(config.end);
  const pixelsPerDay = config.pixelsPerDay;
  const weekStartsOn = config.weekStartsOn;
  const totalWidth = Math.max(0, diffDays(start, end) * pixelsPerDay);

  return {
    start,
    end,
    pixelsPerDay,
    totalWidth,
    dateToX(date) {
      return diffDays(start, date) * pixelsPerDay;
    },
    xToDate(x) {
      return addDays(start, x / pixelsPerDay);
    },
    snap(date, unit) {
      if (!unit || unit.type === "day" || unit.type === "custom") {
        return startOfDay(date);
      }
      return snapToUnit(date, unit, weekStartsOn);
    },
  };
}
