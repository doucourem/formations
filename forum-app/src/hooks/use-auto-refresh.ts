import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';

// Auto-refresh hook pour mettre à jour toutes les données automatiquement
export function useAutoRefresh() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Fonction pour invalider toutes les requêtes importantes
    const refreshAllData = () => {
      // Invalider toutes les données de base
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
      
      if (user.role === 'admin') {
        // Données spécifiques admin
        queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
        queryClient.invalidateQueries({ queryKey: ['/api/users'] });
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      }
    };

    // Rafraîchissement immédiat au focus de la fenêtre
    const handleFocus = () => {
      refreshAllData();
    };

    // Rafraîchissement périodique très réduit - WebSocket s'occupe des mises à jour temps réel
    const interval = setInterval(refreshAllData, user.role === 'admin' ? 5 * 60 * 1000 : 10 * 60 * 1000);

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, queryClient]);

  // Fonction pour forcer un rafraîchissement immédiat intelligent
  const forceRefresh = () => {
    console.log('🔄 [FORCE REFRESH] Début du rafraîchissement complet...');
    
    // Vider le cache complet
    queryClient.clear();
    
    // Invalider toutes les queries avec refetch immédiat
    const refreshPromises = [
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/clients'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/stats/user'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/system/settings'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/user/can-send'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'], refetchType: 'all' })
    ];

    if (user?.role === 'admin') {
      refreshPromises.push(
        queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['/api/users'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['/api/transactions/validated'], refetchType: 'all' })
      );
    }

    // Attendre que toutes les invalidations soient terminées
    Promise.allSettled(refreshPromises).then(() => {
      console.log('✅ [FORCE REFRESH] Rafraîchissement terminé');
    });
  };

  return { forceRefresh };
}