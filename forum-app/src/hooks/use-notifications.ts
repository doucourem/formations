import { useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Notification {
  type: string;
  message: string;
  data?: any;
  event?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingTransactions, setPendingTransactions] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Function to play notification sound and trigger visual alert
  const playNotificationSound = () => {
    try {
      console.log('🔔 [AUDIO] Attempting to play notification sound...');
      
      // Always trigger visual alert first
      triggerVisualAlert();
      
      // Create audio context for better browser compatibility
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a simple beep sound using Web Audio API
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // 800Hz frequency
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3); // Fade out
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3); // Stop after 0.3 seconds
      
      console.log('🔔 [AUDIO] Notification sound played successfully');
    } catch (error) {
      console.warn('🔔 [AUDIO] Could not play notification sound:', error);
      // Still trigger visual alert even if audio fails
      triggerVisualAlert();
      
      // Fallback to HTML5 audio if Web Audio API fails
      try {
        console.log('🔔 [AUDIO] Trying fallback HTML5 audio...');
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYdBTmS2e3BeSwG');
        audio.volume = 0.3;
        audio.play().then(() => {
          console.log('🔔 [AUDIO] Fallback audio played successfully');
        }).catch((fallbackError) => {
          console.warn('🔔 [AUDIO] Fallback audio failed:', fallbackError);
        });
      } catch (fallbackError) {
        console.warn('🔔 [AUDIO] Fallback audio setup failed:', fallbackError);
      }
    }
  };

  // Function to trigger visual alerts
  const triggerVisualAlert = () => {
    console.log('🔔 [VISUAL] Triggering visual alert...');
    
    // Flash background red with stronger effect
    document.body.style.transition = 'background-color 0.2s';
    document.body.style.backgroundColor = '#dc2626'; // Darker red
    document.body.style.border = '5px solid #dc2626';
    
    setTimeout(() => {
      document.body.style.backgroundColor = '';
      document.body.style.border = '';
    }, 2000); // Longer duration
    
    // Create persistent banner alert
    const alertBanner = document.createElement('div');
    alertBanner.id = 'transaction-alert-banner';
    alertBanner.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      background-color: #dc2626;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      animation: pulse 1s infinite;
      box-shadow: 0 4px 20px rgba(220, 38, 38, 0.8);
    `;
    alertBanner.innerHTML = '🚨 NOUVELLE TRANSACTION REÇUE 🚨 <button onclick="this.parentElement.remove()" style="margin-left: 20px; background: #991b1b; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">✕ Fermer</button>';
    
    // Remove existing banner if any
    const existingBanner = document.getElementById('transaction-alert-banner');
    if (existingBanner) {
      existingBanner.remove();
    }
    
    document.body.prepend(alertBanner);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (alertBanner.parentNode) {
        alertBanner.remove();
      }
    }, 10000);
    
    // Trigger global event for component notification
    window.dispatchEvent(new CustomEvent('transaction-notification', { 
      detail: { type: 'TRANSACTION_CREATED' } 
    }));
    
    console.log('🔔 [VISUAL] Visual alert triggered with enhanced banner');
  };

  // Fetch initial pending transactions count for admin users
  const { data: pendingCountData, refetch: refetchPendingCount } = useQuery({
    queryKey: ['/api/stats/pending-count'],
    enabled: user?.role === 'admin',
    refetchInterval: 120000, // Optimisé pour 3G : 2 minutes au lieu de 3 secondes
    staleTime: 60000, // Données fraîches pendant 1 minute pour éviter requêtes inutiles
    gcTime: 180000, // Cache 3 minutes pour éviter re-téléchargement
    refetchOnWindowFocus: true, // Force refetch on focus
    refetchOnMount: true, // Force refetch on mount
  });

  // Update pending transactions count when data changes
  useEffect(() => {
    if (pendingCountData && user?.role === 'admin' && typeof pendingCountData === 'object' && pendingCountData !== null) {
      const data = pendingCountData as { count: number };
      if (typeof data.count === 'number') {
        setPendingTransactions(data.count);
        console.log('🔔 [BADGE] Pending transactions count updated to:', data.count);
        
        // Déclencher l'événement de synchronisation pour les transactions
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('badge-count-updated', { 
            detail: { count: data.count } 
          }));
          console.log('🔄 [SYNC] Badge-count-updated event dispatched with count:', data.count);
        }, 100);
        
        // Force synchronisation des données des transactions en attente
        queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
        
        // Déclencher un événement pour forcer le refresh de l'onglet transactions
        window.dispatchEvent(new CustomEvent('badge-count-updated', { 
          detail: { count: data.count } 
        }));
      }
    }
  }, [pendingCountData, user?.role, queryClient]);

  const connect = () => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔔 [WEBSOCKET] Connected, registering as:', user.role, user.id);
        setIsConnected(true);
        
        // Register client with server
        ws.send(JSON.stringify({
          type: 'register',
          userId: user.id,
          role: user.role
        }));

        console.log('🔔 [WEBSOCKET] Registration message sent for', user.role, user.id);

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          console.log('🔔 [WEBSOCKET] Message reçu côté client:', notification.type, notification);
          
          // Increment unread count
          setUnreadCount(prev => prev + 1);
          
          // Play notification sound and trigger visual alerts for new transactions
          if (notification.type === 'NEW_TRANSACTION' || notification.type === 'TRANSACTION_CREATED') {
            console.log('🔔 [AUDIO] Déclenchement alerte audio pour:', notification.type);
            playNotificationSound();
            
            // Trigger visual alert immediately
            console.log('🔔 [VISUAL] Triggering visual alert...');
            console.log('🔔 [VISUAL] Transaction notification received:', notification);
            
            // Trigger banner alert
            window.dispatchEvent(new CustomEvent('transaction-alert', { 
              detail: { 
                type: 'TRANSACTION_CREATED',
                userName: (notification as any).userName,
                phoneNumber: (notification as any).phoneNumber,
                amountFCFA: (notification as any).amountFCFA,
                amountGNF: (notification as any).amountGNF
              } 
            }));
            
            console.log('🔔 [VISUAL] Visual alert triggered with enhanced banner');
          }
          
          // Déclencher événements pour refresh instantané
          if (notification.type === 'REFRESH_TRANSACTIONS' && (notification as any).event) {
            window.dispatchEvent(new CustomEvent((notification as any).event, { detail: notification }));
          }
          if (notification.type === 'REFRESH_VALIDATED' && (notification as any).event) {
            window.dispatchEvent(new CustomEvent((notification as any).event, { detail: notification }));
          }
          if (notification.type === 'REFRESH_STATS' && (notification as any).event) {
            window.dispatchEvent(new CustomEvent((notification as any).event, { detail: notification }));
            
            // Force immediate badge update for REFRESH_STATS
            refetchPendingCount().then((result) => {
              if (result.data && typeof result.data === 'object' && 'count' in result.data) {
                setPendingTransactions((result.data as { count: number }).count);
                console.log('🔔 [BADGE] Badge mis à jour via REFRESH_STATS:', (result.data as { count: number }).count);
              }
            });
          }
          
          // Gérer les mises à jour de frais personnalisés
          if (notification.type === 'PERSONAL_FEE_UPDATED') {
            console.log('💰 [FEE UPDATE] Personal fee update notification received:', notification);
            
            // Dispatcher l'événement pour les composants utilisateur
            window.dispatchEvent(new CustomEvent('websocket-message', { 
              detail: notification 
            }));
          }
          
          // Gérer les suppressions de transactions côté utilisateur
          if (notification.type === 'TRANSACTION_DELETED_BY_USER') {
            console.log('🗑️ [USER DELETE] Transaction deletion notification received:', notification);
            
            // Dispatcher l'événement pour synchronisation immédiate
            window.dispatchEvent(new CustomEvent('websocket-message', { 
              detail: notification 
            }));
          }
          
          // Gérer les refreshes forcés globaux
          if (notification.type === 'FORCE_REFRESH') {
            console.log('🔄 [FORCE REFRESH] Global refresh notification received:', notification);
            
            // Dispatcher l'événement pour rafraîchissement global
            window.dispatchEvent(new CustomEvent('websocket-message', { 
              detail: notification 
            }));
          }
          
          // Gérer les mises à jour de solde et dette globale
          if (notification.type === 'BALANCE_UPDATED') {
            console.log('💰 [BALANCE] Balance update notification received:', notification);
            
            // Rafraîchir toutes les données statistiques
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
            queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
            
            // Déclencher événement pour mise à jour immédiate des cartes admin
            window.dispatchEvent(new CustomEvent('balance-updated', { 
              detail: { 
                newBalance: (notification as any).newBalance,
                amountRestored: (notification as any).amountRestored,
                action: (notification as any).action
              } 
            }));
            
            console.log('💰 [BALANCE] Balance update events dispatched');
            
            // Si c'est une suppression, forcer le refresh des transactions
            if ((notification as any).action === 'transaction-deleted') {
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('force-pending-refresh'));
                console.log('🔄 [SYNC] Force refresh déclenché après suppression');
              }, 200);
            }
          }

          // Show toast notification
          toast({
            title: "Notification",
            description: notification.message,
            duration: 5000,
          });

          // Handle specific notification types and refresh data
          if (notification.type === 'NEW_TRANSACTION' || notification.type === 'TRANSACTION_CREATED') {
            // Refetch immédiatement le compteur exact depuis le serveur
            refetchPendingCount().then((result) => {
              if (result.data && typeof result.data === 'object' && 'count' in result.data) {
                setPendingTransactions((result.data as { count: number }).count);
                console.log('🔔 [BADGE] Badge mis à jour après nouvelle transaction:', (result.data as { count: number }).count);
              }
            });
            
            // Invalidate and refetch relevant queries
            queryClient.invalidateQueries({ queryKey: ['/api/stats/pending-count'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
            queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
            // Rafraîchir les statistiques quotidiennes utilisateur
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'] });
          } else if (notification.type === 'TRANSACTION_DELETED_BY_ADMIN') {
            // Synchronisation forcée quand admin supprime une transaction utilisateur
            console.log('🔄 [SYNC] Transaction supprimée par admin, refresh forcé');
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/user'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'] });
            
            // Déclencher événement pour refresh interface utilisateur
            window.dispatchEvent(new CustomEvent('transaction-deleted-admin', { 
              detail: { 
                transactionId: (notification as any).transactionId,
                force_refresh: true 
              } 
            }));
          } else if (notification.type === 'REFRESH_STATS') {
            // Force refresh du compteur de transactions en attente
            queryClient.invalidateQueries({ queryKey: ['/api/stats/pending-count'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
            
            // Force immediate refetch of pending count
            setTimeout(() => {
              refetchPendingCount();
            }, 500);
          } else if (notification.type === 'PROOF_SUBMITTED') {
            // Refresh transaction data to show updated proof
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
          } else if (notification.type === 'TRANSACTION_VALIDATED') {
            // Refetch immédiatement le compteur exact après validation
            refetchPendingCount().then((result) => {
              if (result.data && typeof result.data === 'object' && 'count' in result.data) {
                setPendingTransactions((result.data as { count: number }).count);
                console.log('🔔 [BADGE] Badge mis à jour après validation:', (result.data as { count: number }).count);
              }
            });
            
            // Refresh all relevant data for validation changes
            queryClient.invalidateQueries({ queryKey: ['/api/stats/pending-count'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
            queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
            // Rafraîchir les statistiques quotidiennes utilisateur
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'] });
          } else if (notification.type === 'TRANSACTION_CANCELLED') {
            // Refetch immédiatement le compteur exact après annulation
            refetchPendingCount().then((result) => {
              if (result.data && typeof result.data === 'object' && 'count' in result.data) {
                setPendingTransactions((result.data as { count: number }).count);
                console.log('🔔 [BADGE] Badge mis à jour après annulation:', (result.data as { count: number }).count);
              }
            });
            
            // Refresh transaction data to show cancelled status
            queryClient.invalidateQueries({ queryKey: ['/api/stats/pending-count'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
            queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
            // Rafraîchir les statistiques quotidiennes utilisateur
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'] });
          } else if (notification.type === 'TRANSACTION_DELETED') {
            // Refetch immédiatement le compteur exact après suppression
            refetchPendingCount().then((result) => {
              if (result.data && typeof result.data === 'object' && 'count' in result.data) {
                setPendingTransactions((result.data as { count: number }).count);
                console.log('🔔 [BADGE] Badge mis à jour après suppression:', (result.data as { count: number }).count);
              }
            });
            
            // Refresh transaction data after deletion
            queryClient.invalidateQueries({ queryKey: ['/api/stats/pending-count'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
            queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
            // Rafraîchir les statistiques quotidiennes utilisateur
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'] });
          } else if (notification.type === 'PAYMENT_MADE') {
            // Refresh payment and user stats
            queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/user'] });
          } else if (notification.type === 'REFRESH_STATS') {
            // Rafraîchir toutes les statistiques admin (dette globale et par utilisateur)
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
            queryClient.invalidateQueries({ queryKey: ['/api/stats/pending-count'] });
            // Rafraîchir le solde principal admin
            queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
            // Rafraîchir les statistiques quotidiennes utilisateur
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'] });
          }
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect after 3 seconds
        if (user) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const markAllAsSeen = async () => {
    try {
      const response = await fetch('/api/notifications/mark-seen', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setUnreadCount(0);
        // Refresh notifications data
        queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
      }
    } catch (error) {
      console.error('Failed to mark all notifications as seen:', error);
    }
  };

  const markPendingTransactionsAsRead = () => {
    setPendingTransactions(0);
  };

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  return {
    isConnected,
    unreadCount,
    pendingTransactions,
    markAsRead,
    markAllAsSeen,
    markPendingTransactionsAsRead,
    connect,
    disconnect
  };
}