import { useEffect } from "react";
import { useAuth } from "./use-auth";
import { websocketManager } from "@/lib/websocket";

export function useWebSocket() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connecter le WebSocket avec les infos utilisateur
      websocketManager.connect(user.id, user.role);

      // Nettoyer à la déconnexion
      return () => {
        websocketManager.disconnect();
      };
    }
  }, [user]);

  return {
    send: websocketManager.send.bind(websocketManager),
    disconnect: websocketManager.disconnect.bind(websocketManager)
  };
}