"use client";

import { Download, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { newId } from "../../lib/factory";
import { exportTheme } from "../../lib/theme/serialize";
import type { Theme } from "../../types";

interface ThemeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Theme to start editing. For builtins the parent passes a duplicate. */
  seed: Theme;
  /** Whether the seed already exists in storage (controls Delete). */
  canDelete: boolean;
  onSave: (theme: Theme) => void;
  onDelete: (id: string) => void;
}

export function ThemeEditor({
  open,
  onOpenChange,
  seed,
  canDelete,
  onSave,
  onDelete,
}: ThemeEditorProps) {
  const [draft, setDraft] = useState<Theme>(seed);

  // Reseed when a different theme is opened for editing.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reseed on identity/open only
  useEffect(() => {
    if (open) setDraft(seed);
  }, [open, seed.id]);

  function set<K extends keyof Theme>(key: K, value: Theme[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function setColors(patch: Partial<Theme["colors"]>) {
    setDraft((d) => ({ ...d, colors: { ...d.colors, ...patch } }));
  }
  function setTypography(patch: Partial<Theme["typography"]>) {
    setDraft((d) => ({ ...d, typography: { ...d.typography, ...patch } }));
  }
  function setGrid(patch: Partial<Theme["grid"]>) {
    setDraft((d) => ({ ...d, grid: { ...d.grid, ...patch } }));
  }
  function setSeparators(patch: Partial<Theme["separators"]>) {
    setDraft((d) => ({ ...d, separators: { ...d.separators, ...patch } }));
  }
  function setBar(patch: Partial<Theme["bar"]>) {
    setDraft((d) => ({ ...d, bar: { ...d.bar, ...patch } }));
  }
  function setPalette(palette: Record<string, string>) {
    setColors({ palette });
  }

  function handleSave() {
    onSave(draft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit theme</DialogTitle>
          <DialogDescription>
            Customize colors, fonts, grid, and bars. Saved themes are stored in
            this browser and can be exported to share.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Section title="General">
            <div className="space-y-1.5">
              <Label htmlFor="theme-name">Name</Label>
              <Input
                id="theme-name"
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
          </Section>

          <Section title="Colors">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <ColorField
                label="Background"
                value={draft.colors.background}
                onChange={(v) => setColors({ background: v })}
              />
              <ColorField
                label="Surface"
                value={draft.colors.surface}
                onChange={(v) => setColors({ surface: v })}
              />
              <ColorField
                label="Text"
                value={draft.colors.text}
                onChange={(v) => setColors({ text: v })}
              />
              <ColorField
                label="Muted text"
                value={draft.colors.textMuted}
                onChange={(v) => setColors({ textMuted: v })}
              />
              <ColorField
                label="Accent"
                value={draft.colors.accent}
                onChange={(v) => setColors({ accent: v })}
              />
              <ColorField
                label="Today marker"
                value={draft.colors.todayMarker}
                onChange={(v) => setColors({ todayMarker: v })}
              />
            </div>
          </Section>

          <Section title="Bar palette">
            <PaletteEditor
              palette={draft.colors.palette}
              onChange={setPalette}
            />
          </Section>

          <Section title="Typography">
            <div className="space-y-1.5">
              <Label htmlFor="font-family">Font family (CSS)</Label>
              <Input
                id="font-family"
                value={draft.typography.fontFamily}
                onChange={(e) => setTypography({ fontFamily: e.target.value })}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumberField
                label="Base size"
                value={draft.typography.fontSize}
                onChange={(v) => setTypography({ fontSize: v })}
              />
              <NumberField
                label="Header size"
                value={draft.typography.headerFontSize}
                onChange={(v) => setTypography({ headerFontSize: v })}
              />
              <NumberField
                label="Bar label size"
                value={draft.typography.barLabelFontSize}
                onChange={(v) => setTypography({ barLabelFontSize: v })}
              />
              <NumberField
                label="Weight"
                value={draft.typography.fontWeight}
                onChange={(v) => setTypography({ fontWeight: v })}
                step={100}
              />
            </div>
          </Section>

          <Section title="Grid & separators">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={draft.grid.show}
                  onCheckedChange={(v) => setGrid({ show: v === true })}
                />
                Show grid
              </Label>
              <ColorField
                label="Grid line"
                value={draft.grid.color}
                onChange={(v) => setGrid({ color: v })}
              />
              <ColorField
                label="Major line"
                value={draft.grid.majorColor ?? draft.grid.color}
                onChange={(v) => setGrid({ majorColor: v })}
              />
              <ColorField
                label="Row separator"
                value={draft.separators.rowColor}
                onChange={(v) => setSeparators({ rowColor: v })}
              />
              <ColorField
                label="Zebra (even)"
                value={draft.separators.zebra?.even ?? draft.colors.background}
                onChange={(v) =>
                  setSeparators({
                    zebra: {
                      even: v,
                      odd: draft.separators.zebra?.odd ?? draft.colors.surface,
                    },
                  })
                }
              />
              <ColorField
                label="Zebra (odd)"
                value={draft.separators.zebra?.odd ?? draft.colors.surface}
                onChange={(v) =>
                  setSeparators({
                    zebra: {
                      even:
                        draft.separators.zebra?.even ?? draft.colors.background,
                      odd: v,
                    },
                  })
                }
              />
            </div>
          </Section>

          <Section title="Bars">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumberField
                label="Height"
                value={draft.bar.height}
                onChange={(v) => setBar({ height: v })}
              />
              <NumberField
                label="Corner radius"
                value={draft.bar.cornerRadius}
                onChange={(v) => setBar({ cornerRadius: v })}
              />
              <NumberField
                label="Border width"
                value={draft.bar.borderWidth}
                onChange={(v) => setBar({ borderWidth: v })}
              />
              <NumberField
                label="Milestone size"
                value={draft.bar.milestoneSize}
                onChange={(v) => setBar({ milestoneSize: v })}
              />
              <ColorField
                label="Border color"
                value={draft.bar.borderColor}
                onChange={(v) => setBar({ borderColor: v })}
              />
            </div>
          </Section>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportTheme(draft)}>
              <Download className="size-4" /> Export
            </Button>
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(draft.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save theme</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={toHex(value)}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded border border-border bg-transparent"
          aria-label={label}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function PaletteEditor({
  palette,
  onChange,
}: {
  palette: Record<string, string>;
  onChange: (palette: Record<string, string>) => void;
}) {
  const entries = Object.entries(palette);

  function rename(oldKey: string, newKey: string) {
    if (!newKey || newKey === oldKey || palette[newKey] !== undefined) return;
    const next: Record<string, string> = {};
    for (const [k, v] of entries) next[k === oldKey ? newKey : k] = v;
    onChange(next);
  }
  function setValue(key: string, value: string) {
    onChange({ ...palette, [key]: value });
  }
  function remove(key: string) {
    const next = { ...palette };
    delete next[key];
    onChange(next);
  }
  function add() {
    let i = entries.length + 1;
    while (palette[`color${i}`] !== undefined) i++;
    onChange({ ...palette, [`color${i}`]: "#888888" });
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-2">
          <input
            type="color"
            value={toHex(value)}
            onChange={(e) => setValue(key, e.target.value)}
            className="size-8 shrink-0 cursor-pointer rounded border border-border bg-transparent"
            aria-label={`${key} color`}
          />
          <Input
            defaultValue={key}
            onBlur={(e) => rename(key, e.target.value.trim())}
            className="w-32"
            aria-label="Swatch name"
          />
          <Input
            value={value}
            onChange={(e) => setValue(key, e.target.value)}
            className="flex-1 font-mono text-xs"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => remove(key)}
            aria-label={`Remove ${key}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="size-4" /> Add swatch
      </Button>
    </div>
  );
}

/** Normalize a CSS color to a #rrggbb the native color input accepts. */
function toHex(color: string): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    const [r, g, b] = color.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#000000";
}

export { newId as newThemeId };
