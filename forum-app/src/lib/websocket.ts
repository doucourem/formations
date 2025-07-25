// WebSocket connection pour notifications temps réel
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: number, userRole: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Enregistrer l'utilisateur
        this.send({
          type: 'register',
          userId,
          role: userRole
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect(userId, userRole);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  private reconnect(userId: number, userRole: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(userId, userRole);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(data: any) {
    console.log('🔔 [WEBSOCKET] Message received:', data.type);
    
    if (data.type === 'notification') {
      // Jouer un son pour les notifications importantes
      this.playNotificationSound();
    }
    
    // Déclencher une actualisation des données selon le type
    switch (data.type) {
      case 'TRANSACTION_CREATED':
        window.dispatchEvent(new CustomEvent('websocket-transaction-created', { detail: data }));
        break;
      case 'TRANSACTION_DELETED':
      case 'TRANSACTION_DELETED_BY_USER':
      case 'TRANSACTION_DELETED_BY_ADMIN':
        window.dispatchEvent(new CustomEvent('websocket-transaction-deleted', { detail: data }));
        break;
      case 'TRANSACTION_VALIDATED':
        window.dispatchEvent(new CustomEvent('websocket-transaction-validated', { detail: data }));
        break;
      case 'BALANCE_UPDATED':
        window.dispatchEvent(new CustomEvent('websocket-balance-updated', { detail: data }));
        break;
      case 'FORCE_REFRESH':
        window.dispatchEvent(new CustomEvent('websocket-force-refresh', { detail: data }));
        break;
      default:
        // Déclencher une actualisation générale pour les autres types
        window.dispatchEvent(new CustomEvent('websocket-notification', { detail: data }));
    }
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkcCD2G0fPJfSUGKYLK8daLOQgWa7zs6aJQEQpOqOD3s2UdAjyK1fPPeSsFJHfI8N2QQAoUXrPn66hWGAhEmeAyvmkeCT2H0vDJfisGKYDK8daLOQgWa7zs6aJQEQpNqN3yut2VEAZE');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore les erreurs de lecture
    } catch (error) {
      // Ignore les erreurs audio
    }
  }

  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketManager = new WebSocketManager();