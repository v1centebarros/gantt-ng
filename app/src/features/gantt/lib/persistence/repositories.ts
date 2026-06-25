import type { GanttFile, Theme } from "../../types";
import { BUILTIN_THEMES } from "../theme/builtins";
import { type DocumentRecord, db } from "./db";
import { migrateToLatest } from "./migrations";

/** Lightweight row for the document list view. */
export interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export const documentRepo = {
  async list(): Promise<DocumentSummary[]> {
    const records = await db.documents.orderBy("updatedAt").reverse().toArray();
    return records.map(({ id, title, updatedAt }) => ({
      id,
      title,
      updatedAt,
    }));
  },

  async get(id: string): Promise<GanttFile | undefined> {
    const record = await db.documents.get(id);
    if (!record) return undefined;
    // Always migrate on read so app code sees the latest shape.
    return migrateToLatest(record.file);
  },

  async put(file: GanttFile): Promise<GanttFile> {
    const stamped: GanttFile = {
      ...file,
      document: {
        ...file.document,
        meta: { ...file.document.meta, updatedAt: new Date().toISOString() },
      },
    };
    const record: DocumentRecord = {
      id: stamped.document.id,
      schemaVersion: stamped.schemaVersion,
      title: stamped.document.meta.title,
      updatedAt: stamped.document.meta.updatedAt,
      file: stamped,
    };
    await db.documents.put(record);
    return stamped;
  },

  async remove(id: string): Promise<void> {
    await db.documents.delete(id);
  },
};

export const themeRepo = {
  async list(): Promise<Theme[]> {
    const records = await db.themes.toArray();
    return records.map((r) => r.theme);
  },

  async put(theme: Theme): Promise<Theme> {
    await db.themes.put({
      id: theme.id,
      name: theme.name,
      builtin: theme.builtin ? 1 : 0,
      theme,
    });
    return theme;
  },

  async remove(id: string): Promise<void> {
    const record = await db.themes.get(id);
    if (record?.builtin) throw new Error("Builtin themes cannot be deleted.");
    await db.themes.delete(id);
  },

  /** Insert builtin themes once; safe to call on every app start. */
  async seedBuiltins(): Promise<void> {
    const count = await db.themes.count();
    if (count > 0) return;
    await db.themes.bulkPut(
      BUILTIN_THEMES.map((theme) => ({
        id: theme.id,
        name: theme.name,
        builtin: 1,
        theme,
      })),
    );
  },
};
