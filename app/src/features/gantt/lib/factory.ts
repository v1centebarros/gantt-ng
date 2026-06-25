import { DEFAULT_THEME_ID, GANTT_DEFAULTS } from "../constants";
import {
  type Bar,
  type BarKind,
  GANTT_SCHEMA_VERSION,
  type GanttDocument,
  type GanttFile,
  type Row,
} from "../types";
import { addDays, formatDay, parseDay } from "./timescale/units";

export function newId(): string {
  return crypto.randomUUID();
}

function nowISO(): string {
  return new Date().toISOString();
}

/** Create a blank document with a sensible 3-month daily window and one row. */
export function createDocument(title = "Untitled Gantt"): GanttDocument {
  const today = new Date();
  const start = parseDay(formatDay(today));
  const end = addDays(start, 90);
  // Seed a few empty rows to start from; more can be added via the toolbar.
  const rows = Array.from({ length: GANTT_DEFAULTS.initialRows }, (_, i) =>
    createRow(i),
  );
  return {
    id: newId(),
    meta: {
      title,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    timescale: {
      start: formatDay(start),
      end: formatDay(end),
      primaryUnit: { type: "month" },
      secondaryUnit: { type: "day" },
      pixelsPerDay: GANTT_DEFAULTS.pixelsPerDay,
      weekStartsOn: 1,
    },
    rows,
    themeId: DEFAULT_THEME_ID,
  };
}

/** Wrap a document in a fresh file envelope (no embedded themes by default). */
export function createFile(document: GanttDocument): GanttFile {
  return {
    kind: "gantt-document",
    schemaVersion: GANTT_SCHEMA_VERSION,
    document,
    themes: [],
  };
}

export function createRow(
  order: number,
  label = `Task group ${order + 1}`,
): Row {
  return { id: newId(), label, order, bars: [] };
}

export function createBar(
  rowId: string,
  start: string,
  end: string,
  opts: Partial<Pick<Bar, "label" | "kind" | "color" | "progress">> = {},
): Bar {
  const kind: BarKind = opts.kind ?? "task";
  return {
    id: newId(),
    rowId,
    kind,
    label: opts.label ?? "New task",
    start,
    end: kind === "milestone" ? start : end,
    color: opts.color,
    progress: opts.progress,
  };
}
