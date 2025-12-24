import { X, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

interface MobileHeaderProps {
  title: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

export default function MobileHeader({ title, onClose, showCloseButton = false, showRefreshButton = true, onRefresh }: MobileHeaderProps) {
  const isMobile = useIsMobile();
  const { forceRefresh } = useAutoRefresh();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    console.log('📱 [MOBILE REFRESH] Début du rafraîchissement complet...');
    
    try {
      if (onRefresh) {
        // Fonction personnalisée fournie par le composant parent
        await onRefresh();
      } else {
        // Actualisation complète de TOUTES les données de l'application
        console.log('📱 [MOBILE REFRESH] Vider le cache et actualiser toutes les données...');
        
        // Vider complètement le cache
        queryClient.clear();
        
        // Invalider et refetch immédiat de toutes les queries selon le rôle
        const refreshPromises = [
          queryClient.invalidateQueries({ queryKey: ['/api/transactions'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['/api/clients'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['/api/stats/user'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['/api/system/settings'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['/api/user/can-send'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['/api/user/profile'], refetchType: 'all' })
        ];

        if (user?.role === 'admin') {
          refreshPromises.push(
            queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['/api/stats/users'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['/api/notifications'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['/api/transactions/validated'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['/api/stats/pending-count'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['/api/stats/cancellation-count'], refetchType: 'all' }),
            queryClient.invalidateQueries({ queryKey: ['/api/users'], refetchType: 'all' })
          );
        }

        // Attendre que toutes les invalidations soient terminées
        await Promise.allSettled(refreshPromises);
        
        // Forcer également le rafraîchissement global
        forceRefresh();
        
        // Déclencher les événements de rafraîchissement personnalisés
        window.dispatchEvent(new CustomEvent('force-refresh-all'));
        window.dispatchEvent(new CustomEvent('badge-count-updated'));
        
        console.log('📱 [MOBILE REFRESH] Toutes les données ont été actualisées');
      }
      
      toast({
        title: "✅ Actualisation réussie",
        description: "Toutes les données ont été mises à jour",
        duration: 2000,
      });
      
      console.log('✅ [MOBILE REFRESH] Rafraîchissement terminé avec succès');
      
      // Animation de fin
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
      
    } catch (error) {
      console.error('❌ [MOBILE REFRESH] Erreur:', error);
      setIsRefreshing(false);
      toast({
        title: "❌ Erreur d'actualisation",
        description: "Veuillez réessayer dans quelques instants",
        variant: "destructive",
      });
    }
  };

  if (!isMobile) return null;

  return (
    <div className="mobile-header sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-2 sm:px-4 py-3 min-h-[60px] max-w-full overflow-hidden box-border">
      <div className="flex items-center justify-between h-full max-w-full">
        {/* Bouton actualiser à gauche */}
        {showRefreshButton ? (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`mobile-touch-target p-2 rounded-full transition-all duration-300 min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isRefreshing 
                ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400' 
                : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-700'
            }`}
            aria-label="Actualiser toutes les données"
            title="Actualiser toutes les données de l'application (transactions, clients, statistiques)"
          >
            <RefreshCw className={`w-5 h-5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        ) : (
          <div className="w-11 min-w-[44px]" />
        )}
        
        {/* Titre centré */}
        <h1 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white flex-1 text-center px-2 sm:px-4 truncate overflow-hidden">
          {title}
        </h1>
        
        {/* Bouton de fermeture à droite */}
        {showCloseButton && onClose ? (
          <button
            onClick={onClose}
            className="mobile-touch-target p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-11 min-w-[44px]" /> 
        )}
      </div>
    </div>
  );
}