"use client";

import { type PointerEvent, useCallback, useRef, useState } from "react";
import { addDays, formatDay, parseDay } from "../lib/timescale/units";
import type { DateMarker } from "../types";

export interface MarkerDraft {
  id: string;
  date: string;
}

interface DragState {
  id: string;
  startClientX: number;
  origDate: Date;
}

interface UseMarkerDragOptions {
  pixelsPerDay: number;
  /** Commit the final date on pointer-up. */
  onCommit: (id: string, date: string) => void;
}

/**
 * Horizontal pointer drag for date markers. During the gesture only a local
 * `draft` updates (no persistence); the committed date is written once on
 * pointer-up. Dates snap to whole days, matching the timeline grid.
 */
export function useMarkerDrag({ pixelsPerDay, onCommit }: UseMarkerDragOptions) {
  const [draft, setDraft] = useState<MarkerDraft | null>(null);
  const stateRef = useRef<DragState | null>(null);
  const draftRef = useRef<MarkerDraft | null>(null);

  const setBoth = useCallback((next: MarkerDraft | null) => {
    draftRef.current = next;
    setDraft(next);
  }, []);

  const onMarkerPointerDown = useCallback(
    (e: PointerEvent<SVGElement>, marker: DateMarker) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      stateRef.current = {
        id: marker.id,
        startClientX: e.clientX,
        origDate: parseDay(marker.date),
      };
      setBoth({ id: marker.id, date: marker.date });
    },
    [setBoth],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<Element>) => {
      const s = stateRef.current;
      if (!s) return;
      const deltaDays = Math.round((e.clientX - s.startClientX) / pixelsPerDay);
      setBoth({ id: s.id, date: formatDay(addDays(s.origDate, deltaDays)) });
    },
    [pixelsPerDay, setBoth],
  );

  const onPointerUp = useCallback(() => {
    const s = stateRef.current;
    const d = draftRef.current;
    if (s && d) onCommit(s.id, d.date);
    stateRef.current = null;
    setBoth(null);
  }, [onCommit, setBoth]);

  return { draft, onMarkerPointerDown, onPointerMove, onPointerUp };
}
