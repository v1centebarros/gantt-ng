/** Layout and timescale defaults shared across the feature. */
export const GANTT_DEFAULTS = {
  /** Number of empty rows a new document starts with. */
  initialRows: 5,
  /** Default duration (days) for a newly created task. */
  newTaskDays: 7,
  /** Vertical padding (px) above/below the lanes within a row band. */
  rowPadding: 9,
  /** Vertical gap (px) between stacked task bars in a row. */
  laneGap: 9,
  /** Left label-gutter width in px. */
  gutterWidth: 220,
  /** Default zoom: px per day. */
  pixelsPerDay: 32,
  /** Zoom bounds. */
  minPixelsPerDay: 4,
  maxPixelsPerDay: 160,
  /** Hi-DPI multiplier for raster (PNG/JPEG) exports. */
  rasterScale: 2,
} as const;

/** ID of the default builtin theme. */
export const DEFAULT_THEME_ID = "builtin-light";
