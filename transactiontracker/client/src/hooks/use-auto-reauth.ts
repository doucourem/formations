import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getCurrentUser } from '@/lib/auth';

export function useAutoReauth() {
  const { user, updateUser } = useAuth();

  const attemptReauth = useCallback(async () => {
    const localUser = getCurrentUser();
    
    if (!localUser || !localUser.username) {
      return false;
    }

    try {
      console.log('🔄 [AUTO-REAUTH] Attempting silent reauth for:', localUser.username);
      
      // Try to authenticate with stored credentials
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const serverUser = await response.json();
        console.log('✅ [AUTO-REAUTH] Success for:', serverUser.username);
        updateUser(serverUser);
        return true;
      } else {
        console.log('❌ [AUTO-REAUTH] Failed, status:', response.status);
        return false;
      }
    } catch (error) {
      console.log('⚠️ [AUTO-REAUTH] Network error:', error);
      return false;
    }
  }, [updateUser]);

  const checkAndReauth = useCallback(async () => {
    const localUser = getCurrentUser();
    
    // Only attempt reauth if we have a local user but no server session
    if (localUser && !user) {
      await attemptReauth();
    }
  }, [user, attemptReauth]);

  // Check auth status periodically
  useEffect(() => {
    const interval = setInterval(checkAndReauth, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkAndReauth]);

  return { attemptReauth, checkAndReauth };
}