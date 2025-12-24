// Système de notifications push pour PWA
export class PushNotificationManager {
  private isSupported = false;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.checkSupport();
  }

  private checkSupport() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    this.permission = this.isSupported ? Notification.permission : 'denied';
    
    console.log('🔔 [PUSH] Support check:', {
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window,
      hasNotifications: 'Notification' in window
    });
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('🔔 [PUSH] Notifications non supportées');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      console.log('🔔 [PUSH] Requesting notification permission...');
      this.permission = await Notification.requestPermission();
      
      if (this.permission === 'granted') {
        console.log('🔔 [PUSH] Permission accordée');
        return true;
      } else {
        console.log('🔔 [PUSH]', this.permission === 'denied' ? 'Permission refusée pour les notifications' : 'Permission non accordée');
        return false;
      }
    } catch (error) {
      console.error('🔔 [PUSH] Erreur permission:', error);
      return false;
    }
  }

  async subscribe(): Promise<string | null> {
    if (!this.isSupported || this.permission !== 'granted') {
      return null;
    }

    try {
      console.log('🔔 [PUSH] Attempting to subscribe to push notifications...');
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array('BCDEFG1234567890') // Clé factice
      });

      return JSON.stringify(subscription);
    } catch (error) {
      console.error('🔔 [PUSH] Erreur subscription:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async init(): Promise<void> {
    if (!this.isSupported) return;

    console.log('🔔 [PUSH] Attempting to subscribe to push notifications...');
    
    const hasPermission = await this.requestPermission();
    if (hasPermission) {
      await this.subscribe();
    }
  }

  showNotification(title: string, body: string, icon?: string): void {
    if (this.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }
}

export const pushNotificationManager = new PushNotificationManager();