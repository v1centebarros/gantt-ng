import type { PointerEvent } from "react";
import type { Bar, Theme } from "../../types";

interface MilestoneBarProps {
  bar: Bar;
  cx: number;
  cy: number;
  color: string;
  theme: Theme;
  selected?: boolean;
  interactive?: boolean;
  onPointerDown?: (e: PointerEvent<SVGElement>, bar: Bar) => void;
}

/** A milestone is a zero-duration marker drawn as a diamond. */
export function MilestoneBar({
  bar,
  cx,
  cy,
  color,
  theme,
  selected,
  interactive,
  onPointerDown,
}: MilestoneBarProps) {
  const s = theme.bar.milestoneSize / 2;
  const canDrag = interactive && !bar.locked;
  const path = `M ${cx} ${cy - s} L ${cx + s} ${cy} L ${cx} ${cy + s} L ${cx - s} ${cy} Z`;

  return (
    <g data-part="milestone" data-bar-id={bar.id}>
      <path
        d={path}
        fill={color}
        stroke={selected ? theme.colors.accent : theme.bar.borderColor}
        strokeWidth={selected ? 2 : theme.bar.borderWidth}
        style={canDrag ? { cursor: "grab" } : undefined}
        onPointerDown={canDrag ? (e) => onPointerDown?.(e, bar) : undefined}
      />
      {bar.showLabel !== false && (
        <text
          x={cx + s + 6}
          y={cy}
          fill={theme.colors.text}
          fontFamily={theme.typography.fontFamily}
          fontSize={theme.typography.barLabelFontSize}
          dominantBaseline="central"
          pointerEvents="none"
        >
          {bar.label}
        </text>
      )}
    </g>
  );
}
