import type { LegendConfig, Row, Theme } from "../types";
import { resolveBarColor, resolveTheme } from "./theme/resolve";

export interface LegendEntry {
  color: string;
  label: string;
}

/**
 * Derive legend entries from every bar in the document. Grouping by "label"
 * yields one entry per distinct task name (colored by the first bar using it);
 * grouping by "color" yields one entry per distinct resolved color (labelled by
 * the distinct names sharing it). Insertion order is preserved.
 */
export function buildLegend(
  rows: Row[],
  groupBy: LegendConfig["groupBy"],
  docTheme: Theme,
  themes: Theme[],
): LegendEntry[] {
  if (groupBy === "color") {
    const byColor = new Map<string, Set<string>>();
    for (const row of rows) {
      for (const bar of row.bars) {
        const effective = resolveTheme(
          bar.themeId ?? row.themeId,
          themes,
          docTheme,
        );
        const color = resolveBarColor(bar, effective);
        const label = bar.label.trim();
        const labels = byColor.get(color) ?? new Set<string>();
        if (label) labels.add(label);
        byColor.set(color, labels);
      }
    }
    return Array.from(byColor, ([color, labels]) => ({
      color,
      label: Array.from(labels).join(", ") || "Untitled",
    }));
  }

  const byLabel = new Map<string, string>();
  for (const row of rows) {
    for (const bar of row.bars) {
      const label = bar.label.trim();
      if (!label || byLabel.has(label)) continue;
      const effective = resolveTheme(
        bar.themeId ?? row.themeId,
        themes,
        docTheme,
      );
      byLabel.set(label, resolveBarColor(bar, effective));
    }
  }
  return Array.from(byLabel, ([label, color]) => ({ color, label }));
}

// Deterministic layout constants (no DOM measuring — exports render server-side).
const PAD_TOP = 16;
const PAD_LEFT = 12;
const SWATCH = 12;
const SWATCH_GAP = 6;
const ITEM_GAP = 20;
const ROW_HEIGHT = 22;
const CHAR_WIDTH_FACTOR = 0.6;

export interface LegendItemBox extends LegendEntry {
  x: number;
  /** y offset relative to the start of the legend's row region. */
  y: number;
}

export interface LegendLayout {
  items: LegendItemBox[];
  height: number;
}

/** Estimate label width from character count (server-side safe). */
function textWidth(label: string, fontSize: number): number {
  return label.length * fontSize * CHAR_WIDTH_FACTOR;
}

/** Wrap entries across `contentWidth` and return positioned boxes + block height. */
export function layoutLegend(
  entries: LegendEntry[],
  contentWidth: number,
  theme: Theme,
): LegendLayout {
  if (entries.length === 0) return { items: [], height: 0 };
  const fontSize = theme.typography.fontSize;
  const items: LegendItemBox[] = [];
  let x = PAD_LEFT;
  let row = 0;
  for (const entry of entries) {
    const w = SWATCH + SWATCH_GAP + textWidth(entry.label, fontSize);
    if (x > PAD_LEFT && x + w > contentWidth - PAD_LEFT) {
      x = PAD_LEFT;
      row += 1;
    }
    items.push({ ...entry, x, y: row * ROW_HEIGHT });
    x += w + ITEM_GAP;
  }
  const height = PAD_TOP + (row + 1) * ROW_HEIGHT;
  return { items, height };
}

/** Height of the legend block (0 when there are no entries). */
export function legendBlockHeight(
  entries: LegendEntry[],
  contentWidth: number,
  theme: Theme,
): number {
  return layoutLegend(entries, contentWidth, theme).height;
}

export { PAD_TOP as LEGEND_PAD_TOP, SWATCH as LEGEND_SWATCH };
