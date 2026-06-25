"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Theme } from "../../types";

interface ThemePickerProps {
  themes: Theme[];
  value: string;
  onChange: (themeId: string) => void;
}

export function ThemePicker({ themes, value, onChange }: ThemePickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-36">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        {themes.map((theme) => (
          <SelectItem key={theme.id} value={theme.id}>
            <span className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-full border border-border"
                style={{ backgroundColor: theme.colors.accent }}
              />
              {theme.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
