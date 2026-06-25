import type { RowLayout } from "../../lib/geometry";
import { zebraFill } from "../../lib/geometry";
import type { Theme } from "../../types";

interface RowBandsProps {
  layouts: RowLayout[];
  width: number;
  theme: Theme;
}

/** Zebra row backgrounds plus the horizontal separator under each row. */
export function RowBands({ layouts, width, theme }: RowBandsProps) {
  const { separators } = theme;
  return (
    <g data-part="row-bands">
      {layouts.map((l) => (
        <g key={l.row.id}>
          <rect
            x={0}
            y={l.top}
            width={width}
            height={l.height}
            fill={zebraFill(l.index, theme)}
          />
          <line
            x1={0}
            y1={l.top + l.height}
            x2={width}
            y2={l.top + l.height}
            stroke={separators.rowColor}
            strokeWidth={separators.rowWidth}
          />
        </g>
      ))}
    </g>
  );
}
