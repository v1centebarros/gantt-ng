import { Skeleton } from "@/components/ui/skeleton";
import { GANTT_DEFAULTS } from "../constants";

const HEADER_H = 52;
const ROW_H = 40;

// Static placeholder bar geometry (width + left offset per row).
const BARS = [
  { id: "r1", w: "38%", ml: "2%" },
  { id: "r2", w: "55%", ml: "10%" },
  { id: "r3", w: "30%", ml: "25%" },
  { id: "r4", w: "48%", ml: "5%" },
  { id: "r5", w: "60%", ml: "18%" },
];

/** Chart-shaped loading placeholder shown while the document loads from IndexedDB. */
export function EditorSkeleton() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-7 w-48 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="ml-auto h-9 w-24 rounded-full" />
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1">
          {/* gutter */}
          <div
            className="shrink-0 border-r border-border"
            style={{ width: GANTT_DEFAULTS.gutterWidth }}
          >
            <div
              className="border-b border-border"
              style={{ height: HEADER_H }}
            />
            {BARS.map((row) => (
              <div
                key={row.id}
                className="flex items-center gap-2 border-b border-border px-3"
                style={{ height: ROW_H }}
              >
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            ))}
          </div>

          {/* timeline */}
          <div className="min-w-0 flex-1">
            <div
              className="border-b border-border"
              style={{ height: HEADER_H }}
            />
            {BARS.map((row) => (
              <div
                key={row.id}
                className="flex items-center border-b border-border px-4"
                style={{ height: ROW_H }}
              >
                <Skeleton
                  className="h-5 rounded-md"
                  style={{ width: row.w, marginLeft: row.ml }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* settings panel */}
        <div className="w-72 shrink-0 space-y-4 border-l border-border p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
