/**
 * Theme model. All values are concrete (hex / rgba / css color strings) — never
 * `var(--…)` — because a theme is serialized into a standalone exported SVG that
 * must carry its own styling with no external stylesheet.
 */

export type ID = string;

export interface ThemeColors {
  /** Chart canvas background. */
  background: string;
  /** Left label-gutter background. */
  surface: string;
  text: string;
  textMuted: string;
  /** Named palette; bars reference an entry via `Bar.color = "palette.<key>"`. */
  palette: Record<string, string>;
  todayMarker: string;
  accent: string;
}

export interface ThemeTypography {
  /** Web-safe family, or the family of an embedded font (see embeddedFont). */
  fontFamily: string;
  /** Base font size in px. */
  fontSize: number;
  headerFontSize: number;
  barLabelFontSize: number;
  fontWeight: number;
  /** Optional base64 woff2 embedded into exports for non-web-safe fonts. */
  embeddedFont?: { family: string; weight: number; woff2Base64: string };
}

export interface GridStyle {
  show: boolean;
  color: string;
  width: number;
  /** Draw an emphasized line every N secondary cells. */
  majorEvery: number;
  majorColor?: string;
  /** SVG stroke-dasharray. */
  dash?: number[];
}

export interface SeparatorStyle {
  rowColor: string;
  rowWidth: number;
  zebra?: { even: string; odd: string };
  gutterColor: string;
  gutterWidth: number;
}

export interface BarStyle {
  height: number;
  cornerRadius: number;
  borderColor: string;
  borderWidth: number;
  progressOpacity: number;
  milestoneSize: number;
  labelPlacement: "inside" | "right" | "left";
}

export interface HeaderStyle {
  background: string;
  text: string;
  /** Total header height (two tiers combined). */
  height: number;
  borderColor: string;
}

export interface Theme {
  id: ID;
  name: string;
  /** Shipped themes are not user-deletable. */
  builtin?: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  grid: GridStyle;
  separators: SeparatorStyle;
  bar: BarStyle;
  header: HeaderStyle;
}
