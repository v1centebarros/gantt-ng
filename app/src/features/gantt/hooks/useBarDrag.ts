"use client";

import { type PointerEvent, useCallback, useRef, useState } from "react";
import type { BarDraft } from "../components/chart/BarLayer";
import type { BarDragMode } from "../components/chart/TaskBar";
import { addDays, diffDays, formatDay, parseDay } from "../lib/timescale/units";
import type { Bar } from "../types";

interface DragState {
  bar: Bar;
  mode: BarDragMode;
  startClientX: number;
  origStart: Date;
  origEnd: Date;
}

interface UseBarDragOptions {
  pixelsPerDay: number;
  /** Commit final dates on pointer-up. */
  onCommit: (barId: string, start: string, end: string) => void;
}

/**
 * Custom pointer-based move/resize for timeline bars. During the gesture only a
 * local `draft` updates (60fps, no persistence); the committed value is written
 * once on pointer-up via `onCommit`. Whole-day snapping is applied throughout.
 */
export function useBarDrag({ pixelsPerDay, onCommit }: UseBarDragOptions) {
  const [draft, setDraft] = useState<BarDraft | null>(null);
  const stateRef = useRef<DragState | null>(null);

  const onBarPointerDown = useCallback(
    (e: PointerEvent<SVGElement>, bar: Bar, mode: BarDragMode) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      stateRef.current = {
        bar,
        mode,
        startClientX: e.clientX,
        origStart: parseDay(bar.start),
        origEnd: parseDay(bar.end),
      };
      setDraft({ id: bar.id, start: bar.start, end: bar.end });
    },
    [],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<Element>) => {
      const s = stateRef.current;
      if (!s) return;
      const deltaDays = Math.round((e.clientX - s.startClientX) / pixelsPerDay);
      let start = s.origStart;
      let end = s.origEnd;

      if (s.mode === "move") {
        start = addDays(s.origStart, deltaDays);
        end = addDays(s.origEnd, deltaDays);
      } else if (s.mode === "resize-start") {
        start = addDays(s.origStart, deltaDays);
        if (diffDays(start, s.origEnd) < 1) start = addDays(s.origEnd, -1);
        end = s.origEnd;
      } else {
        end = addDays(s.origEnd, deltaDays);
        if (diffDays(s.origStart, end) < 1) end = addDays(s.origStart, 1);
        start = s.origStart;
      }
      setDraft({ id: s.bar.id, start: formatDay(start), end: formatDay(end) });
    },
    [pixelsPerDay],
  );

  const onPointerUp = useCallback(() => {
    const s = stateRef.current;
    if (s && draft) onCommit(s.bar.id, draft.start, draft.end);
    stateRef.current = null;
    setDraft(null);
  }, [draft, onCommit]);

  return { draft, onBarPointerDown, onPointerMove, onPointerUp };
}
