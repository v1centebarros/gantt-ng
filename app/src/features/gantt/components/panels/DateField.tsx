"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface DateFieldProps {
  id?: string;
  /** Committed ISO value from the document. */
  value: string;
  onCommit: (value: string) => void;
  className?: string;
}

/**
 * A `type="date"` input that only commits on blur or Enter. Typing into a native
 * date input emits intermediate values (e.g. "0002-..." mid-keystroke); deferring
 * the commit keeps those out of the document so the chart never re-renders for a
 * partial date.
 */
export function DateField({ value, onCommit, ...rest }: DateFieldProps) {
  const [draft, setDraft] = useState(value);

  // Re-sync when the committed value changes externally (undo/redo, or End
  // shifting because Start moved).
  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    if (draft && draft !== value) onCommit(draft);
    // Snap back to the source of truth. The parent may clamp/normalize the
    // committed value — possibly back to the current one, which wouldn't
    // retrigger the [value] effect — so a cleared or out-of-range entry never
    // lingers in the input.
    setDraft(value);
  };

  return (
    <Input
      type="date"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit();
          e.currentTarget.blur();
        }
      }}
      {...rest}
    />
  );
}
