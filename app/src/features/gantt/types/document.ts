import type { ID, Theme } from "./theme";

/** Current content schema version. Bump + add a migration when the shape changes. */
export const GANTT_SCHEMA_VERSION = 1 as const;

/** "2026-06-25" for dates, or a full ISO instant for timestamps. */
export type ISODate = string;

/** How the timeline header is subdivided and how the grid cadence is set. */
export type TimeUnit =
  | { type: "day" }
  | { type: "week" }
  | { type: "month" }
  | { type: "quarter" }
  | { type: "year" }
  /** Fixed-length spans (e.g. 10-day sprints) tiled from the window start. */
  | { type: "custom"; spanDays: number; label?: string };

export type TimeUnitType = TimeUnit["type"];

export interface TimescaleConfig {
  /** Inclusive start of the visible window. */
  start: ISODate;
  /** Exclusive end of the visible window. */
  end: ISODate;
  /** Coarse band shown in the header's top tier. */
  primaryUnit: TimeUnit;
  /** Fine band shown in the header's bottom tier; also drives grid cadence. */
  secondaryUnit: TimeUnit;
  /** Pixels per day. Drives total chart width and zoom level. */
  pixelsPerDay: number;
  /** 0 = Sunday … 6 = Saturday. */
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Show the fine (secondary) tier of date labels. Default true. */
  showSecondaryLabels?: boolean;
  /** Month rendering: full name ("Jun 2026") or numeric ("06/2026"). Default "name". */
  monthLabelStyle?: "name" | "number";
}

export type BarKind = "task" | "milestone" | "summary";

export interface Dependency {
  predecessorId: ID;
  /** finish-to-start (default), start-to-start, finish-to-finish, start-to-finish */
  type: "FS" | "SS" | "FF" | "SF";
  lagDays?: number;
}

export interface Bar {
  id: ID;
  /** Denormalized backref to the owning row, for hit-testing and flat indexes. */
  rowId: ID;
  kind: BarKind;
  label: string;
  start: ISODate;
  /** For milestones, `end === start` (rendered as a diamond). */
  end: ISODate;
  /** 0..1 completion, draws an inner fill. */
  progress?: number;
  /** Palette token ("palette.blue") or an explicit color override. */
  color?: string;
  /** Draw the label on the chart. Default true. */
  showLabel?: boolean;
  themeId?: ID;
  dependencies?: Dependency[];
  /** Disables drag/resize when true. */
  locked?: boolean;
  notes?: string;
}

export interface Row {
  id: ID;
  label: string;
  /** Explicit display order; survives serialization independent of array index. */
  order: number;
  collapsed?: boolean;
  /** For grouping/indentation (summary rows). null/undefined = top level. */
  parentId?: ID | null;
  bars: Bar[];
  themeId?: ID;
  /** px override; falls back to theme/document default. */
  height?: number;
}

export interface DocumentMeta {
  title: string;
  description?: string;
  /** Full ISO instants. */
  createdAt: ISODate;
  updatedAt: ISODate;
  author?: string;
  /** App version that last wrote the file, for diagnostics. */
  appVersion?: string;
}

export type StrokeStyle = "solid" | "dashed" | "dotted";

/** A user-defined vertical line at a chosen date (like the "today" marker). */
export interface DateMarker {
  id: ID;
  date: ISODate;
  label?: string;
  /** Palette token ("palette.red") or explicit color; defaults to theme accent. */
  color?: string;
  /** Line style; defaults to "solid". */
  strokeStyle?: StrokeStyle;
  /** Line width in px; defaults to 2. */
  strokeWidth?: number;
  /** Draw the label on the chart. Default true. */
  showLabel?: boolean;
}

export interface LegendConfig {
  show: boolean;
  /** Group legend entries by task name or by resolved color. */
  groupBy: "label" | "color";
}

/** Document-level display toggles for chart overlays. */
export interface DisplaySettings {
  /** Show the vertical "today" line. Default true. */
  showTodayMarker: boolean;
  legend: LegendConfig;
}

export interface GanttDocument {
  id: ID;
  meta: DocumentMeta;
  timescale: TimescaleConfig;
  rows: Row[];
  /** Default theme for the document; rows/bars may override. */
  themeId: ID;
  /** Display overlays (today marker, legend). Optional; see resolveDisplay. */
  display?: DisplaySettings;
  /** Custom vertical date markers. */
  markers?: DateMarker[];
}

/** Fill display settings with defaults so older documents render sensibly. */
export function resolveDisplay(doc: GanttDocument): DisplaySettings {
  return {
    showTodayMarker: doc.display?.showTodayMarker ?? true,
    legend: {
      show: doc.display?.legend?.show ?? false,
      groupBy: doc.display?.legend?.groupBy ?? "label",
    },
  };
}

/**
 * The `.gantt` file envelope. Self-contained: embeds any non-builtin themes the
 * document references so the file is portable between users.
 */
export interface GanttFile {
  kind: "gantt-document";
  schemaVersion: number;
  document: GanttDocument;
  themes: Theme[];
}
