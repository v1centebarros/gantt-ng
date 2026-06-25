import type { PointerEvent } from "react";
import { barY, type RowLayout } from "../../lib/geometry";
import { resolveBarColor, resolveTheme } from "../../lib/theme/resolve";
import type { Scale } from "../../lib/timescale/scale";
import { parseDay } from "../../lib/timescale/units";
import type { Bar, Theme } from "../../types";
import { MilestoneBar } from "./MilestoneBar";
import { type BarDragMode, TaskBar } from "./TaskBar";

/** Provisional dates for the bar currently being dragged (not yet persisted). */
export interface BarDraft {
  id: string;
  start: string;
  end: string;
}

interface BarLayerProps {
  layouts: RowLayout[];
  scale: Scale;
  docTheme: Theme;
  themes: Theme[];
  selectedBarId?: string | null;
  interactive?: boolean;
  draft?: BarDraft | null;
  onBarPointerDown?: (
    e: PointerEvent<SVGElement>,
    bar: Bar,
    mode: BarDragMode,
  ) => void;
}

export function BarLayer({
  layouts,
  scale,
  docTheme,
  themes,
  selectedBarId,
  interactive,
  draft,
  onBarPointerDown,
}: BarLayerProps) {
  return (
    <g data-part="bars">
      {layouts.flatMap((layout) =>
        layout.row.bars.map((bar) => {
          const effective = resolveTheme(
            bar.themeId ?? layout.row.themeId,
            themes,
            docTheme,
          );
          const color = resolveBarColor(bar, effective);
          const selected = bar.id === selectedBarId;
          const start = draft?.id === bar.id ? draft.start : bar.start;
          const end = draft?.id === bar.id ? draft.end : bar.end;

          if (bar.kind === "milestone") {
            const cx = scale.dateToX(parseDay(start));
            const cy = layout.top + layout.height / 2;
            return (
              <MilestoneBar
                key={bar.id}
                bar={bar}
                cx={cx}
                cy={cy}
                color={color}
                theme={effective}
                selected={selected}
                interactive={interactive}
                onPointerDown={(e, b) => onBarPointerDown?.(e, b, "move")}
              />
            );
          }

          const x = scale.dateToX(parseDay(start));
          const width = scale.dateToX(parseDay(end)) - x;
          const y = barY(layout.top, layout.height, effective.bar.height);
          return (
            <TaskBar
              key={bar.id}
              bar={bar}
              x={x}
              y={y}
              width={width}
              height={effective.bar.height}
              color={color}
              theme={effective}
              selected={selected}
              interactive={interactive}
              onPointerDown={onBarPointerDown}
            />
          );
        }),
      )}
    </g>
  );
}
