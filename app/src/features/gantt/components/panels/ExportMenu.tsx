"use client";

import { Download, FileDown, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExportFormat } from "../../lib/export/exporters";

interface ExportMenuProps {
  onExportImage: (format: ExportFormat) => void | Promise<void>;
  onExportGantt: () => void;
  onImportGantt: (file: File) => void;
}

export function ExportMenu({
  onExportImage,
  onExportGantt,
  onImportGantt,
}: ExportMenuProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<ExportFormat | null>(null);

  async function run(format: ExportFormat) {
    setBusy(format);
    try {
      await onExportImage(format);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <input
        ref={fileInput}
        type="file"
        accept=".gantt,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onImportGantt(file);
          e.target.value = "";
        }}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={busy != null}>
            <Download className="size-4" /> Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Image</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => run("svg")}>
            SVG (vector)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run("png")}>PNG</DropdownMenuItem>
          <DropdownMenuItem onClick={() => run("jpeg")}>JPEG</DropdownMenuItem>
          <DropdownMenuItem onClick={() => run("pdf")}>PDF</DropdownMenuItem>
          <DropdownMenuLabel>Document</DropdownMenuLabel>
          <DropdownMenuItem onClick={onExportGantt}>
            <FileDown className="size-4" /> Export .gantt
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInput.current?.click()}>
            <Upload className="size-4" /> Import .gantt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
