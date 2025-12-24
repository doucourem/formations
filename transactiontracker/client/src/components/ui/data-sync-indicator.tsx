import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Loader2, Database, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function DataSyncIndicator() {
  const { user, isDataLoading } = useAuth();
  const [syncAttempts, setSyncAttempts] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleDataSync = (event: any) => {
      const attempt = event.detail?.attempt || 1;
      const reconnected = event.detail?.reconnected || false;
      
      setSyncAttempts(attempt);
      setSyncStatus('syncing');
      
      console.log(`🔄 [SYNC INDICATOR] Data sync (attempt ${attempt})${reconnected ? ' after reconnection' : ''}`);
    };

    const handleSyncSuccess = () => {
      setSyncStatus('success');
      setLastSyncTime(new Date());
      setTimeout(() => setSyncStatus('idle'), 3000);
    };

    const handleSyncError = () => {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    };

    window.addEventListener('auth-data-sync-required', handleDataSync);
    window.addEventListener('data-sync-success', handleSyncSuccess);
    window.addEventListener('data-sync-error', handleSyncError);

    return () => {
      window.removeEventListener('auth-data-sync-required', handleDataSync);
      window.removeEventListener('data-sync-success', handleSyncSuccess);
      window.removeEventListener('data-sync-error', handleSyncError);
    };
  }, []);

  // Ne pas afficher si pas d'utilisateur ou si pas de chargement/sync
  if (!user || (!isDataLoading && syncStatus === 'idle')) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="p-3 bg-white shadow-lg border-l-4 border-l-blue-500 min-w-[200px]">
        <div className="flex items-center space-x-3">
          {/* Icône selon le statut */}
          {(isDataLoading || syncStatus === 'syncing') && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          {syncStatus === 'success' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {syncStatus === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              {isDataLoading && "Connexion en cours..."}
              {syncStatus === 'syncing' && `Synchronisation ${syncAttempts > 1 ? `(${syncAttempts})` : ''}`}
              {syncStatus === 'success' && "Données à jour"}
              {syncStatus === 'error' && "Erreur de synchronisation"}
            </div>
            
            {(isDataLoading || syncStatus === 'syncing') && (
              <div className="text-xs text-gray-500 mt-1">
                Chargement de vos données...
              </div>
            )}
            
            {syncStatus === 'success' && lastSyncTime && (
              <div className="text-xs text-gray-500 mt-1">
                {lastSyncTime.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </div>
            )}
            
            {syncStatus === 'error' && (
              <div className="text-xs text-red-600 mt-1">
                Veuillez actualiser la page
              </div>
            )}
          </div>
        </div>
        
        {/* Barre de progression pour les tentatives multiples */}
        {syncAttempts > 1 && syncStatus === 'syncing' && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((syncAttempts / 6) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}