import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hook pour rafraîchissement automatique global de tous les onglets
export const useAutoRefresh = (userRole?: 'admin' | 'user') => {
  const queryClient = useQueryClient();

  const refreshAllData = async () => {
    console.log('🔄 [AUTO REFRESH] Rafraîchissement automatique de tous les onglets...');
    
    try {
      // Données communes à admin et utilisateur
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/clients'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/transactions/user-number'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/stats/user'] }),
      ]);

      // Données spécifiques aux utilisateurs
      if (userRole === 'user') {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['/api/transactions/user'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/transactions/validated/user'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/reports/user'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/reports/daily-user'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/stats/user-debt'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/stats/can-send'] }),
        ]);
      }

      // Données spécifiques aux admins
      if (userRole === 'admin') {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/transactions/validated'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/transactions/cancelled'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/payments'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/users'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/stats'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/stats/pending-count'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/stats/cancellation-count'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/balance/history'] }),
          queryClient.invalidateQueries({ queryKey: ['/api/reports'] }),
        ]);
      }

      console.log('✅ [AUTO REFRESH] Tous les onglets rafraîchis avec succès');
      
      // Déclencher un événement global pour indiquer que les données ont été actualisées
      window.dispatchEvent(new CustomEvent('data-refreshed', {
        detail: { 
          role: userRole, 
          timestamp: new Date(),
          source: 'auto-refresh'
        }
      }));
      
    } catch (error) {
      console.error('❌ [AUTO REFRESH] Erreur lors du rafraîchissement:', error);
    }
  };

  useEffect(() => {
    // Écouter les événements WebSocket pour rafraîchissement automatique
    const handleWebSocketEvent = (event: any) => {
      console.log('🔔 [AUTO REFRESH] Événement WebSocket reçu:', event.detail?.type);
      
      // Déclencher le rafraîchissement pour tous les types d'événements importants
      const importantEvents = [
        'TRANSACTION_CREATED',
        'TRANSACTION_UPDATED', 
        'TRANSACTION_VALIDATED',
        'TRANSACTION_DELETED',
        'PROOF_SUBMITTED',
        'BALANCE_UPDATED',
        'PAYMENT_CREATED',
        'PAYMENT_DELETED',
        'CLIENT_CREATED',
        'CLIENT_UPDATED',
        'CLIENT_DELETED',
        'USER_UPDATED',
        'SYSTEM_SETTINGS_UPDATED'
      ];

      if (event.detail?.type && importantEvents.includes(event.detail.type)) {
        refreshAllData();
      }
    };

    // Écouter les événements personnalisés pour rafraîchissement
    const events = [
      'websocket-message',
      'transaction-created',
      'transaction-updated', 
      'transaction-validated',
      'transaction-deleted',
      'proof-submitted',
      'balance-updated',
      'payment-created',
      'payment-deleted',
      'force-refresh-all',
      'badge-count-updated'
    ];

    events.forEach(eventName => {
      window.addEventListener(eventName, handleWebSocketEvent);
    });

    // NOUVEAU : Réactualisation automatique périodique
    const intervalDuration = userRole === 'admin' ? 20000 : 30000; // Admin: 20s, User: 30s
    console.log(`🔄 [AUTO REFRESH] Hook activé pour ${userRole} avec intervalle de ${intervalDuration/1000}s`);
    
    const autoRefreshInterval = setInterval(() => {
      console.log(`🔄 [AUTO REFRESH] Réactualisation automatique périodique (${userRole})`);
      refreshAllData();
    }, intervalDuration);

    // Rafraîchissement immédiat au montage du hook
    refreshAllData();

    // Nettoyage des écouteurs et intervalle
    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleWebSocketEvent);
      });
      clearInterval(autoRefreshInterval);
    };
  }, [userRole, queryClient]);

  return { refreshAllData };
};