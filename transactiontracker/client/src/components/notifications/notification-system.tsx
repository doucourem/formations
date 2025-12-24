import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  targetRole: string;
  targetUserId: number | null;
  relatedId: number | null;
  isRead: boolean;
  isPersistent: boolean;
  createdAt: string;
  readAt: string | null;
}

export function NotificationSystem() {
  const { user } = useAuth();
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Créer l'audio pour les notifications
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiG0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiG0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiG0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiG0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiG0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiG0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiG0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiG0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiG0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMcBjiG0/LN";
    audioRef.current.volume = 0.5;
  }, []);

  const { data: unreadNotifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/unread"],
    queryFn: () => fetch(`/api/notifications/unread?targetRole=${user?.role}`, { credentials: "include" }).then(res => res.json()),
    enabled: !!user?.role,
    refetchInterval: false, // Disable auto-refresh, use WebSocket updates instead
  });

  // Jouer le son lorsqu'il y a des notifications non lues
  useEffect(() => {
    if (unreadNotifications && unreadNotifications.length > 0 && !audioPlaying) {
      setAudioPlaying(true);
      
      const playNotificationSound = () => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
        }
      };

      // Jouer immédiatement
      playNotificationSound();

      // Répéter toutes les 30 secondes tant qu'il y a des notifications
      const interval = setInterval(() => {
        playNotificationSound();
      }, 30000);

      return () => {
        clearInterval(interval);
      };
    } else if (unreadNotifications && unreadNotifications.length === 0 && audioPlaying) {
      setAudioPlaying(false);
    }
  }, [unreadNotifications, audioPlaying]);

  // Système de notification invisible - joue seulement le son
  // Fonctionne pour tous les utilisateurs (admin et utilisateurs réguliers)
  return (
    <div className="hidden">
      {/* Audio pour les notifications - reste caché mais fonctionnel */}
      <audio ref={audioRef} preload="auto" />
    </div>
  );
}