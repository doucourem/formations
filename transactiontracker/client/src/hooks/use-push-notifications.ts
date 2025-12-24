import { useEffect, useState } from "react";
import { useAuth } from "./use-auth";

// Fonction pour convertir la clé VAPID
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    // Check if push notifications are supported
    const checkSupport = () => {
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasPushManager = 'PushManager' in window;
      const hasNotifications = 'Notification' in window;
      
      console.log('🔔 [PUSH] Support check:', { hasServiceWorker, hasPushManager, hasNotifications });
      
      if (hasServiceWorker && hasPushManager && hasNotifications) {
        setIsSupported(true);
        checkExistingSubscription();
      } else {
        console.log('🔔 [PUSH] Push notifications not supported on this device');
        setIsSupported(false);
      }
    };

    const checkExistingSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
          setSubscription(existingSubscription);
          setIsSubscribed(true);
        }
      } catch (error) {
        console.error('Error checking existing subscription:', error);
      }
    };

    checkSupport();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    console.log('🔔 [PUSH] Current permission state:', Notification.permission);

    // Check current permission state
    if (Notification.permission === 'granted') {
      console.log('🔔 [PUSH] Permission already granted!');
      return true;
    }

    try {
      console.log('🔔 [PUSH] Requesting notification permission...');
      console.log('🔔 [PUSH] Current state before request:', Notification.permission);
      
      // Force new permission request
      const permission = await Notification.requestPermission();
      console.log('🔔 [PUSH] Permission result:', permission);
      console.log('🔔 [PUSH] Final state after request:', Notification.permission);
      
      if (permission === 'granted') {
        console.log('🔔 [PUSH] Permission granted successfully!');
        return true;
      } else if (permission === 'denied') {
        console.log('🔔 [PUSH] Permission denied - check browser settings');
        return false;
      } else {
        console.log('🔔 [PUSH] Permission dismissed by user');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPush = async (): Promise<{ success: boolean; message: string }> => {
    console.log('🔔 [PUSH] Attempting to subscribe to push notifications...');
    
    if (!isSupported) {
      const message = 'Les notifications push ne sont pas supportées sur cet appareil/navigateur';
      console.log('🔔 [PUSH]', message);
      return { success: false, message };
    }

    if (!user || user.role !== 'admin') {
      const message = 'Seuls les administrateurs peuvent activer les notifications push';
      console.log('🔔 [PUSH]', message);
      return { success: false, message };
    }

    try {
      console.log('🔔 [PUSH] Requesting notification permission...');
      const permissionGranted = await requestPermission();
      if (!permissionGranted) {
        let message = 'Permission refusée pour les notifications';
        
        // Provide specific guidance based on permission state
        const currentPermission = Notification.permission;
        if (currentPermission === 'denied') {
          message = 'Notifications bloquées définitivement. Vous devez les autoriser manuellement dans les paramètres du navigateur.';
        } else if (currentPermission === 'default') {
          message = 'Veuillez autoriser les notifications dans la popup du navigateur.';
        } else {
          message = 'Erreur de permission. Vérifiez les paramètres de notification du site dans votre navigateur.';
        }
        
        console.log('🔔 [PUSH]', message);
        return { success: false, message };
      }

      console.log('🔔 [PUSH] Permission granted, registering service worker...');
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      console.log('🔔 [PUSH] Subscribing to push manager...');
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BEl62iUYgUivxIkv69yViEuiBIa40HI8MeJgUm30e1oSQi4VKVS3t3-JQxePaFNPe3UgKkgdOq8i3nM2Yw5-KKE')
      });

      console.log('🔔 [PUSH] Sending subscription to server...');
      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subscription: pushSubscription.toJSON()
        })
      });

      if (response.ok) {
        setSubscription(pushSubscription);
        setIsSubscribed(true);
        const message = 'Notifications push activées avec succès';
        console.log('🔔 [PUSH]', message);
        return { success: true, message };
      } else {
        const message = 'Erreur lors de l\'enregistrement sur le serveur';
        console.error('🔔 [PUSH]', message);
        return { success: false, message };
      }
    } catch (error: any) {
      const message = `Erreur: ${error.message || 'Impossible d\'activer les notifications'}`;
      console.error('🔔 [PUSH] Error subscribing to push notifications:', error);
      return { success: false, message };
    }
  };

  const unsubscribeFromPush = async (): Promise<boolean> => {
    if (!subscription) {
      return false;
    }

    try {
      // Unsubscribe from push manager
      const unsubscribed = await subscription.unsubscribe();
      
      if (unsubscribed) {
        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          credentials: 'include'
        });

        setSubscription(null);
        setIsSubscribed(false);
        console.log('Successfully unsubscribed from push notifications');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  };

  // Auto-subscribe admin users when they log in
  useEffect(() => {
    if (user && user.role === 'admin' && isSupported && !isSubscribed) {
      // Wait a bit before auto-subscribing to ensure user is ready
      const timer = setTimeout(() => {
        subscribeToPush();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, isSupported, isSubscribed]);

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribeToPush,
    unsubscribeFromPush,
    requestPermission
  };
}