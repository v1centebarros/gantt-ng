import { DEFAULT_THEME_ID } from "../../constants";
import type { Theme } from "../../types";

/** Shared palette used by both builtin themes. */
const PALETTE: Record<string, string> = {
  blue: "#3b82f6",
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#a855f7",
  teal: "#14b8a6",
  slate: "#64748b",
};

export const LIGHT_THEME: Theme = {
  id: DEFAULT_THEME_ID,
  name: "Light",
  builtin: true,
  colors: {
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textMuted: "#64748b",
    palette: PALETTE,
    todayMarker: "#ef4444",
    accent: "#f97316",
  },
  typography: {
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    fontSize: 13,
    headerFontSize: 12,
    barLabelFontSize: 12,
    fontWeight: 400,
  },
  grid: {
    show: true,
    color: "#e2e8f0",
    width: 1,
    majorEvery: 7,
    majorColor: "#cbd5e1",
  },
  separators: {
    rowColor: "#e2e8f0",
    rowWidth: 1,
    zebra: { even: "#ffffff", odd: "#f8fafc" },
    gutterColor: "#cbd5e1",
    gutterWidth: 1,
  },
  bar: {
    height: 22,
    cornerRadius: 5,
    borderColor: "rgba(0,0,0,0.12)",
    borderWidth: 1,
    progressOpacity: 0.45,
    milestoneSize: 16,
    labelPlacement: "inside",
  },
  header: {
    background: "#f8fafc",
    text: "#334155",
    height: 52,
    borderColor: "#cbd5e1",
  },
};

export const DARK_THEME: Theme = {
  id: "builtin-dark",
  name: "Dark",
  builtin: true,
  colors: {
    background: "#0f172a",
    surface: "#1e293b",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    palette: PALETTE,
    todayMarker: "#f87171",
    accent: "#fb923c",
  },
  typography: {
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    fontSize: 13,
    headerFontSize: 12,
    barLabelFontSize: 12,
    fontWeight: 400,
  },
  grid: {
    show: true,
    color: "#334155",
    width: 1,
    majorEvery: 7,
    majorColor: "#475569",
  },
  separators: {
    rowColor: "#334155",
    rowWidth: 1,
    zebra: { even: "#0f172a", odd: "#162033" },
    gutterColor: "#475569",
    gutterWidth: 1,
  },
  bar: {
    height: 22,
    cornerRadius: 5,
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    progressOpacity: 0.5,
    milestoneSize: 16,
    labelPlacement: "inside",
  },
  header: {
    background: "#1e293b",
    text: "#cbd5e1",
    height: 52,
    borderColor: "#475569",
  },
};

export const BUILTIN_THEMES: Theme[] = [LIGHT_THEME, DARK_THEME];
