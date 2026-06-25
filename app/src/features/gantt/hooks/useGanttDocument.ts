"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GanttDocument, GanttFile } from "../types";
import { useSaveDocument } from "./useDocuments";

const AUTOSAVE_DELAY_MS = 500;

/**
 * Holds a live, editable copy of the document for snappy local edits and
 * debounced autosave to IndexedDB. Edits apply instantly to local state; the
 * persisted write is coalesced.
 */
export function useGanttDocument(initial: GanttFile) {
  const [doc, setDoc] = useState<GanttDocument>(initial.document);
  const save = useSaveDocument();
  const baseFileRef = useRef(initial);
  const saveRef = useRef(save);
  saveRef.current = save;
  const skipFirstRef = useRef(true);

  const update = useCallback(
    (updater: (prev: GanttDocument) => GanttDocument) => {
      setDoc((prev) => updater(prev));
    },
    [],
  );

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

  return { doc, update, isSaving: save.isPending };
}
