import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Client errors (4xx) won't fix themselves; only retry network/server failures.
      retry: (failureCount, error) => (error?.status === 0 || error?.status >= 500) && failureCount < 2,
    },
    mutations: { retry: false },
  },
});
