import type { PointerEvent, Ref } from "react";
import { GANTT_DEFAULTS } from "../../constants";
import type { MarkerDraft } from "../../hooks/useMarkerDrag";
import { applyDraftToRows, type BarDraft } from "../../lib/draft";
import {
  chartHeight,
  computeRowLayouts,
  type RowLayout,
} from "../../lib/geometry";
import { buildLegend, legendBlockHeight } from "../../lib/legend";
import { createScale } from "../../lib/timescale/scale";
import { generateTicks } from "../../lib/timescale/ticks";
import {
  type Bar,
  type DateMarker,
  type GanttDocument,
  resolveDisplay,
  type Theme,
} from "../../types";
import { BarLayer } from "./BarLayer";
import { ChartLegend } from "./ChartLegend";
import { DateMarkers } from "./DateMarkers";
import { GridLayer } from "./GridLayer";
import { RowBands } from "./RowBands";
import type { BarDragMode } from "./TaskBar";
import { TimelineHeader } from "./TimelineHeader";
import { TodayMarker } from "./TodayMarker";

interface GanttChartProps {
  document: GanttDocument;
  theme: Theme;
  themes: Theme[];
  /** Include the left label gutter (used for standalone/export rendering). */
  withGutter?: boolean;
  interactive?: boolean;
  selectedBarId?: string | null;
  draft?: BarDraft | null;
  today?: Date;
  svgRef?: Ref<SVGSVGElement>;
  onBarPointerDown?: (
    e: PointerEvent<SVGElement>,
    bar: Bar,
    mode: BarDragMode,
  ) => void;
  onBackgroundPointerDown?: (e: PointerEvent<SVGSVGElement>) => void;
  markerDraft?: MarkerDraft | null;
  onMarkerPointerDown?: (
    e: PointerEvent<SVGElement>,
    marker: DateMarker,
  ) => void;
}

export function GanttChart({
  document,
  theme,
  themes,
  withGutter = false,
  interactive = false,
  selectedBarId,
  draft,
  today,
  svgRef,
  onBarPointerDown,
  onBackgroundPointerDown,
  markerDraft,
  onMarkerPointerDown,
}: GanttChartProps) {
  const { timescale } = document;
  const scale = createScale(timescale);
  const showSecondary = timescale.showSecondaryLabels !== false;
  const primary = generateTicks(
    timescale.start,
    timescale.end,
    timescale.primaryUnit,
    timescale.weekStartsOn,
    { monthLabelStyle: timescale.monthLabelStyle },
  );
  const secondary = generateTicks(
    timescale.start,
    timescale.end,
    timescale.secondaryUnit,
    timescale.weekStartsOn,
    { monthLabelStyle: timescale.monthLabelStyle },
  );
  // Bake the live drag draft into the rows so lane packing and row heights
  // reflect the in-progress gesture (overlaps grow the row instead of stacking
  // bars on top of each other).
  const effectiveRows = applyDraftToRows(document.rows, draft ?? null);
  const layouts = computeRowLayouts(effectiveRows, theme.header.height, {
    barHeight: theme.bar.height,
    laneGap: GANTT_DEFAULTS.laneGap,
    padding: GANTT_DEFAULTS.rowPadding,
  });
  const gutterW = withGutter ? GANTT_DEFAULTS.gutterWidth : 0;
  const bodyHeight = chartHeight(layouts, theme.header.height);
  const display = resolveDisplay(document);
  const legendEntries = display.legend.show
    ? buildLegend(document.rows, display.legend.groupBy, theme, themes)
    : [];
  const legendH = legendBlockHeight(legendEntries, scale.totalWidth, theme);
  const height = bodyHeight + legendH;
  const width = gutterW + scale.totalWidth;
  const headerH = theme.header.height;

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: theme.typography.fontFamily, display: "block" }}
      onPointerDown={onBackgroundPointerDown}
    >
      <title>{`Gantt chart: ${document.meta.title}`}</title>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={theme.colors.background}
      />

      <g transform={`translate(${gutterW},0)`}>
        <RowBands layouts={layouts} width={scale.totalWidth} theme={theme} />
        <GridLayer
          ticks={secondary}
          scale={scale}
          top={headerH}
          bottom={bodyHeight}
          theme={theme}
        />
        <BarLayer
          layouts={layouts}
          scale={scale}
          docTheme={theme}
          themes={themes}
          selectedBarId={selectedBarId}
          interactive={interactive}
          onBarPointerDown={onBarPointerDown}
        />
        {/* Markers draw above bars so their lines and labels stay visible. */}
        {display.showTodayMarker && (
          <TodayMarker
            scale={scale}
            top={headerH}
            bottom={bodyHeight}
            theme={theme}
            today={today}
          />
        )}
        <DateMarkers
          markers={document.markers ?? []}
          scale={scale}
          top={headerH}
          bottom={bodyHeight}
          theme={theme}
          interactive={interactive}
          draft={markerDraft}
          onMarkerPointerDown={onMarkerPointerDown}
        />
        <TimelineHeader
          primary={primary}
          secondary={secondary}
          scale={scale}
          theme={theme}
          showSecondary={showSecondary}
        />
        {legendEntries.length > 0 && (
          <ChartLegend
            entries={legendEntries}
            width={scale.totalWidth}
            top={bodyHeight}
            theme={theme}
          />
        )}
      </g>

      {withGutter && (
        <Gutter
          layouts={layouts}
          headerH={headerH}
          height={height}
          theme={theme}
        />
      )}
    </svg>
  );
}

function Gutter({
  layouts,
  headerH,
  height,
  theme,
}: {
  layouts: RowLayout[];
  headerH: number;
  height: number;
  theme: Theme;
}) {
  const w = GANTT_DEFAULTS.gutterWidth;
  const { separators, colors, typography, header } = theme;
  return (
    <g data-part="gutter">
      <rect x={0} y={0} width={w} height={height} fill={colors.surface} />
      <rect x={0} y={0} width={w} height={headerH} fill={header.background} />
      {layouts.map((l) => (
        <g key={l.row.id}>
          <line
            x1={0}
            y1={l.top + l.height}
            x2={w}
            y2={l.top + l.height}
            stroke={separators.rowColor}
            strokeWidth={separators.rowWidth}
          />
          <text
            x={12}
            y={l.top + l.height / 2}
            fill={colors.text}
            fontFamily={typography.fontFamily}
            fontSize={typography.fontSize}
            dominantBaseline="central"
          >
            {l.row.label}
          </text>
        </g>
      ))}
      <line
        x1={w}
        y1={0}
        x2={w}
        y2={height}
        stroke={separators.gutterColor}
        strokeWidth={separators.gutterWidth}
      />
      <line
        x1={0}
        y1={headerH}
        x2={w}
        y2={headerH}
        stroke={header.borderColor}
        strokeWidth={1}
      />
    </g>
  );
}
