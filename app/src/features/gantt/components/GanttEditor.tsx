"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { GANTT_DEFAULTS } from "../constants";
import { useBarDrag } from "../hooks/useBarDrag";
import { useImportDocument } from "../hooks/useDocuments";
import { useGanttDocument } from "../hooks/useGanttDocument";
import { useThemes } from "../hooks/useThemes";
import { applyDraftToRows } from "../lib/draft";
import { type ExportFormat, exportChart } from "../lib/export/exporters";
import { createBar, createRow } from "../lib/factory";
import { computeRowLayouts, type RowLayout, sortedRows } from "../lib/geometry";
import {
  addBar,
  addRow,
  deleteBar,
  deleteRow,
  moveBarToRow,
  renameDocument,
  reorderRows,
  setDocumentTheme,
  updateBar,
  updateBarDates,
  updateRow,
  updateTimescale,
} from "../lib/mutations";
import { exportGanttFile, importGanttFile } from "../lib/persistence/serialize";
import { findFreeSlot } from "../lib/placement";
import { LIGHT_THEME } from "../lib/theme/builtins";
import { resolveTheme } from "../lib/theme/resolve";
import { createScale } from "../lib/timescale/scale";
import type { Bar, GanttFile } from "../types";
import { GanttChart } from "./chart/GanttChart";
import { GanttSettings } from "./panels/GanttSettings";
import { Inspector } from "./panels/Inspector";
import { RowList } from "./panels/RowList";
import { Toolbar } from "./panels/Toolbar";

