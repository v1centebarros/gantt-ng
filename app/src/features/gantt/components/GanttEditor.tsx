"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GANTT_DEFAULTS } from "../constants";
import { useBarDrag } from "../hooks/useBarDrag";
import { useImportDocument } from "../hooks/useDocuments";
import { useGanttDocument } from "../hooks/useGanttDocument";
import { useThemes } from "../hooks/useThemes";
import { type ExportFormat, exportChart } from "../lib/export/exporters";
import { createBar, createRow } from "../lib/factory";
import { computeRowLayouts, sortedRows } from "../lib/geometry";
import {
  addBar,
  addRow,
  deleteBar,
  deleteRow,
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
import type { Bar, GanttFile, TimescaleConfig } from "../types";
import { GanttChart } from "./chart/GanttChart";
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

  const theme = resolveTheme(doc.themeId, themes, LIGHT_THEME);
  const scale = useMemo(() => createScale(doc.timescale), [doc.timescale]);
  const layouts = useMemo(
    () =>
      computeRowLayouts(
        doc.rows,
        theme.header.height,
        GANTT_DEFAULTS.rowHeight,
      ),
    [doc.rows, theme.header.height],
  );

  const selectedBar = useMemo<Bar | null>(() => {
    if (!selectedBarId) return null;
    for (const row of doc.rows) {
      const bar = row.bars.find((b) => b.id === selectedBarId);
      if (bar) return bar;
    }
    return null;
  }, [doc.rows, selectedBarId]);

  const drag = useBarDrag({
    pixelsPerDay: doc.timescale.pixelsPerDay,
    onCommit: (barId, start, end) =>
      update((d) => updateBarDates(d, barId, start, end)),
  });

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
    <div className="flex h-dvh flex-col">
      <Toolbar
        title={doc.meta.title}
        onTitleChange={(title) => update((d) => renameDocument(d, title))}
        onAddRow={handleAddRow}
        onAddTask={handleAddTask}
        themes={themes}
        themeId={doc.themeId}
        onThemeChange={(id) => update((d) => setDocumentTheme(d, id))}
        timescale={doc.timescale}
        onTimescaleChange={(patch: Partial<TimescaleConfig>) =>
          update((d) => updateTimescale(d, patch))
        }
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
              onBarPointerDown={(e, bar, mode) => {
                setSelectedBarId(bar.id);
                drag.onBarPointerDown(e, bar, mode);
              }}
              onBackgroundPointerDown={() => setSelectedBarId(null)}
            />
          </div>
        </div>

        <Inspector
          bar={selectedBar}
          theme={theme}
          onChange={(patch) =>
            selectedBar && update((d) => updateBar(d, selectedBar.id, patch))
          }
          onDelete={() => {
            if (selectedBar) {
              update((d) => deleteBar(d, selectedBar.id));
              setSelectedBarId(null);
            }
          }}
          onClose={() => setSelectedBarId(null)}
        />
      </div>
    </div>
  );
}
