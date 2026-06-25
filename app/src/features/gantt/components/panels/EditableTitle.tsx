"use client";

import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableTitleProps {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Click-to-edit title: shows as plain text with a hover affordance, becomes an
 * input on click. Enter or blur commits; Escape cancels.
 */
export function EditableTitle({
  value,
  onCommit,
  placeholder = "Untitled",
  className,
}: EditableTitleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  // Set when Escape cancels, so the resulting blur doesn't also commit.
  const skipBlur = useRef(false);

  // Focus and select the field when entering edit mode.
  useEffect(() => {
    if (editing) {
      const el = inputRef.current;
      el?.focus();
      el?.select();
    }
  }, [editing]);

  function start() {
    setDraft(value);
    setEditing(true);
  }

  function commit() {
    const next = draft.trim();
    if (next && next !== value) onCommit(next);
    setEditing(false);
  }

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (skipBlur.current) {
            skipBlur.current = false;
            setEditing(false);
            return;
          }
          commit();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            skipBlur.current = true;
            e.currentTarget.blur();
          }
        }}
        className={cn("w-56 font-medium", className)}
        aria-label="Document title"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      title="Click to rename"
      aria-label="Rename document"
      className={cn(
        "group flex h-9 max-w-56 items-center gap-1.5 rounded-md px-2 text-left text-sm font-medium transition-colors hover:bg-accent",
        className,
      )}
    >
      <span className="truncate">{value || placeholder}</span>
      <Pencil className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}
