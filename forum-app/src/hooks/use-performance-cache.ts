import { useQuery } from "@tanstack/react-query";



// Configurations optimisées pour différents types de données
export const CACHE_CONFIGS = {
  // Données critiques en temps réel (transactions en attente)
  CRITICAL: {
    staleTime: 15000, // 15s
    gcTime: 60000, // 1 min
    refetchInterval: 30000, // 30s
    refetchOnWindowFocus: false,
  },
  
  // Données importantes mais moins fréquentes (toutes transactions)
  IMPORTANT: {
    staleTime: 60000, // 1 min
    gcTime: 300000, // 5 min
    refetchInterval: 120000, // 2 min
    refetchOnWindowFocus: false,
  },
  
  // Données statistiques (badges, compteurs)
  STATS: {
    staleTime: 120000, // 2 min
    gcTime: 600000, // 10 min
    refetchInterval: 300000, // 5 min
    refetchOnWindowFocus: false,
  },
  
  // Données quasi-statiques (utilisateurs, clients, paramètres)
  STATIC: {
    staleTime: 600000, // 10 min
    gcTime: 1800000, // 30 min
    refetchInterval: false,
    refetchOnWindowFocus: false,
  }
} as const;

export function useOptimizedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  cacheType: keyof typeof CACHE_CONFIGS,
  additionalOptions: any = {}
) {
  const config = CACHE_CONFIGS[cacheType];
  
  return useQuery({
    queryKey,
    queryFn,
    ...config,
    ...additionalOptions,
    retry: 1,
    retryDelay: 2000,
  });
}