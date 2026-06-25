"use client";

import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GANTT_DEFAULTS } from "../../constants";
import type { TimescaleConfig, TimeUnit } from "../../types";

interface TimescaleControlsProps {
  timescale: TimescaleConfig;
  onChange: (patch: Partial<TimescaleConfig>) => void;
}

type Granularity = "day" | "week" | "month" | "quarter" | "custom";

/** Each granularity preset pairs a secondary cadence with a sensible header tier. */
const PRESETS: Record<
  Granularity,
  { secondary: TimeUnit; primary: TimeUnit; pixelsPerDay: number }
> = {
  day: {
    secondary: { type: "day" },
    primary: { type: "month" },
    pixelsPerDay: 32,
  },
  week: {
    secondary: { type: "week" },
    primary: { type: "month" },
    pixelsPerDay: 12,
  },
  month: {
    secondary: { type: "month" },
    primary: { type: "year" },
    pixelsPerDay: 4,
  },
  quarter: {
    secondary: { type: "quarter" },
    primary: { type: "year" },
    pixelsPerDay: 2,
  },
  custom: {
    secondary: { type: "custom", spanDays: 10 },
    primary: { type: "month" },
    pixelsPerDay: 16,
  },
};

export function TimescaleControls({
  timescale,
  onChange,
}: TimescaleControlsProps) {
  const granularity = timescale.secondaryUnit.type as Granularity;
  const customSpan =
    timescale.secondaryUnit.type === "custom"
      ? timescale.secondaryUnit.spanDays
      : 10;

  function setGranularity(g: Granularity) {
    const preset = PRESETS[g];
    onChange({
      secondaryUnit: preset.secondary,
      primaryUnit: preset.primary,
      pixelsPerDay: preset.pixelsPerDay,
    });
  }

  function setZoom(delta: number) {
    const next = Math.round(
      Math.max(
        GANTT_DEFAULTS.minPixelsPerDay,
        Math.min(
          GANTT_DEFAULTS.maxPixelsPerDay,
          timescale.pixelsPerDay * delta,
        ),
      ),
    );
    onChange({ pixelsPerDay: next });
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={granularity}
        onValueChange={(v) => setGranularity(v as Granularity)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Days</SelectItem>
          <SelectItem value="week">Weeks</SelectItem>
          <SelectItem value="month">Months</SelectItem>
          <SelectItem value="quarter">Quarters</SelectItem>
          <SelectItem value="custom">Custom span</SelectItem>
        </SelectContent>
      </Select>

      {granularity === "custom" && (
        <Input
          type="number"
          min={1}
          className="w-20"
          value={customSpan}
          aria-label="Custom span days"
          onChange={(e) =>
            onChange({
              secondaryUnit: {
                type: "custom",
                spanDays: Math.max(1, Number(e.target.value)),
              },
            })
          }
        />
      )}

      <Input
        type="date"
        className="w-36"
        value={timescale.start}
        aria-label="Window start"
        onChange={(e) => onChange({ start: e.target.value })}
      />
      <span className="text-muted-foreground">→</span>
      <Input
        type="date"
        className="w-36"
        value={timescale.end}
        aria-label="Window end"
        onChange={(e) => onChange({ end: e.target.value })}
      />

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
  );
}
