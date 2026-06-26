"use client";

import { Plus, Trash2, ZoomIn, ZoomOut } from "lucide-react";
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
import type {
  DateMarker,
  DisplaySettings,
  StrokeStyle,
  Theme,
  TimescaleConfig,
} from "../../types";
import { DateField } from "./DateField";
import { ThemeControls } from "./ThemeControls";

interface GanttSettingsProps {
  timescale: TimescaleConfig;
  onTimescaleChange: (patch: Partial<TimescaleConfig>) => void;
  themes: Theme[];
  themeId: string;
  onThemeChange: (id: string) => void;
  theme: Theme;
  display: DisplaySettings;
  onDisplayChange: (patch: Partial<DisplaySettings>) => void;
  markers: DateMarker[];
  onAddMarker: () => void;
  onUpdateMarker: (id: string, patch: Partial<DateMarker>) => void;
  onDeleteMarker: (id: string) => void;
}

export function GanttSettings({
  timescale,
  onTimescaleChange,
  themes,
  themeId,
  onThemeChange,
  theme,
  display,
  onDisplayChange,
  markers,
  onAddMarker,
  onUpdateMarker,
  onDeleteMarker,
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
    <aside className="h-full w-full space-y-6 overflow-y-auto p-4">
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
            <DateField
              id="ts-start"
              value={timescale.start}
              onCommit={(v) => onTimescaleChange({ start: v })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ts-end">End</Label>
            <DateField
              id="ts-end"
              value={timescale.end}
              onCommit={(v) => onTimescaleChange({ end: v })}
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

      <Section title="Markers">
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={display.showTodayMarker}
            onCheckedChange={(v) =>
              onDisplayChange({ showTodayMarker: v === true })
            }
          />
          Show today marker
        </Label>

        <div className="mt-3 space-y-2">
          {markers.map((marker) => (
            <MarkerRow
              key={marker.id}
              marker={marker}
              theme={theme}
              onUpdate={(patch) => onUpdateMarker(marker.id, patch)}
              onDelete={() => onDeleteMarker(marker.id)}
            />
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onAddMarker}
          >
            <Plus className="size-4" /> Add marker
          </Button>
          <p className="text-xs text-muted-foreground">
            Tip: right-click the chart to add a marker at that date.
          </p>
        </div>
      </Section>

      <Section title="Legend">
        <Label className="flex items-center gap-2">
          <Checkbox
            checked={display.legend.show}
            onCheckedChange={(v) =>
              onDisplayChange({
                legend: { ...display.legend, show: v === true },
              })
            }
          />
          Show legend
        </Label>

        <div className="mt-3 space-y-1.5">
          <Label>Group by</Label>
          <Select
            value={display.legend.groupBy}
            onValueChange={(v) =>
              onDisplayChange({
                legend: { ...display.legend, groupBy: v as "label" | "color" },
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="label">Task name</SelectItem>
              <SelectItem value="color">Color</SelectItem>
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

const DEFAULT_MARKER_COLOR = "default";

function MarkerRow({
  marker,
  theme,
  onUpdate,
  onDelete,
}: {
  marker: DateMarker;
  theme: Theme;
  onUpdate: (patch: Partial<DateMarker>) => void;
  onDelete: () => void;
}) {
  const paletteKeys = Object.keys(theme.colors.palette);
  return (
    <div className="space-y-1.5 rounded-md border border-border p-2">
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={marker.date}
          onChange={(e) => onUpdate({ date: e.target.value })}
          className="flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Remove marker"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <Input
        value={marker.label ?? ""}
        placeholder="Label"
        onChange={(e) => onUpdate({ label: e.target.value })}
      />
      <Label className="flex items-center gap-2 font-normal">
        <Checkbox
          checked={marker.showLabel !== false}
          onCheckedChange={(v) => onUpdate({ showLabel: v === true })}
        />
        Show label on chart
      </Label>
      <Select
        value={marker.color ?? DEFAULT_MARKER_COLOR}
        onValueChange={(v) =>
          onUpdate({ color: v === DEFAULT_MARKER_COLOR ? undefined : v })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DEFAULT_MARKER_COLOR}>
            <span className="flex items-center gap-2">
              <span
                className="inline-block size-3 rounded-full"
                style={{ backgroundColor: theme.colors.accent }}
              />
              Default
            </span>
          </SelectItem>
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

      <div className="flex gap-2">
        <Select
          value={marker.strokeStyle ?? "solid"}
          onValueChange={(v) => onUpdate({ strokeStyle: v as StrokeStyle })}
        >
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          min={0.5}
          max={10}
          step="any"
          aria-label="Marker width"
          className="w-20"
          value={marker.strokeWidth ?? 2}
          onChange={(e) =>
            onUpdate({
              strokeWidth: Math.max(0.5, Math.min(10, Number(e.target.value))),
            })
          }
        />
      </div>
    </div>
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
