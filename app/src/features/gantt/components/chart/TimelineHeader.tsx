import type { Scale } from "../../lib/timescale/scale";
import type { Tick } from "../../lib/timescale/ticks";
import type { Theme } from "../../types";

interface TimelineHeaderProps {
  primary: Tick[];
  secondary: Tick[];
  scale: Scale;
  theme: Theme;
}

/** Two-tier date header. The top tier is coarse (primaryUnit), bottom is fine. */
export function TimelineHeader({
  primary,
  secondary,
  scale,
  theme,
}: TimelineHeaderProps) {
  const { header, typography } = theme;
  const tierH = header.height / 2;

  return (
    <g data-part="timeline-header">
      <rect
        x={0}
        y={0}
        width={scale.totalWidth}
        height={header.height}
        fill={header.background}
      />
      {renderTier(
        primary,
        scale,
        0,
        tierH,
        theme,
        typography.headerFontSize,
        600,
      )}
      {renderTier(
        secondary,
        scale,
        tierH,
        tierH,
        theme,
        typography.headerFontSize - 1,
        400,
      )}
      <line
        x1={0}
        y1={header.height}
        x2={scale.totalWidth}
        y2={header.height}
        stroke={header.borderColor}
        strokeWidth={1}
      />
    </g>
  );
}

function renderTier(
  ticks: Tick[],
  scale: Scale,
  y: number,
  height: number,
  theme: Theme,
  fontSize: number,
  fontWeight: number,
) {
  const { header, typography } = theme;
  return ticks.map((tick) => {
    const x = scale.dateToX(tick.start);
    const w = scale.dateToX(tick.end) - x;
    const showLabel = w > 14;
    return (
      <g key={`${y}-${tick.start.getTime()}`}>
        <line
          x1={x}
          y1={y}
          x2={x}
          y2={y + height}
          stroke={header.borderColor}
          strokeWidth={1}
        />
        {showLabel && (
          <text
            x={x + w / 2}
            y={y + height / 2}
            fill={header.text}
            fontFamily={typography.fontFamily}
            fontSize={fontSize}
            fontWeight={fontWeight}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {tick.label}
          </text>
        )}
      </g>
    );
  });
}
