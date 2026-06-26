"use client";

import { type PointerEvent, useCallback, useRef, useState } from "react";
import type { BarDragMode } from "../components/chart/TaskBar";
import type { BarDraft } from "../lib/draft";
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
  /** Commit final dates (and target row, if moved) on pointer-up. */
  onCommit: (barId: string, start: string, end: string, rowId?: string) => void;
  /** Resolve the row id under a client-Y coordinate (for cross-row moves). */
  getRowIdAtClientY?: (clientY: number) => string | null;
}

/**
 * Custom pointer-based move/resize for timeline bars. During the gesture only a
 * local `draft` updates (60fps, no persistence); the committed value is written
 * once on pointer-up via `onCommit`. Whole-day snapping is applied throughout.
 * In "move" mode the bar can also be dragged vertically onto another row.
 */
export function useBarDrag({
  pixelsPerDay,
  onCommit,
  getRowIdAtClientY,
}: UseBarDragOptions) {
  const [draft, setDraft] = useState<BarDraft | null>(null);
  const stateRef = useRef<DragState | null>(null);
  const draftRef = useRef<BarDraft | null>(null);

  const setBoth = useCallback((next: BarDraft | null) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  const onBarPointerDown = useCallback(
    (e: PointerEvent<SVGElement>, bar: Bar, mode: BarDragMode) => {
      e.stopPropagation();
      // Only the primary button drags; other buttons (e.g. right-click for the
      // context menu) keep the selection but must not start a gesture.
      if (e.button !== 0) return;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      stateRef.current = {
        bar,
        mode,
        startClientX: e.clientX,
        origStart: parseDay(bar.start),
        origEnd: parseDay(bar.end),
      };
      setBoth({ id: bar.id, start: bar.start, end: bar.end, rowId: bar.rowId });
    },
    [setBoth],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<Element>) => {
      const s = stateRef.current;
      if (!s) return;
      const deltaDays = Math.round((e.clientX - s.startClientX) / pixelsPerDay);
      let start = s.origStart;
      let end = s.origEnd;
      let rowId = s.bar.rowId;

      if (s.mode === "move") {
        start = addDays(s.origStart, deltaDays);
        end = addDays(s.origEnd, deltaDays);
        rowId = getRowIdAtClientY?.(e.clientY) ?? s.bar.rowId;
      } else if (s.mode === "resize-start") {
        start = addDays(s.origStart, deltaDays);
        if (diffDays(start, s.origEnd) < 1) start = addDays(s.origEnd, -1);
        end = s.origEnd;
      } else {
        end = addDays(s.origEnd, deltaDays);
        if (diffDays(s.origStart, end) < 1) end = addDays(s.origStart, 1);
        start = s.origStart;
      }
      setBoth({
        id: s.bar.id,
        start: formatDay(start),
        end: formatDay(end),
        rowId,
      });
    },
    [pixelsPerDay, getRowIdAtClientY, setBoth],
  );

  const onPointerUp = useCallback(() => {
    const s = stateRef.current;
    const d = draftRef.current;
    if (s && d) onCommit(s.bar.id, d.start, d.end, d.rowId);
    stateRef.current = null;
    setBoth(null);
  }, [onCommit, setBoth]);

  return { draft, onBarPointerDown, onPointerMove, onPointerUp };
}
