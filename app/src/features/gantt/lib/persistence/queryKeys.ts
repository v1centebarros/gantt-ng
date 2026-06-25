/** Centralized react-query keys for the gantt feature. */
export const qk = {
  documents: ["documents"] as const,
  document: (id: string) => ["documents", id] as const,
  themes: ["themes"] as const,
};
