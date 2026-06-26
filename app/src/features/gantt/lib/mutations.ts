import {
  type Bar,
  type DateMarker,
  type DisplaySettings,
  type GanttDocument,
  type Row,
  resolveDisplay,
  type TimescaleConfig,
} from "../types";

/** All helpers are pure: they return a new document, never mutate the input. */

function mapRows(doc: GanttDocument, fn: (row: Row) => Row): GanttDocument {
  return { ...doc, rows: doc.rows.map(fn) };
}

export function updateBar(
  doc: GanttDocument,
  barId: string,
  patch: Partial<Bar>,
): GanttDocument {
  return mapRows(doc, (row) => ({
    ...row,
    bars: row.bars.map((b) => (b.id === barId ? { ...b, ...patch } : b)),
  }));
}

export function updateBarDates(
  doc: GanttDocument,
  barId: string,
  start: string,
  end: string,
): GanttDocument {
  return updateBar(doc, barId, { start, end });
}

export function addBar(
  doc: GanttDocument,
  rowId: string,
  bar: Bar,
): GanttDocument {
  return mapRows(doc, (row) =>
    row.id === rowId ? { ...row, bars: [...row.bars, bar] } : row,
  );
}

export function deleteBar(doc: GanttDocument, barId: string): GanttDocument {
  return mapRows(doc, (row) => ({
    ...row,
    bars: row.bars.filter((b) => b.id !== barId),
  }));
}

/** Move a bar to another row, updating its denormalized rowId backref. */
export function moveBarToRow(
  doc: GanttDocument,
  barId: string,
  toRowId: string,
): GanttDocument {
  let moved: Bar | undefined;
  const stripped = doc.rows.map((row) => {
    const bar = row.bars.find((b) => b.id === barId);
    if (!bar) return row;
    moved = bar;
    return { ...row, bars: row.bars.filter((b) => b.id !== barId) };
  });
  if (!moved || moved.rowId === toRowId) return doc;
  const relocated: Bar = { ...moved, rowId: toRowId };
  return {
    ...doc,
    rows: stripped.map((row) =>
      row.id === toRowId ? { ...row, bars: [...row.bars, relocated] } : row,
    ),
  };
}

export function addRow(doc: GanttDocument, row: Row): GanttDocument {
  return { ...doc, rows: [...doc.rows, row] };
}

export function updateRow(
  doc: GanttDocument,
  rowId: string,
  patch: Partial<Row>,
): GanttDocument {
  return mapRows(doc, (row) => (row.id === rowId ? { ...row, ...patch } : row));
}

export function deleteRow(doc: GanttDocument, rowId: string): GanttDocument {
  return { ...doc, rows: doc.rows.filter((r) => r.id !== rowId) };
}

/** Rewrite row order to match the given id sequence (from dnd-kit reorder). */
export function reorderRows(
  doc: GanttDocument,
  orderedIds: string[],
): GanttDocument {
  const orderById = new Map(orderedIds.map((id, i) => [id, i]));
  return {
    ...doc,
    rows: doc.rows.map((row) => ({
      ...row,
      order: orderById.get(row.id) ?? row.order,
    })),
  };
}

export function updateTimescale(
  doc: GanttDocument,
  patch: Partial<TimescaleConfig>,
): GanttDocument {
  return { ...doc, timescale: { ...doc.timescale, ...patch } };
}

export function setDocumentTheme(
  doc: GanttDocument,
  themeId: string,
): GanttDocument {
  return { ...doc, themeId };
}

export function renameDocument(
  doc: GanttDocument,
  title: string,
): GanttDocument {
  return { ...doc, meta: { ...doc.meta, title } };
}

/** Merge a patch over the document's display settings (filling defaults). */
export function updateDisplay(
  doc: GanttDocument,
  patch: Partial<DisplaySettings>,
): GanttDocument {
  return { ...doc, display: { ...resolveDisplay(doc), ...patch } };
}

export function addMarker(
  doc: GanttDocument,
  marker: DateMarker,
): GanttDocument {
  return { ...doc, markers: [...(doc.markers ?? []), marker] };
}

export function updateMarker(
  doc: GanttDocument,
  markerId: string,
  patch: Partial<DateMarker>,
): GanttDocument {
  return {
    ...doc,
    markers: (doc.markers ?? []).map((m) =>
      m.id === markerId ? { ...m, ...patch } : m,
    ),
  };
}

export function deleteMarker(
  doc: GanttDocument,
  markerId: string,
): GanttDocument {
  return {
    ...doc,
    markers: (doc.markers ?? []).filter((m) => m.id !== markerId),
  };
}
