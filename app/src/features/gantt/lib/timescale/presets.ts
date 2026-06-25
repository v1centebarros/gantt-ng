import type { TimeUnit } from "../../types";

export type Granularity = "day" | "week" | "month" | "quarter" | "custom";

/** Each granularity preset pairs a secondary cadence with a sensible header tier. */
export const GRANULARITY_PRESETS: Record<
  Granularity,
  {
    secondary: TimeUnit;
    primary: TimeUnit;
    pixelsPerDay: number;
    label: string;
  }
> = {
  day: {
    secondary: { type: "day" },
    primary: { type: "month" },
    pixelsPerDay: 32,
    label: "Days",
  },
  week: {
    secondary: { type: "week" },
    primary: { type: "month" },
    pixelsPerDay: 12,
    label: "Weeks",
  },
  month: {
    secondary: { type: "month" },
    primary: { type: "year" },
    pixelsPerDay: 4,
    label: "Months",
  },
  quarter: {
    secondary: { type: "quarter" },
    primary: { type: "year" },
    pixelsPerDay: 2,
    label: "Quarters",
  },
  custom: {
    secondary: { type: "custom", spanDays: 10 },
    primary: { type: "month" },
    pixelsPerDay: 16,
    label: "Custom span",
  },
};
