import { GANTT_SCHEMA_VERSION, type GanttFile } from "../../types";

/** Migrates a file from version N to N+1. */
type Migration = (file: GanttFile) => GanttFile;

/**
 * Linear migration chain keyed by the version being upgraded *from*. Add an
 * entry whenever GANTT_SCHEMA_VERSION is bumped.
 */
const migrations: Record<number, Migration> = {
  // 1: (file) => ({ ...file, schemaVersion: 2, document: upgradeV1toV2(file.document) }),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validate the envelope shape and reject foreign JSON. */
function sniff(raw: unknown): GanttFile {
  if (!isRecord(raw) || raw.kind !== "gantt-document") {
    throw new Error("Not a .gantt document.");
  }
  if (typeof raw.schemaVersion !== "number" || !isRecord(raw.document)) {
    throw new Error("Malformed .gantt document.");
  }
  return raw as unknown as GanttFile;
}

/** Run the migration chain until the file matches the current schema version. */
export function migrateToLatest(raw: unknown): GanttFile {
  let file = sniff(raw);
  let safety = 0;
  while (file.schemaVersion < GANTT_SCHEMA_VERSION && safety++ < 1000) {
    const migrate = migrations[file.schemaVersion];
    if (!migrate) {
      throw new Error(
        `No migration from schema version ${file.schemaVersion}.`,
      );
    }
    file = migrate(file);
  }
  if (file.schemaVersion > GANTT_SCHEMA_VERSION) {
    throw new Error(
      `File schema version ${file.schemaVersion} is newer than this app supports.`,
    );
  }
  if (!Array.isArray(file.themes)) file.themes = [];
  return file;
}
