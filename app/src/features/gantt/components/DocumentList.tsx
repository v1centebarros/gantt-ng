"use client";

import { CalendarRange, FileUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCreateDocument,
  useDeleteDocument,
  useDocumentList,
  useImportDocument,
} from "../hooks/useDocuments";
import { importGanttFile } from "../lib/persistence/serialize";

export function DocumentList() {
  const router = useRouter();
  const { data: docs = [], isLoading } = useDocumentList();
  const create = useCreateDocument();
  const remove = useDeleteDocument();
  const importDoc = useImportDocument();
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleCreate() {
    const file = await create.mutateAsync(undefined);
    router.push(`/editor/${file.document.id}`);
  }

  async function handleImport(file: File) {
    const imported = await importGanttFile(file);
    await importDoc.mutateAsync(imported);
    router.push(`/editor/${imported.document.id}`);
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <input
        ref={fileInput}
        type="file"
        accept=".gantt,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImport(file);
          e.target.value = "";
        }}
      />

      <div className="mb-8 flex items-center gap-3">
        <CalendarRange className="size-7 text-primary" />
        <div>
          <h1 className="font-heading text-2xl font-bold">gantt-ng</h1>
          <p className="text-sm text-muted-foreground">
            Simple, local-first Gantt charts. Your data stays in this browser.
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => fileInput.current?.click()}>
            <FileUp className="size-4" /> Import
          </Button>
          <Button onClick={handleCreate} disabled={create.isPending}>
            <Plus className="size-4" /> New Gantt
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : docs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="mb-4 text-muted-foreground">No Gantt charts yet.</p>
          <Button onClick={handleCreate}>
            <Plus className="size-4" /> Create your first one
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {docs.map((doc) => (
            <li key={doc.id}>
              <Card className="group cursor-pointer py-4 transition-colors hover:border-primary">
                <CardHeader className="px-4">
                  <button
                    type="button"
                    className="min-w-0 text-left outline-none"
                    onClick={() => router.push(`/editor/${doc.id}`)}
                  >
                    <CardTitle className="truncate">{doc.title}</CardTitle>
                    <CardDescription>
                      {new Date(doc.updatedAt).toLocaleString()}
                    </CardDescription>
                  </button>
                  <CardAction>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete document"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => remove.mutate(doc.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </CardAction>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
