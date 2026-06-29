import { memo } from "react";
import type { Scale } from "../../lib/timescale/scale";
import type { Tick } from "../../lib/timescale/ticks";
import type { Theme } from "../../types";

interface GridLayerProps {
  ticks: Tick[];
  scale: Scale;
  top: number;
  bottom: number;
  theme: Theme;
}

/** Vertical grid lines at each secondary tick, emphasized every `majorEvery`. */
function GridLayerImpl({ ticks, scale, top, bottom, theme }: GridLayerProps) {
  const { grid } = theme;
  if (!grid.show) return null;
  return (
    <g data-part="grid">
      {ticks.map((tick) => {
        const x = scale.dateToX(tick.start);
        // Use the absolute index so emphasis stays put while virtualizing.
        const isMajor =
          grid.majorEvery > 0 && tick.index % grid.majorEvery === 0;
        return (
          <line
            key={tick.start.getTime()}
            x1={x}
            y1={top}
            x2={x}
            y2={bottom}
            stroke={isMajor ? (grid.majorColor ?? grid.color) : grid.color}
            strokeWidth={grid.width}
            strokeDasharray={grid.dash?.join(" ")}
          />
        );
      })}
    </g>
  );
}

export const GridLayer = memo(GridLayerImpl);
