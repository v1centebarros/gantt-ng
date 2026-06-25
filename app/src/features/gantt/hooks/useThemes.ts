"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { qk } from "../lib/persistence/queryKeys";
import { themeRepo } from "../lib/persistence/repositories";
import type { Theme } from "../types";

/** Loads themes, seeding builtins on first run. */
export function useThemes() {
  const qc = useQueryClient();
  const query = useQuery<Theme[]>({
    queryKey: qk.themes,
    queryFn: async () => {
      await themeRepo.seedBuiltins();
      return themeRepo.list();
    },
  });

  // Keep the cache fresh if seeding happened mid-session elsewhere.
  useEffect(() => {
    if (query.data && query.data.length === 0) {
      qc.invalidateQueries({ queryKey: qk.themes });
    }
  }, [query.data, qc]);

  return query;
}

export function useSaveTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (theme: Theme) => themeRepo.put(theme),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.themes }),
  });
}

export function useDeleteTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => themeRepo.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.themes }),
  });
}
