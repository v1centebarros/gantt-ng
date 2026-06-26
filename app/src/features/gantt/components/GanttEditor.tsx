"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { GANTT_DEFAULTS } from "../constants";
import { useBarDrag } from "../hooks/useBarDrag";
import { useImportDocument } from "../hooks/useDocuments";
import { useEditorShortcuts } from "../hooks/useEditorShortcuts";
import { useGanttDocument } from "../hooks/useGanttDocument";
import { useMarkerDrag } from "../hooks/useMarkerDrag";
import { useThemes } from "../hooks/useThemes";
import { applyDraftToRows } from "../lib/draft";
import { type ExportFormat, exportChart } from "../lib/export/exporters";
import { createBar, createMarker, createRow } from "../lib/factory";
import { computeRowLayouts, type RowLayout, sortedRows } from "../lib/geometry";
import {
  addBar,
  addMarker,
  addRow,
  deleteBar,
  deleteMarker,
  deleteRow,
  moveBarToRow,
  renameDocument,
  reorderRows,
  setDocumentTheme,
  updateBar,
  updateBarDates,
  updateDisplay,
  updateMarker,
  updateRow,
  updateTimescale,
} from "../lib/mutations";
import { exportGanttFile, importGanttFile } from "../lib/persistence/serialize";
import { findFreeSlot } from "../lib/placement";
import { LIGHT_THEME } from "../lib/theme/builtins";
import { resolveTheme } from "../lib/theme/resolve";
import { createScale } from "../lib/timescale/scale";
import { formatDay } from "../lib/timescale/units";
import { type Bar, type GanttFile, resolveDisplay } from "../types";
import { GanttChart } from "./chart/GanttChart";
import { GanttSettings } from "./panels/GanttSettings";
import { Inspector } from "./panels/Inspector";
import { RowList } from "./panels/RowList";
import { Toolbar } from "./panels/Toolbar";

export function GanttEditor({ initialFile }: { initialFile: GanttFile }) {
  const router = useRouter();
  const { doc, update, undo, redo, canUndo, canRedo, isSaving } =
    useGanttDocument(initialFile);
  const { data: themes = [] } = useThemes();
  const importDoc = useImportDocument();
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layoutsRef = useRef<RowLayout[]>([]);
  const sidebarRef = useRef<ImperativePanelHandle>(null);
  // Date under the last right-click, for "Add marker here".
  const markerDateRef = useRef<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function toggleSidebar() {
    const panel = sidebarRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }

  // Select a bar and make sure the inspector is visible (expand if collapsed).
  function selectBar(barId: string) {
    setSelectedBarId(barId);
    sidebarRef.current?.expand();
  }

  const deleteSelectedBar = useCallback(() => {
    if (!selectedBarId) return;
    update((d) => deleteBar(d, selectedBarId));
    setSelectedBarId(null);
  }, [update, selectedBarId]);

  useEditorShortcuts({
    onUndo: undo,
    onRedo: redo,
    onDelete: deleteSelectedBar,
  });

  const theme = resolveTheme(doc.themeId, themes, LIGHT_THEME);
  const scale = useMemo(() => createScale(doc.timescale), [doc.timescale]);

  // Map the right-click x to a snapped day so "Add marker here" lands on it.
  function rememberContextDate(e: { clientX: number }) {
    const svg = svgRef.current;
    if (!svg) return;
    const x = e.clientX - svg.getBoundingClientRect().left;
    markerDateRef.current = formatDay(scale.snap(scale.xToDate(x)));
  }
  function addMarkerAtContextDate() {
    const date = markerDateRef.current ?? doc.timescale.start;
    update((d) => addMarker(d, createMarker(date)));
  }

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

  const markerDrag = useMarkerDrag({
    pixelsPerDay: doc.timescale.pixelsPerDay,
    onCommit: (id, date) => update((d) => updateMarker(d, id, { date })),
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
    selectBar(bar.id);
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
    router.push(`/editor?doc=${imported.document.id}`);
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
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="gantt-editor-panels"
        className="min-h-0 flex-1"
      >
        <ResizablePanel defaultSize={75} minSize={30} className="min-w-0">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              {/* biome-ignore lint/a11y/noStaticElementInteractions: scroll container hosts the chart's pointer-drag and right-click menu; keyboard paths exist via toolbar + shortcuts */}
              <div
                className="h-full overflow-auto"
                onPointerMove={(e) => {
                  drag.onPointerMove(e);
                  markerDrag.onPointerMove(e);
                }}
                onPointerUp={() => {
                  drag.onPointerUp();
                  markerDrag.onPointerUp();
                }}
                onContextMenu={rememberContextDate}
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
                      selectBar(bar.id);
                      drag.onBarPointerDown(e, bar, mode);
                    }}
                    onBackgroundPointerDown={() => setSelectedBarId(null)}
                    markerDraft={markerDrag.draft}
                    onMarkerPointerDown={markerDrag.onMarkerPointerDown}
                  />
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem disabled={!canUndo} onSelect={undo}>
                Undo
                <ContextMenuShortcut>⌘Z</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem disabled={!canRedo} onSelect={redo}>
                Redo
                <ContextMenuShortcut>⇧⌘Z</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={addMarkerAtContextDate}>
                Add marker here
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                variant="destructive"
                disabled={!selectedBarId}
                onSelect={deleteSelectedBar}
              >
                Delete task
                <ContextMenuShortcut>⌫</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel
          ref={sidebarRef}
          order={2}
          defaultSize={25}
          minSize={16}
          maxSize={40}
          collapsible
          collapsedSize={0}
          onCollapse={() => setSidebarCollapsed(true)}
          onExpand={() => setSidebarCollapsed(false)}
          className="min-w-0 border-l border-border"
        >
          {selectedBar ? (
            <Inspector
              bar={selectedBar}
              theme={theme}
              onChange={(patch) =>
                update((d) => updateBar(d, selectedBar.id, patch))
              }
              onDelete={deleteSelectedBar}
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
              theme={theme}
              display={resolveDisplay(doc)}
              onDisplayChange={(patch) =>
                update((d) => updateDisplay(d, patch))
              }
              markers={doc.markers ?? []}
              onAddMarker={() =>
                update((d) => addMarker(d, createMarker(doc.timescale.start)))
              }
              onUpdateMarker={(id, patch) =>
                update((d) => updateMarker(d, id, patch))
              }
              onDeleteMarker={(id) => update((d) => deleteMarker(d, id))}
            />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
