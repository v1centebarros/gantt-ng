import type { Bar, Row } from "../types";

/** Provisional state for the bar currently being dragged (not yet persisted). */
export interface BarDraft {
  id: string;
  start: string;
  end: string;
  /** Target row while dragging vertically; falls back to the bar's own row. */
  rowId?: string;
}

/**
 * Apply a live drag draft to rows so layout (lane packing, row heights) and
 * rendering reflect the in-progress gesture before it is committed. Moves the
 * dragged bar to its target row with provisional dates.
 */
export function applyDraftToRows(rows: Row[], draft: BarDraft | null): Row[] {
  if (!draft) return rows;

  let dragged: Bar | undefined;
  for (const row of rows) {
    const bar = row.bars.find((b) => b.id === draft.id);
    if (bar) {
      dragged = bar;
      break;
    }
  }
  if (!dragged) return rows;

  const targetRowId = draft.rowId ?? dragged.rowId;
  const updated: Bar = {
    ...dragged,
    start: draft.start,
    end: draft.end,
    rowId: targetRowId,
  };

  return rows.map((row) => {
    const without = row.bars.filter((b) => b.id !== draft.id);
    if (row.id === targetRowId) return { ...row, bars: [...without, updated] };
    if (without.length !== row.bars.length) return { ...row, bars: without };
    return row;
  });
}
