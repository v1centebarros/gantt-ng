"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDocument } from "../hooks/useDocuments";
import { EditorSkeleton } from "./EditorSkeleton";
import { GanttEditor } from "./GanttEditor";

export function EditorLoader() {
  const docId = useSearchParams().get("doc") ?? "";
  const { data, isLoading } = useDocument(docId);

  if (isLoading) {
    return <EditorSkeleton />;
  }

  if (!data) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          This document could not be found.
        </p>
        <Button asChild>
          <Link href="/">Back to documents</Link>
        </Button>
      </div>
    );
  }

  // key resets editor state when switching documents.
  return <GanttEditor key={docId} initialFile={data} />;
}
