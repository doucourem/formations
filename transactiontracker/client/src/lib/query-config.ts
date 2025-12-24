// Global query configuration to disable auto-refresh for Chrome stability
export const STABLE_QUERY_CONFIG = {
  refetchInterval: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: 30000, // Consider data fresh for 30 seconds
};

export const MINIMAL_REFRESH_CONFIG = {
  refetchInterval: 120000, // Only refresh every 2 minutes if needed
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  staleTime: 60000,
};