import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false, // Disable automatic polling
      refetchOnWindowFocus: false, // Only refresh on user action
      refetchOnMount: "always",
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes fresh data
      gcTime: 10 * 60 * 1000, // 10 minutes cache retention
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      onSettled: () => {
        // Selective invalidation instead of clearing all cache
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            predicate: (query) => {
              const key = query.queryKey[0] as string;
              return key.includes('/api/transactions') || 
                     key.includes('/api/stats') || 
                     key.includes('/api/clients');
            }
          });
        }, 100);
      },
    },
  },
});
