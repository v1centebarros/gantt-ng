import type { Row, Theme } from "../types";
import { packBars } from "./lanes";

export interface RowLayout {
  row: Row;
  index: number;
  /** y of the row band top (below the header). */
  top: number;
  height: number;
  /** Number of stacked lanes (>= 1). */
  laneCount: number;
  /** Lane index per bar id. */
  laneOf: Record<string, number>;
  /** Vertical padding above/below the lanes. */
  padding: number;
  /** Height of one lane's bar slot. */
  slotHeight: number;
  /** Vertical distance between successive lane tops (slotHeight + gap). */
  laneStride: number;
}

export interface LaneMetrics {
  /** Bar slot height (typically the theme's bar height). */
  barHeight: number;
  /** Gap between stacked bars. */
  laneGap: number;
  /** Padding above/below the lanes within the row band. */
  padding: number;
}

/** Rows sorted by their explicit order. */
export function sortedRows(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => a.order - b.order);
}

/**
 * Stacked row bands, each starting after the header. Rows grow vertically to fit
 * as many lanes as their bars need (overlapping bars get separate lanes). A
 * single-lane row is `2*padding + barHeight`; each extra lane adds `laneStride`.
 */
export function computeRowLayouts(
  rows: Row[],
  headerHeight: number,
  metrics: LaneMetrics,
): RowLayout[] {
  const { barHeight, laneGap, padding } = metrics;
  const laneStride = barHeight + laneGap;
  let y = headerHeight;
  return sortedRows(rows).map((row, index) => {
    const packing = packBars(row.bars);
    const laneCount = Math.max(1, packing.laneCount);
    const height = 2 * padding + barHeight + (laneCount - 1) * laneStride;
    const layout: RowLayout = {
      row,
      index,
      top: y,
      height,
      laneCount,
      laneOf: packing.laneOf,
      padding,
      slotHeight: barHeight,
      laneStride,
    };
    y += height;
    return layout;
  });
}

/** Top y of a given lane's bar slot within a row. */
export function laneTopY(layout: RowLayout, lane: number): number {
  return layout.top + layout.padding + lane * layout.laneStride;
}

export function chartHeight(
  layouts: RowLayout[],
  headerHeight: number,
): number {
  const last = layouts[layouts.length - 1];
  return last ? last.top + last.height : headerHeight;
}

/** Vertical center for a bar of `barHeight` inside a row band. */
export function barY(
  rowTop: number,
  rowHeight: number,
  barHeight: number,
): number {
  return rowTop + (rowHeight - barHeight) / 2;
}

export function zebraFill(index: number, theme: Theme): string {
  const zebra = theme.separators.zebra;
  if (!zebra) return theme.colors.background;
  return index % 2 === 0 ? zebra.even : zebra.odd;
}
