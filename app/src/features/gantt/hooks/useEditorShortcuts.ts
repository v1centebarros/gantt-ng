"use client";

import { useEffect } from "react";

interface Options {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
}

// Don't hijack shortcuts while the user is typing in a field.
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * Global editor shortcuts: Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z (or Ctrl+Y) redo,
 * and Backspace/Delete to remove the current selection. Ignored while a form
 * field is focused.
 */
export function useEditorShortcuts({ onUndo, onRedo, onDelete }: Options) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;

      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        onDelete();
        return;
      }

      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) onRedo();
        else onUndo();
      } else if (key === "y") {
        e.preventDefault();
        onRedo();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onUndo, onRedo, onDelete]);
}
