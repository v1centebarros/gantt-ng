import type { PointerEvent } from "react";
import type { Bar, Theme } from "../../types";

export type BarDragMode = "move" | "resize-start" | "resize-end";

interface TaskBarProps {
  bar: Bar;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  theme: Theme;
  selected?: boolean;
  interactive?: boolean;
  onPointerDown?: (
    e: PointerEvent<SVGElement>,
    bar: Bar,
    mode: BarDragMode,
  ) => void;
}

const HANDLE_WIDTH = 6;

export function TaskBar({
  bar,
  x,
  y,
  width,
  height,
  color,
  theme,
  selected,
  interactive,
  onPointerDown,
}: TaskBarProps) {
  const { bar: barStyle, typography } = theme;
  const w = Math.max(2, width);
  const canDrag = interactive && !bar.locked;
  const progress =
    bar.progress != null ? Math.max(0, Math.min(1, bar.progress)) : 0;

  return (
    <g data-part="bar" data-bar-id={bar.id}>
      <rect
        x={x}
        y={y}
        width={w}
        height={height}
        rx={barStyle.cornerRadius}
        fill={color}
        stroke={selected ? theme.colors.accent : barStyle.borderColor}
        strokeWidth={selected ? 2 : barStyle.borderWidth}
        style={canDrag ? { cursor: "grab" } : undefined}
        onPointerDown={
          canDrag ? (e) => onPointerDown?.(e, bar, "move") : undefined
        }
      />
      {progress > 0 && (
        <rect
          x={x}
          y={y}
          width={w * progress}
          height={height}
          rx={barStyle.cornerRadius}
          fill="#000000"
          opacity={barStyle.progressOpacity}
          pointerEvents="none"
        />
      )}
      {barStyle.labelPlacement === "inside" && w > 24 && (
        <text
          x={x + 8}
          y={y + height / 2}
          fill="#ffffff"
          fontFamily={typography.fontFamily}
          fontSize={typography.barLabelFontSize}
          dominantBaseline="central"
          pointerEvents="none"
        >
          {bar.label}
        </text>
      )}
      {barStyle.labelPlacement === "right" && (
        <text
          x={x + w + 6}
          y={y + height / 2}
          fill={theme.colors.text}
          fontFamily={typography.fontFamily}
          fontSize={typography.barLabelFontSize}
          dominantBaseline="central"
          pointerEvents="none"
        >
          {bar.label}
        </text>
      )}
      {canDrag && selected && (
        <>
          <rect
            x={x}
            y={y}
            width={HANDLE_WIDTH}
            height={height}
            fill={theme.colors.accent}
            opacity={0.9}
            style={{ cursor: "ew-resize" }}
            onPointerDown={(e) => onPointerDown?.(e, bar, "resize-start")}
          />
          <rect
            x={x + w - HANDLE_WIDTH}
            y={y}
            width={HANDLE_WIDTH}
            height={height}
            fill={theme.colors.accent}
            opacity={0.9}
            style={{ cursor: "ew-resize" }}
            onPointerDown={(e) => onPointerDown?.(e, bar, "resize-end")}
          />
        </>
      )}
    </g>
  );
}
