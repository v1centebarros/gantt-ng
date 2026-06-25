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
export function GridLayer({
  ticks,
  scale,
  top,
  bottom,
  theme,
}: GridLayerProps) {
  const { grid } = theme;
  if (!grid.show) return null;
  return (
    <g data-part="grid">
      {ticks.map((tick, i) => {
        const x = scale.dateToX(tick.start);
        const isMajor = grid.majorEvery > 0 && i % grid.majorEvery === 0;
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
