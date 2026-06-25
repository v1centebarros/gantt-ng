import type { Row, Theme } from "../types";

export interface RowLayout {
  row: Row;
  index: number;
  /** y of the row band top (below the header). */
  top: number;
  height: number;
}

/** Rows sorted by their explicit order. */
export function sortedRows(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => a.order - b.order);
}

/** Stacked row bands, each starting after the header. */
export function computeRowLayouts(
  rows: Row[],
  headerHeight: number,
  defaultRowHeight: number,
): RowLayout[] {
  let y = headerHeight;
  return sortedRows(rows).map((row, index) => {
    const height = row.height ?? defaultRowHeight;
    const layout: RowLayout = { row, index, top: y, height };
    y += height;
    return layout;
  });
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
