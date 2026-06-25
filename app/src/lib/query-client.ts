import { QueryClient } from "@tanstack/react-query";

/**
 * One QueryClient per browser session. There is no remote server — react-query
 * is used purely as the async cache over IndexedDB, so background refetching is
 * disabled and freshness is driven by explicit invalidation after mutations.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });
}
