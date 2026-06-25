"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDocument, createFile } from "../lib/factory";
import { qk } from "../lib/persistence/queryKeys";
import {
  type DocumentSummary,
  documentRepo,
} from "../lib/persistence/repositories";
import type { GanttFile } from "../types";

export function useDocumentList() {
  return useQuery<DocumentSummary[]>({
    queryKey: qk.documents,
    queryFn: () => documentRepo.list(),
  });
}

export function useDocument(id: string | undefined) {
  return useQuery<GanttFile | undefined>({
    queryKey: id ? qk.document(id) : qk.document("none"),
    queryFn: () => documentRepo.get(id as string),
    enabled: !!id,
  });
}

/** Save a whole file. Optimistically updates the cache for instant UI. */
export function useSaveDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: GanttFile) => documentRepo.put(file),
    onMutate: async (file) => {
      const key = qk.document(file.document.id);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<GanttFile>(key);
      qc.setQueryData(key, file);
      return { previous, key };
    },
    onError: (_err, _file, ctx) => {
      if (ctx) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSettled: (_data, _err, file) => {
      qc.invalidateQueries({ queryKey: qk.document(file.document.id) });
      qc.invalidateQueries({ queryKey: qk.documents });
    },
  });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title?: string) => {
      const file = createFile(createDocument(title));
      return documentRepo.put(file);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.documents });
    },
  });
}

/** Persist an imported file under its existing id. */
export function useImportDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: GanttFile) => documentRepo.put(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.documents });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentRepo.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.documents });
    },
  });
}
