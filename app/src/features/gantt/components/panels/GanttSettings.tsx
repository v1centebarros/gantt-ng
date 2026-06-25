"use client";

import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GANTT_DEFAULTS } from "../../constants";
import { useAnimationsSetting } from "../../hooks/useAnimationsSetting";
import {
  GRANULARITY_PRESETS,
  type Granularity,
} from "../../lib/timescale/presets";
import type { Theme, TimescaleConfig } from "../../types";
import { ThemeControls } from "./ThemeControls";

interface GanttSettingsProps {
  timescale: TimescaleConfig;
  onTimescaleChange: (patch: Partial<TimescaleConfig>) => void;
  themes: Theme[];
  themeId: string;
  onThemeChange: (id: string) => void;
}

export function GanttSettings({
  timescale,
  onTimescaleChange,
  themes,
  themeId,
  onThemeChange,
}: GanttSettingsProps) {
  const [animationsEnabled, setAnimationsEnabled] = useAnimationsSetting();
  const granularity = timescale.secondaryUnit.type as Granularity;
  const customSpan =
    timescale.secondaryUnit.type === "custom"
      ? timescale.secondaryUnit.spanDays
      : 10;

  function setGranularity(g: Granularity) {
    const preset = GRANULARITY_PRESETS[g];
    onTimescaleChange({
      secondaryUnit: preset.secondary,
      primaryUnit: preset.primary,
      pixelsPerDay: preset.pixelsPerDay,
    });
  }

  function setZoom(factor: number) {
    const next = Math.round(
      Math.max(
        GANTT_DEFAULTS.minPixelsPerDay,
        Math.min(
          GANTT_DEFAULTS.maxPixelsPerDay,
          timescale.pixelsPerDay * factor,
        ),
      ),
    );
    onTimescaleChange({ pixelsPerDay: next });
  }

  return (
    <aside className="w-72 shrink-0 space-y-6 overflow-y-auto border-l border-border p-4">
      <div>
        <h2 className="text-sm font-semibold">Gantt settings</h2>
        <p className="text-xs text-muted-foreground">
          Applies to the whole chart. Select a bar to edit it instead.
        </p>
      </div>

      <Section title="Theme">
        <ThemeControls
          themes={themes}
          value={themeId}
          onChange={onThemeChange}
        />
      </Section>

      <Section title="Time span">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="ts-start">Start</Label>
            <Input
              id="ts-start"
              type="date"
              value={timescale.start}
              onChange={(e) => onTimescaleChange({ start: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ts-end">End</Label>
            <Input
              id="ts-end"
              type="date"
              value={timescale.end}
              onChange={(e) => onTimescaleChange({ end: e.target.value })}
            />
          </div>
        </div>
      </Section>

      <Section title="Scale">
        <div className="space-y-1.5">
          <Label>Separate by</Label>
          <Select
            value={granularity}
            onValueChange={(v) => setGranularity(v as Granularity)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(GRANULARITY_PRESETS) as Granularity[]).map((g) => (
                <SelectItem key={g} value={g}>
                  {GRANULARITY_PRESETS[g].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {granularity === "custom" && (
          <div className="mt-2 space-y-1.5">
            <Label htmlFor="ts-span">Span (days)</Label>
            <Input
              id="ts-span"
              type="number"
              min={1}
              value={customSpan}
              onChange={(e) =>
                onTimescaleChange({
                  secondaryUnit: {
                    type: "custom",
                    spanDays: Math.max(1, Number(e.target.value)),
                  },
                })
              }
            />
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <Label>Zoom</Label>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(0.8)}
              aria-label="Zoom out"
            >
              <ZoomOut className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(1.25)}
              aria-label="Zoom in"
            >
              <ZoomIn className="size-4" />
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Date labels">
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={timescale.showSecondaryLabels !== false}
            onCheckedChange={(v) =>
              onTimescaleChange({ showSecondaryLabels: v === true })
            }
          />
          Show dates
        </Label>

        <div className="mt-3 space-y-1.5">
          <Label>Month format</Label>
          <Select
            value={timescale.monthLabelStyle ?? "name"}
            onValueChange={(v) =>
              onTimescaleChange({ monthLabelStyle: v as "name" | "number" })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (Jun 2026)</SelectItem>
              <SelectItem value="number">Number (06/2026)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Preferences">
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={animationsEnabled}
            onCheckedChange={(v) => setAnimationsEnabled(v === true)}
          />
          Enable animations
        </Label>
        <p className="text-xs text-muted-foreground">
          Applies to this browser. Turns off page and UI transitions.
        </p>
      </Section>
    </aside>
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
