"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Bar, BarKind, Theme } from "../../types";

interface InspectorProps {
  bar: Bar | null;
  theme: Theme;
  onChange: (patch: Partial<Bar>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function Inspector({
  bar,
  theme,
  onChange,
  onDelete,
  onClose,
}: InspectorProps) {
  if (!bar) {
    return (
      <aside className="w-72 shrink-0 border-l border-border p-4 text-sm text-muted-foreground">
        Select a bar to edit it, or add a task to a row.
      </aside>
    );
  }

  const paletteKeys = Object.keys(theme.colors.palette);

  return (
    <aside className="w-72 shrink-0 space-y-4 border-l border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Edit task</h2>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bar-label">Label</Label>
        <Input
          id="bar-label"
          value={bar.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Type</Label>
        <Select
          value={bar.kind}
          onValueChange={(v) => onChange({ kind: v as BarKind })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="milestone">Milestone</SelectItem>
            <SelectItem value="summary">Summary</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="bar-start">Start</Label>
          <Input
            id="bar-start"
            type="date"
            value={bar.start}
            onChange={(e) => onChange({ start: e.target.value })}
          />
        </div>
        {bar.kind !== "milestone" && (
          <div className="space-y-1.5">
            <Label htmlFor="bar-end">End</Label>
            <Input
              id="bar-end"
              type="date"
              value={bar.end}
              onChange={(e) => onChange({ end: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Color</Label>
        <Select
          value={bar.color ?? "palette.blue"}
          onValueChange={(v) => onChange({ color: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {paletteKeys.map((key) => (
              <SelectItem key={key} value={`palette.${key}`}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ backgroundColor: theme.colors.palette[key] }}
                  />
                  {key}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bar-progress">Progress (%)</Label>
        <Input
          id="bar-progress"
          type="number"
          min={0}
          max={100}
          value={Math.round((bar.progress ?? 0) * 100)}
          onChange={(e) =>
            onChange({
              progress:
                Math.max(0, Math.min(100, Number(e.target.value))) / 100,
            })
          }
        />
      </div>

      <Button variant="destructive" className="w-full" onClick={onDelete}>
        <X className="size-4" /> Delete task
      </Button>
    </aside>
  );
}
