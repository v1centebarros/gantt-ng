import { memo, type PointerEvent, type Ref, useMemo } from "react";
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
  /**
   * Visible x-range in SVG coordinates. When set, only cells/bars intersecting
   * it are rendered (viewport virtualization). Omit to render the whole chart
   * (exports, thumbnails).
   */
  clip?: { x0: number; x1: number };
}

function GanttChartImpl({
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
  clip,
}: GanttChartProps) {
  const { timescale } = document;
  const scale = useMemo(() => createScale(timescale), [timescale]);
  const showSecondary = timescale.showSecondaryLabels !== false;

  // Visible date range for tick clipping (whole window when not virtualizing).
  const clipDates = useMemo(
    () =>
      clip
        ? { clipStart: scale.xToDate(clip.x0), clipEnd: scale.xToDate(clip.x1) }
        : undefined,
    [clip, scale],
  );

  const primary = useMemo(
    () =>
      generateTicks(
        timescale.start,
        timescale.end,
        timescale.primaryUnit,
        timescale.weekStartsOn,
        { monthLabelStyle: timescale.monthLabelStyle, ...clipDates },
      ),
    [timescale, clipDates],
  );
  const secondary = useMemo(
    () =>
      generateTicks(
        timescale.start,
        timescale.end,
        timescale.secondaryUnit,
        timescale.weekStartsOn,
        { monthLabelStyle: timescale.monthLabelStyle, ...clipDates },
      ),
    [timescale, clipDates],
  );
  // Bake the live drag draft into the rows so lane packing and row heights
  // reflect the in-progress gesture (overlaps grow the row instead of stacking
  // bars on top of each other).
  const layouts = useMemo(() => {
    const effectiveRows = applyDraftToRows(document.rows, draft ?? null);
    return computeRowLayouts(effectiveRows, theme.header.height, {
      barHeight: theme.bar.height,
      laneGap: GANTT_DEFAULTS.laneGap,
      padding: GANTT_DEFAULTS.rowPadding,
    });
  }, [document.rows, draft, theme.header.height, theme.bar.height]);
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
      <defs>
        {/* Soft neutral shadow marking the selected bar (replaces a hard outline). */}
        <filter
          id="bar-selected-glow"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="2.5"
            floodColor={theme.colors.text}
            floodOpacity="0.35"
          />
        </filter>
      </defs>
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
          clip={clip}
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

/** Memoized so a drag (which only changes `draft`) doesn't rebuild the chart. */
export const GanttChart = memo(GanttChartImpl);

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
