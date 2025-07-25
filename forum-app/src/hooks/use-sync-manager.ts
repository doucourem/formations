import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

/**
 * Gestionnaire de synchronisation ultra-simple
 * Force le rechargement complet de la page après toute suppression
 */
export function useSyncManager() {
  useEffect(() => {
    // Gestionnaire universel pour toutes les suppressions
    const handleDeletion = () => {
      console.log('🔄 [SYNC MANAGER] Suppression détectée - invalidation des queries');
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      queryClient.refetchQueries({ queryKey: ["/api/transactions"] });
    };

    // Écouter tous les événements de suppression possibles
    window.addEventListener('transaction-deleted-by-admin', handleDeletion);
    window.addEventListener('transaction-deleted-by-user', handleDeletion);
    window.addEventListener('transaction-deleted', handleDeletion);
    window.addEventListener('force-refresh', handleDeletion);

    // Écouter les WebSocket messages de suppression
    const handleWebSocketMessage = (event: any) => {
      if (event.detail && (
        event.detail.type === 'TRANSACTION_DELETED' || 
        event.detail.type === 'TRANSACTION_DELETED_BY_ADMIN' ||
        event.detail.action === 'transaction-deleted'
      )) {
        console.log('🔄 [SYNC MANAGER] WebSocket suppression détectée - rechargement immédiat');
        // Invalider les queries pour rafraîchir les données sans recharger la page
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
        queryClient.refetchQueries({ queryKey: ["/api/transactions"] });
      }
    };

    window.addEventListener('websocket-message', handleWebSocketMessage);

    return () => {
      window.removeEventListener('transaction-deleted-by-admin', handleDeletion);
      window.removeEventListener('transaction-deleted-by-user', handleDeletion);
      window.removeEventListener('transaction-deleted', handleDeletion);
      window.removeEventListener('force-refresh', handleDeletion);
      window.removeEventListener('websocket-message', handleWebSocketMessage);
    };
  }, []);
}