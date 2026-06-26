import {
  LEGEND_PAD_TOP,
  LEGEND_SWATCH,
  type LegendEntry,
  layoutLegend,
} from "../../lib/legend";
import type { Theme } from "../../types";

interface ChartLegendProps {
  entries: LegendEntry[];
  /** Content width to wrap entries within. */
  width: number;
  /** y offset where the legend block begins (below the chart body). */
  top: number;
  theme: Theme;
}

/** In-chart legend rendered below the timeline; included in exports. */
export function ChartLegend({ entries, width, top, theme }: ChartLegendProps) {
  const { items } = layoutLegend(entries, width, theme);
  if (items.length === 0) return null;
  const { fontSize, fontFamily, fontWeight } = theme.typography;
  return (
    <g data-part="legend" transform={`translate(0,${top})`}>
      <line
        x1={0}
        y1={6}
        x2={width}
        y2={6}
        stroke={theme.separators.rowColor}
        strokeWidth={theme.separators.rowWidth}
      />
      {items.map((item) => (
        <g key={`${item.label}:${item.color}`}>
          <rect
            x={item.x}
            y={LEGEND_PAD_TOP + item.y}
            width={LEGEND_SWATCH}
            height={LEGEND_SWATCH}
            rx={2}
            fill={item.color}
          />
          <text
            x={item.x + LEGEND_SWATCH + 6}
            y={LEGEND_PAD_TOP + item.y + LEGEND_SWATCH / 2}
            fill={theme.colors.text}
            fontFamily={fontFamily}
            fontSize={fontSize}
            fontWeight={fontWeight}
            dominantBaseline="central"
          >
            {item.label}
          </text>
        </g>
      ))}
    </g>
  );
}
