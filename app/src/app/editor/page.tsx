import { Suspense } from "react";
import { EditorLoader } from "@/features/gantt/components/EditorLoader";
import { EditorSkeleton } from "@/features/gantt/components/EditorSkeleton";

// Query-param routing (`/editor?doc=<id>`) keeps this a single static page,
// so refreshes/direct loads work on static hosts without a server.
export default function EditorPage() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditorLoader />
    </Suspense>
  );
}
