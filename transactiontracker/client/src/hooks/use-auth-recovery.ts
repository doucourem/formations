import { useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';

/**
 * Hook pour gérer la récupération automatique de session lors d'erreurs 401
 */
export function useAuthRecovery() {
  useEffect(() => {
    // Intercepter les réponses fetch globalement
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Si c'est une erreur 401 et qu'on a un utilisateur en localStorage
      if (response.status === 401 && getCurrentUser()) {
        console.warn('🔶 [AUTH RECOVERY] Session expired, attempting auto-reconnect...');
        
        // Essayer de reconnecter avec les credentials existants
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.username) {
          try {
            // Tenter une reconnexion avec les cookies existants
            const healthCheck = await originalFetch('/api/auth/me', {
              credentials: 'include',
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (healthCheck.ok) {
              console.log('✅ [AUTH RECOVERY] Session recovered successfully');
              // Retry la requête originale
              return await originalFetch(...args);
            } else {
              console.warn('🔶 [AUTH RECOVERY] Auto-reconnect failed, redirecting to login');
              // Nettoyer et rediriger
              localStorage.removeItem('currentUser');
              window.location.href = '/';
            }
          } catch (error) {
            console.error('❌ [AUTH RECOVERY] Reconnection failed:', error);
            localStorage.removeItem('currentUser');
            window.location.href = '/';
          }
        }
      }
      
      return response;
    };
    
    // Nettoyer l'interception lors du démontage
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}

/**
 * Fonction utilitaire pour forcer une reconnexion
 */
export async function forceReconnect(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    }
  } catch (error) {
    console.error('Force reconnect failed:', error);
  }
  
  return false;
}