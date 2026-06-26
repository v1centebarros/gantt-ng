import type { PointerEvent } from "react";
import type { MarkerDraft } from "../../hooks/useMarkerDrag";
import { resolveColor } from "../../lib/theme/resolve";
import type { Scale } from "../../lib/timescale/scale";
import { parseDay } from "../../lib/timescale/units";
import type { DateMarker, StrokeStyle, Theme } from "../../types";

/** SVG stroke-dasharray for a marker's line style (relative to its width). */
function dashArray(
  style: StrokeStyle | undefined,
  width: number,
): string | undefined {
  if (style === "dashed") return `${width * 3} ${width * 2}`;
  if (style === "dotted") return `${width} ${width * 2}`;
  return undefined;
}

interface DateMarkersProps {
  markers: DateMarker[];
  scale: Scale;
  top: number;
  bottom: number;
  theme: Theme;
  interactive?: boolean;
  /** Live position of the marker being dragged. */
  draft?: MarkerDraft | null;
  onMarkerPointerDown?: (
    e: PointerEvent<SVGElement>,
    marker: DateMarker,
  ) => void;
}

/** Vertical lines at user-defined dates, each with an optional label. */
export function DateMarkers({
  markers,
  scale,
  top,
  bottom,
  theme,
  interactive = false,
  draft,
  onMarkerPointerDown,
}: DateMarkersProps) {
  return (
    <g data-part="markers">
      {markers.map((marker) => {
        // While dragging this marker, follow the live draft date.
        const dateStr = draft?.id === marker.id ? draft.date : marker.date;
        const date = parseDay(dateStr);
        if (date < scale.start || date > scale.end) return null;
        const x = scale.dateToX(date);
        const color = resolveColor(marker.color, theme, theme.colors.accent);
        const width = marker.strokeWidth ?? 2;
        return (
          <g key={marker.id} data-part="marker">
            <line
              x1={x}
              y1={top}
              x2={x}
              y2={bottom}
              stroke={color}
              strokeWidth={width}
              strokeDasharray={dashArray(marker.strokeStyle, width)}
            />
            {marker.label && marker.showLabel !== false && (
              <text
                x={x + 4}
                y={top + theme.typography.fontSize}
                fill={color}
                fontFamily={theme.typography.fontFamily}
                fontSize={theme.typography.fontSize}
                fontWeight={theme.typography.fontWeight}
              >
                {marker.label}
              </text>
            )}
            {interactive && (
              // Wide transparent hit area for grabbing the thin line.
              <line
                x1={x}
                y1={top}
                x2={x}
                y2={bottom}
                stroke="transparent"
                strokeWidth={10}
                style={{ cursor: "ew-resize" }}
                onPointerDown={(e) => onMarkerPointerDown?.(e, marker)}
              />
            )}
          </g>
        );
      })}
    </g>
  );
}
