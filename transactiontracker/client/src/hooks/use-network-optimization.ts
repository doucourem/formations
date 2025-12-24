import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface NetworkInfo {
  isOnline: boolean;
  connectionType: string;
  isSlowConnection: boolean;
  effectiveType?: string;
}

export function useNetworkOptimization() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    isSlowConnection: false,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      const effectiveType = connection?.effectiveType || 'unknown';
      const isSlowConnection = ['slow-2g', '2g', '3g'].includes(effectiveType) || 
                               (connection?.downlink && connection.downlink < 1.5);

      setNetworkInfo({
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        isSlowConnection,
        effectiveType,
      });

      // Ajuster les stratégies de cache pour connexions lentes (optimisation silencieuse)
      if (isSlowConnection) {
        // Augmenter les temps de cache pour connexions lentes
        queryClient.setDefaultOptions({
          queries: {
            staleTime: 600000, // 10 minutes pour connexions lentes
            gcTime: 1800000, // 30 minutes
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        });
      }
    };

    updateNetworkInfo();

    const handleOnline = () => {
      console.log('🌐 [NETWORK] Connexion rétablie');
      setNetworkInfo(prev => ({ ...prev, isOnline: true }));
      // Rafraîchir les données critiques quand la connexion revient
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
    };

    const handleOffline = () => {
      console.log('🌐 [NETWORK] Connexion perdue');
      setNetworkInfo(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouter les changements de connexion si supporté
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, [queryClient]);

  return networkInfo;
}

// Hook pour adapter les requêtes selon la qualité réseau
export function useAdaptiveQuery(baseRefetchInterval: number) {
  const { isSlowConnection, isOnline } = useNetworkOptimization();

  if (!isOnline) {
    return false; // Pas de requêtes hors ligne
  }

  if (isSlowConnection) {
    return Math.max(baseRefetchInterval * 3, 300000); // Triple l'intervalle, minimum 5 min
  }

  return baseRefetchInterval;
}