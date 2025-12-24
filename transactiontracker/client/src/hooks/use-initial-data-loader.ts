import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/auth';

/**
 * Hook pour forcer le chargement des données critiques au démarrage de l'application admin
 */
export function useInitialDataLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadInitialData = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        setIsLoading(false);
        return;
      }

      // Wait a bit for session to establish properly
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔄 [INITIAL LOADER] Starting admin data preload...');
      setIsLoading(true);

      try {
        // Force load all critical admin data
        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: ["/api/stats/daily"],
            queryFn: async () => {
              const response = await fetch('/api/stats/daily', { 
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              });
              if (!response.ok) throw new Error(`API Error: ${response.status}`);
              return response.json();
            },
            staleTime: 0
          }),
          queryClient.prefetchQuery({
            queryKey: ["/api/stats/users"],
            queryFn: async () => {
              const response = await fetch('/api/stats/users', { 
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              });
              if (!response.ok) throw new Error(`API Error: ${response.status}`);
              return response.json();
            },
            staleTime: 0
          }),
          queryClient.prefetchQuery({
            queryKey: ["/api/stats/pending-count"],
            queryFn: async () => {
              const response = await fetch('/api/stats/pending-count', { 
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
              });
              if (!response.ok) throw new Error(`API Error: ${response.status}`);
              return response.json();
            },
            staleTime: 0
          })
        ]);

        console.log('✅ [INITIAL LOADER] Admin data preload completed');
        setIsLoading(false);
        setRetryCount(0);
      } catch (error) {
        console.error('❌ [INITIAL LOADER] Preload failed:', error);
        
        // Retry up to 3 times with increasing delays
        if (retryCount < 3) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          console.log(`🔄 [INITIAL LOADER] Retry ${retryCount + 1}/3 in ${delay}ms`);
          
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        } else {
          console.error('❌ [INITIAL LOADER] Max retries reached, giving up');
          setIsLoading(false);
        }
      }
    };

    loadInitialData();
  }, [queryClient, retryCount]);

  return { isLoading, retryCount };
}