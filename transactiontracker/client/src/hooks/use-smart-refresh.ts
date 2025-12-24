import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';

/**
 * Hook intelligent de rafraîchissement automatique
 * Système de synchronisation en temps réel qui :
 * - Écoute les événements WebSocket
 * - Rafraîchit automatiquement les données concernées
 * - Évite les rafraîchissements intrusifs
 */
export function useSmartRefresh() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fonction pour invalider les queries utilisateur
  const refreshUserData = useCallback(() => {
    console.log('🔄 [SMART REFRESH] Refreshing user data...');
    queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/stats/user'] });
    queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/can-send'] });
    queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    
    // Forcer le refetch immédiat pour réactualisation rapide
    queryClient.refetchQueries({ queryKey: ['/api/transactions'] });
    queryClient.refetchQueries({ queryKey: ['/api/stats/user'] });
  }, [queryClient]);

  // Fonction pour invalider les queries admin
  const refreshAdminData = useCallback(() => {
    console.log('🔄 [SMART REFRESH] Refreshing admin data...');
    queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
    queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
    queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    
    // Forcer le refetch immédiat pour réactualisation rapide
    queryClient.refetchQueries({ queryKey: ['/api/transactions/pending'] });
    queryClient.refetchQueries({ queryKey: ['/api/stats/daily'] });
  }, [queryClient]);

  // Fonction pour rafraîchir les données communes
  const refreshCommonData = useCallback(() => {
    console.log('🔄 [SMART REFRESH] Refreshing common data...');
    queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
    
    // Forcer le refetch immédiat pour réactualisation rapide
    queryClient.refetchQueries({ queryKey: ['/api/clients'] });
    queryClient.refetchQueries({ queryKey: ['/api/system/settings'] });
  }, [queryClient]);

  // Fonction pour rafraîchissement complet
  const refreshAll = useCallback(() => {
    console.log('🔄 [SMART REFRESH] Full refresh triggered');
    refreshUserData();
    refreshCommonData();
    if (user?.role === 'admin') {
      refreshAdminData();
    }
  }, [refreshUserData, refreshCommonData, refreshAdminData, user?.role]);

  useEffect(() => {
    if (!user) return;

    // Écouter les événements WebSocket spécifiques
    const handleTransactionCreated = () => {
      console.log('🔄 [SMART REFRESH] Transaction created detected');
      refreshUserData();
      if (user.role === 'admin') {
        refreshAdminData();
      }
    };

    const handleTransactionDeleted = () => {
      console.log('🔄 [SMART REFRESH] Transaction deleted detected');
      refreshUserData();
      if (user.role === 'admin') {
        refreshAdminData();
      }
    };

    const handleTransactionValidated = () => {
      console.log('🔄 [SMART REFRESH] Transaction validated detected');
      refreshUserData();
      if (user.role === 'admin') {
        refreshAdminData();
      }
    };

    const handleBalanceUpdated = () => {
      console.log('🔄 [SMART REFRESH] Balance updated detected');
      refreshUserData();
      if (user.role === 'admin') {
        refreshAdminData();
      }
    };

    const handleForceRefresh = () => {
      console.log('🔄 [SMART REFRESH] Force refresh detected');
      refreshAll();
    };

    // Écouter les événements WebSocket
    window.addEventListener('websocket-transaction-created', handleTransactionCreated);
    window.addEventListener('websocket-transaction-deleted', handleTransactionDeleted);
    window.addEventListener('websocket-transaction-validated', handleTransactionValidated);
    window.addEventListener('websocket-balance-updated', handleBalanceUpdated);
    window.addEventListener('websocket-force-refresh', handleForceRefresh);

    // Écouter les événements globaux d'actualisation
    window.addEventListener('transaction-deleted', handleTransactionDeleted);
    window.addEventListener('force-refresh', handleForceRefresh);

    // Rafraîchissement périodique optimisé pour connexions 3G lentes
    const interval = setInterval(() => {
      refreshUserData();
      refreshCommonData();
    }, user.role === 'admin' ? 180000 : 300000); // 3 minutes pour admin, 5 minutes pour user

    // Rafraîchissement au focus de fenêtre
    const handleFocus = () => {
      refreshAll();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      // Nettoyer les listeners
      window.removeEventListener('websocket-transaction-created', handleTransactionCreated);
      window.removeEventListener('websocket-transaction-deleted', handleTransactionDeleted);
      window.removeEventListener('websocket-transaction-validated', handleTransactionValidated);
      window.removeEventListener('websocket-balance-updated', handleBalanceUpdated);
      window.removeEventListener('websocket-force-refresh', handleForceRefresh);
      window.removeEventListener('transaction-deleted', handleTransactionDeleted);
      window.removeEventListener('force-refresh', handleForceRefresh);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [user, refreshAll, refreshUserData, refreshCommonData, refreshAdminData]);

  return {
    refreshUserData,
    refreshAdminData,
    refreshCommonData,
    refreshAll
  };
}