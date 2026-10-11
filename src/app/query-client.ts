import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      gcTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 404/aborted
        if (error.name === 'AbortError') return false;
        return failureCount < 1;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
