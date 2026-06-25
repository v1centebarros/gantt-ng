"use client";

import { Palette } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteTheme, useSaveTheme } from "../../hooks/useThemes";
import { newId } from "../../lib/factory";
import { LIGHT_THEME } from "../../lib/theme/builtins";
import { resolveTheme } from "../../lib/theme/resolve";
import { importTheme } from "../../lib/theme/serialize";
import type { Theme } from "../../types";
import { ThemeEditor } from "./ThemeEditor";
import { ThemePicker } from "./ThemePicker";

interface ThemeControlsProps {
  themes: Theme[];
  value: string;
  onChange: (id: string) => void;
}

function duplicate(theme: Theme, name: string): Theme {
  return { ...structuredClone(theme), id: newId(), name, builtin: false };
}

export function ThemeControls({ themes, value, onChange }: ThemeControlsProps) {
  const saveTheme = useSaveTheme();
  const deleteTheme = useDeleteTheme();
  const fileInput = useRef<HTMLInputElement>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [seed, setSeed] = useState<Theme>(LIGHT_THEME);

  const current = resolveTheme(value, themes, LIGHT_THEME);
  // A seed is deletable only if it's a stored, non-builtin theme.
  const seedExists = themes.some((t) => t.id === seed.id);
  const canDelete = seedExists && !seed.builtin;

  function openEdit() {
    // Builtins are read-only: editing one starts a custom duplicate.
    setSeed(
      current.builtin
        ? duplicate(current, `${current.name} (custom)`)
        : current,
    );
    setEditorOpen(true);
  }
  function openNew() {
    setSeed(duplicate(current, "Custom theme"));
    setEditorOpen(true);
  }

  function handleSave(theme: Theme) {
    saveTheme.mutate(theme, { onSuccess: () => onChange(theme.id) });
  }
  function handleDelete(id: string) {
    deleteTheme.mutate(id, { onSuccess: () => onChange(LIGHT_THEME.id) });
  }
  async function handleImport(file: File) {
    const theme = await importTheme(file);
    saveTheme.mutate(theme, { onSuccess: () => onChange(theme.id) });
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={fileInput}
        type="file"
        accept=".gtheme,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImport(file);
          e.target.value = "";
        }}
      />
      <ThemePicker themes={themes} value={value} onChange={onChange} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Theme options">
            <Palette className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={openEdit}>
            {current.builtin ? "Customize this theme" : "Edit theme"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openNew}>New theme</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => fileInput.current?.click()}>
            Import .gtheme
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ThemeEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        seed={seed}
        canDelete={canDelete}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