export function GanttEditor({ initialFile }: { initialFile: GanttFile }) {
  const router = useRouter();
  const { doc, update, isSaving } = useGanttDocument(initialFile);
  const { data: themes = [] } = useThemes();
  const importDoc = useImportDocument();
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layoutsRef = useRef<RowLayout[]>([]);

  const theme = resolveTheme(doc.themeId, themes, LIGHT_THEME);
  const scale = useMemo(() => createScale(doc.timescale), [doc.timescale]);

  const selectedBar = useMemo<Bar | null>(() => {
    if (!selectedBarId) return null;
    for (const row of doc.rows) {
      const bar = row.bars.find((b) => b.id === selectedBarId);
      if (bar) return bar;
    }
    return null;
  }, [doc.rows, selectedBarId]);

  // Map a client-Y coordinate to the row under it (for cross-row bar drags).
  // Reads the latest layout via a ref so the callback stays stable and the
  // drag hook and layout don't form a dependency cycle.
  const getRowIdAtClientY = useCallback((clientY: number): string | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const y = clientY - svg.getBoundingClientRect().top;
    for (const l of layoutsRef.current) {
      if (y >= l.top && y < l.top + l.height) return l.row.id;
    }
    const last = layoutsRef.current[layoutsRef.current.length - 1];
    if (last && y >= last.top + last.height) return last.row.id;
    return null;
  }, []);

  const drag = useBarDrag({
    pixelsPerDay: doc.timescale.pixelsPerDay,
    getRowIdAtClientY,
    onCommit: (barId, start, end, rowId) =>
      update((d) => {
        const dated = updateBarDates(d, barId, start, end);
        return rowId ? moveBarToRow(dated, barId, rowId) : dated;
      }),
  });

  // Bake the live drag draft into rows so lane packing + row heights grow as a
  // dragged bar overlaps others. The gutter and chart share this layout.
  const effectiveRows = useMemo(
    () => applyDraftToRows(doc.rows, drag.draft),
    [doc.rows, drag.draft],
  );
  const layouts = useMemo(
    () =>
      computeRowLayouts(effectiveRows, theme.header.height, {
        barHeight: theme.bar.height,
        laneGap: GANTT_DEFAULTS.laneGap,
        padding: GANTT_DEFAULTS.rowPadding,
      }),
    [effectiveRows, theme.header.height, theme.bar.height],
  );
  layoutsRef.current = layouts;

  // --- Row operations ------------------------------------------------------
  function handleAddRow() {
    update((d) => addRow(d, createRow(d.rows.length)));
  }
  // Place a task in the nearest free slot on the row so it never overlaps.
  function placeBar(rowId: string, bars: Bar[]) {
    const { start, end } = findFreeSlot(
      bars,
      doc.timescale.start,
      GANTT_DEFAULTS.newTaskDays,
    );
    const bar = createBar(rowId, start, end);
    update((d) => addBar(d, rowId, bar));
    setSelectedRowId(rowId);
    setSelectedBarId(bar.id);
  }
  function handleAddBar(rowId: string) {
    const row = doc.rows.find((r) => r.id === rowId);
    if (row) placeBar(rowId, row.bars);
  }
  function handleAddTask() {
    const rows = sortedRows(doc.rows);
    const last = rows[rows.length - 1];
    if (last) placeBar(last.id, last.bars);
  }

  // --- Export / import -----------------------------------------------------
  function handleExportImage(format: ExportFormat) {
    return exportChart(format, doc, theme, themes);
  }
  function handleExportGantt() {
    exportGanttFile({ ...initialFile, document: doc }, themes);
  }
  async function handleImportGantt(file: File) {
    const imported = await importGanttFile(file);
    await importDoc.mutateAsync(imported);
    router.push(`/editor/${imported.document.id}`);
  }

  const width = GANTT_DEFAULTS.gutterWidth + scale.totalWidth;

  return (
    <div className="flex h-dvh flex-col animate-in fade-in duration-200">
      <Toolbar
        title={doc.meta.title}
        onTitleChange={(title) => update((d) => renameDocument(d, title))}
        onAddRow={handleAddRow}
        onAddTask={handleAddTask}
        onExportImage={handleExportImage}
        onExportGantt={handleExportGantt}
        onImportGantt={handleImportGantt}
        isSaving={isSaving}
      />

      <div className="flex min-h-0 flex-1">
        <div
          className="min-w-0 flex-1 overflow-auto"
          onPointerMove={drag.onPointerMove}
          onPointerUp={drag.onPointerUp}
        >
          <div className="flex" style={{ width }}>
            <RowList
              layouts={layouts}
              headerHeight={theme.header.height}
              gutterWidth={GANTT_DEFAULTS.gutterWidth}
              selectedRowId={selectedRowId}
              onReorder={(ids) => update((d) => reorderRows(d, ids))}
              onSelectRow={setSelectedRowId}
              onRenameRow={(id, label) =>
                update((d) => updateRow(d, id, { label }))
              }
              onDeleteRow={(id) => update((d) => deleteRow(d, id))}
              onAddBar={handleAddBar}
            />
            <GanttChart
              document={doc}
              theme={theme}
              themes={themes}
              interactive
              selectedBarId={selectedBarId}
              draft={drag.draft}
              svgRef={svgRef}
              onBarPointerDown={(e, bar, mode) => {
                setSelectedBarId(bar.id);
                drag.onBarPointerDown(e, bar, mode);
              }}
              onBackgroundPointerDown={() => setSelectedBarId(null)}
            />
          </div>
        </div>

        {selectedBar ? (
          <Inspector
            bar={selectedBar}
            theme={theme}
            onChange={(patch) =>
              update((d) => updateBar(d, selectedBar.id, patch))
            }
            onDelete={() => {
              update((d) => deleteBar(d, selectedBar.id));
              setSelectedBarId(null);
            }}
            onClose={() => setSelectedBarId(null)}
          />
        ) : (
          <GanttSettings
            timescale={doc.timescale}
            onTimescaleChange={(patch) =>
              update((d) => updateTimescale(d, patch))
            }
            themes={themes}
            themeId={doc.themeId}
            onThemeChange={(id) => update((d) => setDocumentTheme(d, id))}
          />
        )}
      </div>
    </div>
  );
}
