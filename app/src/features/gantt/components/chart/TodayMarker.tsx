import type { Scale } from "../../lib/timescale/scale";
import type { Theme } from "../../types";

interface TodayMarkerProps {
  scale: Scale;
  top: number;
  bottom: number;
  theme: Theme;
  /** Injected for deterministic export/testing; defaults to now. */
  today?: Date;
}

/** Vertical line at "today", hidden when outside the chart window. */
export function TodayMarker({
  scale,
  top,
  bottom,
  theme,
  today,
}: TodayMarkerProps) {
  const now = today ?? new Date();
  if (now < scale.start || now > scale.end) return null;
  const x = scale.dateToX(now);
  return (
    <line
      data-part="today"
      x1={x}
      y1={top}
      x2={x}
      y2={bottom}
      stroke={theme.colors.todayMarker}
      strokeWidth={2}
      strokeDasharray="4 3"
    />
  );
}
