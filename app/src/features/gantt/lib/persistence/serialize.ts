import type { GanttFile, Theme } from "../../types";
import { migrateToLatest } from "./migrations";

/** Trigger a browser download of arbitrary text content. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the click has consumed the URL.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function safeFilename(title: string, ext: string): string {
  const base = title
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "gantt"}.${ext}`;
}

/**
 * Export a document as a portable `.gantt` file. Embeds the document's
 * non-builtin themes so the recipient can render it faithfully.
 */
export function exportGanttFile(file: GanttFile, allThemes: Theme[]): void {
  const referenced = new Set<string>([file.document.themeId]);
  for (const row of file.document.rows) {
    if (row.themeId) referenced.add(row.themeId);
    for (const bar of row.bars) if (bar.themeId) referenced.add(bar.themeId);
  }
  const embedded = allThemes.filter((t) => referenced.has(t.id) && !t.builtin);
  const out: GanttFile = { ...file, themes: embedded };
  const blob = new Blob([JSON.stringify(out, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, safeFilename(file.document.meta.title, "gantt"));
}

/** Parse and migrate a `.gantt` file selected by the user. */
export async function importGanttFile(file: File): Promise<GanttFile> {
  const text = await file.text();
  const raw = JSON.parse(text);
  return migrateToLatest(raw);
}
