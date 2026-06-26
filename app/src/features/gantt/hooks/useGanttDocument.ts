"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GanttDocument, GanttFile } from "../types";
import { useSaveDocument } from "./useDocuments";

const AUTOSAVE_DELAY_MS = 500;
const MAX_HISTORY = 100;

interface History {
  past: GanttDocument[];
  present: GanttDocument;
  future: GanttDocument[];
}

/**
 * Holds a live, editable copy of the document for snappy local edits and
 * debounced autosave to IndexedDB. Edits apply instantly to local state; the
 * persisted write is coalesced. Every edit is recorded so it can be undone and
 * redone.
 */
export function useGanttDocument(initial: GanttFile) {
  const [history, setHistory] = useState<History>({
    past: [],
    present: initial.document,
    future: [],
  });
  const doc = history.present;
  const save = useSaveDocument();
  const baseFileRef = useRef(initial);
  const saveRef = useRef(save);
  saveRef.current = save;
  const skipFirstRef = useRef(true);

  const update = useCallback(
    (updater: (prev: GanttDocument) => GanttDocument) => {
      setHistory((h) => {
        const next = updater(h.present);
        if (next === h.present) return h;
        return {
          past: [...h.past, h.present].slice(-MAX_HISTORY),
          present: next,
          future: [],
        };
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      return {
        past: [...h.past, h.present],
        present: next,
        future: h.future.slice(1),
      };
    });
  }, []);

  useEffect(() => {
    if (skipFirstRef.current) {
      skipFirstRef.current = false;
      return;
    }
    const handle = setTimeout(() => {
      saveRef.current.mutate({ ...baseFileRef.current, document: doc });
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(handle);
  }, [doc]);

  return {
    doc,
    update,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    isSaving: save.isPending,
  };
}
