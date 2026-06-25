import type { Theme } from "../../types";
import { newId } from "../factory";

/** Portable theme file envelope (.gtheme), versioned independently of documents. */
export interface ThemeFile {
  kind: "gantt-theme";
  version: number;
  theme: Theme;
}

const THEME_FILE_VERSION = 1;

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function safeName(name: string): string {
  return (
    name
      .trim()
      .replace(/[^\w.-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "theme"
  );
}

export function exportTheme(theme: Theme): void {
  const file: ThemeFile = {
    kind: "gantt-theme",
    version: THEME_FILE_VERSION,
    theme: { ...theme, builtin: false },
  };
  downloadBlob(
    new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }),
    `${safeName(theme.name)}.gtheme`,
  );
}

/** Parse a .gtheme file, assigning a fresh id so imports never clobber existing themes. */
export async function importTheme(file: File): Promise<Theme> {
  const raw = JSON.parse(await file.text());
  if (raw?.kind !== "gantt-theme" || typeof raw.theme !== "object") {
    throw new Error("Not a .gtheme file.");
  }
  const theme = raw.theme as Theme;
  return { ...theme, id: newId(), builtin: false };
}
