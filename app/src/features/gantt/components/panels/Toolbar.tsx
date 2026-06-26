"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  PanelRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { ExportFormat } from "../../lib/export/exporters";
import { EditableTitle } from "./EditableTitle";
import { ExportMenu } from "./ExportMenu";

interface ToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onAddRow: () => void;
  onAddTask: () => void;
  onExportImage: (format: ExportFormat) => void | Promise<void>;
  onExportGantt: () => void;
  onImportGantt: (file: File) => void;
  isSaving: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Toolbar({
  title,
  onTitleChange,
  onAddRow,
  onAddTask,
  onExportImage,
  onExportGantt,
  onImportGantt,
  isSaving,
  sidebarCollapsed,
  onToggleSidebar,
}: ToolbarProps) {
  return (
    <header className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
      <Button
        asChild
        variant="ghost"
        size="icon"
        aria-label="Back to documents"
      >
        <Link href="/">
          <ArrowLeft className="size-4" />
        </Link>
      </Button>
      <EditableTitle
        value={title}
        onCommit={onTitleChange}
        placeholder="Untitled Gantt"
      />
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {isSaving ? (
          <>
            <Loader2 className="size-3 animate-spin" /> Saving
          </>
        ) : (
          <>
            <Check className="size-3" /> Saved
          </>
        )}
      </span>

      <Separator orientation="vertical" className="mx-1 h-6" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Plus className="size-4" /> Add
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onAddTask}>New task</DropdownMenuItem>
          <DropdownMenuItem onClick={onAddRow}>New row</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        <ExportMenu
          onExportImage={onExportImage}
          onExportGantt={onExportGantt}
          onImportGantt={onImportGantt}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? "Show side panel" : "Hide side panel"}
          aria-pressed={!sidebarCollapsed}
        >
          <PanelRight className="size-4" />
        </Button>
      </div>
    </header>
  );
}
