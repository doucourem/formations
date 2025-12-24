import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Signal, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNetworkOptimization } from '@/hooks/use-network-optimization';

export function OfflineIndicator() {
  const { isOnline, isSlowConnection, effectiveType } = useNetworkOptimization();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Afficher l'indicateur seulement si hors ligne (pas pour connexion lente)
    setShowIndicator(!isOnline);
  }, [isOnline]);

  if (!showIndicator) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <Badge 
        variant={!isOnline ? "destructive" : "secondary"}
        className="flex items-center gap-2 px-3 py-2 shadow-lg"
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Hors ligne</span>
          </>
        ) : null}
      </Badge>
    </div>
  );
}

export function LoadingWithRetry({ 
  isLoading, 
  error, 
  onRetry, 
  message = "Chargement..." 
}: {
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  message?: string;
}) {
  const { isOnline, isSlowConnection } = useNetworkOptimization();

  if (error && !isOnline) {
    return (
      <div className="text-center py-8 px-4">
        <WifiOff className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-3">
          Connexion internet requise
        </p>
        <p className="text-xs text-gray-500">
          Vos données seront synchronisées une fois reconnecté
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600">{message}</span>
        </div>

      </div>
    );
  }

  if (error && onRetry) {
    return (
      <div className="text-center py-8 px-4">
        <Signal className="w-8 h-8 text-orange-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-3">
          Erreur de connexion
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return null;
}