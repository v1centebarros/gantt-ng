/**
 * UTC-only date arithmetic. Using UTC throughout avoids DST off-by-one bugs:
 * every "day" is exactly 86_400_000 ms and boundaries never shift.
 */

export const MS_PER_DAY = 86_400_000;

export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Parse "YYYY-MM-DD" (or a full ISO instant) to a Date at UTC midnight of that day. */
export function parseDay(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (match) {
    const [, y, m, d] = match;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  }
  const parsed = new Date(iso);
  return new Date(
    Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
    ),
  );
}

/** Format a Date as "YYYY-MM-DD" using its UTC fields. */
export function formatDay(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, "0");
  const m = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const d = date.getUTCDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole-day difference (b - a). Fractional when inputs aren't day-aligned. */
export function diffDays(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / MS_PER_DAY;
}

export function addDays(date: Date, n: number): Date {
  return new Date(date.getTime() + n * MS_PER_DAY);
}

export function addMonths(date: Date, n: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + n, date.getUTCDate()),
  );
}

export function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function startOfWeek(date: Date, weekStartsOn: WeekStart): Date {
  const day = startOfDay(date);
  const diff = (day.getUTCDay() - weekStartsOn + 7) % 7;
  return addDays(day, -diff);
}

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function startOfQuarter(date: Date): Date {
  const q = Math.floor(date.getUTCMonth() / 3) * 3;
  return new Date(Date.UTC(date.getUTCFullYear(), q, 1));
}

export function startOfYear(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function monthShort(date: Date): string {
  return MONTHS_SHORT[date.getUTCMonth()];
}

/** ISO-8601 week number (1..53). */
export function isoWeek(date: Date): number {
  const d = startOfDay(date);
  // Thursday of the current ISO week determines the year.
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const firstDay = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
  return (
    1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY))
  );
}
