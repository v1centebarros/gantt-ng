import Dexie, { type EntityTable } from "dexie";
import type { GanttFile, Theme } from "../../types";

/** One stored document: the full envelope plus denormalized list columns. */
export interface DocumentRecord {
  id: string;
  /** Mirrors file.schemaVersion for diagnostics/indexing. */
  schemaVersion: number;
  title: string;
  updatedAt: string;
  file: GanttFile;
}

export interface ThemeRecord {
  id: string;
  name: string;
  /** Booleans aren't indexable in IndexedDB; store 0/1. */
  builtin: number;
  theme: Theme;
}

export interface AppMetaRecord {
  key: string;
  value: unknown;
}

export const db = new Dexie("gantt-ng") as Dexie & {
  documents: EntityTable<DocumentRecord, "id">;
  themes: EntityTable<ThemeRecord, "id">;
  appMeta: EntityTable<AppMetaRecord, "key">;
};

// db.version() = IndexedDB index shape. Bump only when indexes change.
// Content shape is versioned separately via file.schemaVersion + migrations.
db.version(1).stores({
  documents: "id, title, updatedAt",
  themes: "id, name, builtin",
  appMeta: "key",
});
