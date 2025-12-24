import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RefreshCw, Eye, Camera, Clock, Check, Trash2, Upload, FileImage, Share2, Calendar, Search, X, Image, EyeOff } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useNetworkOptimization, useAdaptiveQuery } from "@/hooks/use-network-optimization";
import { OfflineIndicator, LoadingWithRetry } from "@/components/network/offline-indicator";

declare global {
  interface Window {
    transactionNumberCache?: Map<string, any>;
  }
}

interface Transaction {
  id: number;
  userId: number;
  clientId: number;
  phoneNumber: string;
  amountFCFA: string;
  amountGNF: string;
  amountToPay: string;
  status: string;
  proof: string | null;
  proofType: string | null;
  externalProofUrl: string | null;
  isArchived: boolean;
  exchangeRate: string;
  createdAt: string;
  userName: string;
  clientName: string;
}

interface TransactionsTabProps {
  onOpenProofModal: (transactionId: number) => void;
}

export default function TransactionsTab({ onOpenProofModal }: TransactionsTabProps) {
  const { toast } = useToast();
  const [searchUser, setSearchUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const { isOnline, isSlowConnection } = useNetworkOptimization();

  // Intervalle adaptatif selon la qualité réseau
  const adaptiveInterval = useAdaptiveQuery(180000); // 3 minutes de base

  // Query ultra-optimisée pour transactions en attente - affichage instantané
  const { data: pendingTransactions, isLoading: pendingLoading, refetch: refetchPending, error: pendingError } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/pending", refreshKey],
    staleTime: 0, // Toujours frais
    gcTime: 120000, // Cache 2 minutes pour éviter re-téléchargement inutile
    refetchInterval: 60000, // Optimisé pour 3G : 60 secondes au lieu de 2 secondes
    refetchOnWindowFocus: true, // Force refetch au focus
    refetchOnMount: true, // Force refetch au mount
    networkMode: 'always', // Toujours essayer de récupérer
    retry: 3, // Plus de tentatives
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    queryFn: async () => {
      // Bypass cache with timestamp
      const response = await fetch(`/api/transactions/pending?t=${Date.now()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      console.log('🔥 [FRESH DATA] Direct fetch result:', data.length, 'transactions');
      return data;
    }
  });

  // Debug logging
  useEffect(() => {
    console.log('🔧 [PENDING DEBUG] Query state:', {
      data: pendingTransactions?.length,
      isLoading: pendingLoading,
      error: pendingError
    });
    if (pendingTransactions?.length) {
      console.log('🔧 [PENDING DEBUG] First transaction:', pendingTransactions[0]);
    }
  }, [pendingTransactions, pendingLoading, pendingError]);

  // Event listeners pour synchronisation forcée
  useEffect(() => {
    const handleBadgeUpdate = () => {
      console.log('🔄 [SYNC] Badge updated, forcing transaction refresh...');
      refetchPending();
    };

    const handleTransactionDeleted = () => {
      console.log('🔄 [SYNC] Transaction deleted, forcing refresh...');
      refetchPending();
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/pending"] });
    };

    const handleForcePendingRefresh = () => {
      console.log('🔄 [SYNC] Force pending refresh triggered');
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/pending"] });
      refetchPending();
    };

    const handleTabSwitch = () => {
      console.log('🔄 [SYNC] Tab switch detected, refreshing pending transactions');
      refetchPending();
    };

    window.addEventListener('badge-count-updated', handleBadgeUpdate);
    window.addEventListener('transaction-deleted', handleTransactionDeleted);
    window.addEventListener('force-pending-refresh', handleForcePendingRefresh);
    window.addEventListener('tab-switched-to-pending', handleTabSwitch);
    
    return () => {
      window.removeEventListener('badge-count-updated', handleBadgeUpdate);
      window.removeEventListener('transaction-deleted', handleTransactionDeleted);
      window.removeEventListener('force-pending-refresh', handleForcePendingRefresh);
      window.removeEventListener('tab-switched-to-pending', handleTabSwitch);
    };
  }, [refetchPending, queryClient]);

  // Query pour toutes les transactions - optimisée pour affichage rapide
  const { data: allTransactions, isLoading: allLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    refetchInterval: false, // WebSocket only
    refetchOnWindowFocus: false,
    staleTime: 0, // Toujours frais pour admin
    gcTime: 60 * 1000, // 1 minute cache
    retry: 1,
    retryDelay: 300,
    placeholderData: (previousData) => previousData,
    networkMode: 'always',
  });

  const transactions = pendingTransactions || [];
  const isLoading = pendingLoading;

  // Synchronisation forcée avec les mises à jour du badge compteur
  useEffect(() => {
    const handleBadgeUpdate = (event: CustomEvent) => {
      console.log('🔄 [SYNC] Badge count updated, forcing transaction refresh:', event.detail.count);
      refetchPending();
    };

    window.addEventListener('badge-count-updated', handleBadgeUpdate as EventListener);
    
    return () => {
      window.removeEventListener('badge-count-updated', handleBadgeUpdate as EventListener);
    };
  }, [refetchPending]);

  // Optimize sorting and filtering with useMemo for better performance
  const { sortedTransactions, filteredTransactions } = useMemo(() => {
    console.log('🔧 [FILTER DEBUG] Processing transactions:', pendingTransactions?.length || 0);
    const transactions = pendingTransactions || [];
    const sorted = [...transactions].sort((a: Transaction, b: Transaction) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const filtered = sorted.filter((transaction: Transaction) => {
      // Filter by user
      if (searchUser.trim()) {
        const userName = transaction.userName?.toLowerCase() || '';
        const clientName = transaction.clientName?.toLowerCase() || '';
        const searchTerm = searchUser.toLowerCase();
        if (!userName.includes(searchTerm) && !clientName.includes(searchTerm)) {
          return false;
        }
      }
      
      // Filter by date only if a specific date is selected
      if (selectedDate) {
        const transactionDate = new Date(transaction.createdAt).toISOString().split('T')[0];
        if (transactionDate !== selectedDate) {
          return false;
        }
      }
      
      return true;
    });

    return { sortedTransactions: sorted, filteredTransactions: filtered };
  }, [transactions, searchUser, selectedDate]);

  const validateTransaction = useMutation({
    mutationFn: async (transactionId: number) => {
      return await apiRequest("PATCH", `/api/transactions/${transactionId}`, {
        status: "validated"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/pending-count"] });
      toast({
        title: "Transaction validée",
        description: "La transaction a été validée avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la validation de la transaction",
        variant: "destructive",
      });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (transactionId: number) => {
      return await apiRequest("DELETE", `/api/transactions/${transactionId}`);
    },
    onSuccess: async () => {
      console.log('🗑️ [DELETE] Transaction supprimée - rechargement page forcé');
      
      toast({
        title: "Transaction supprimée",
        description: "Actualisation...",
      });
      
      // Rechargement immédiat de la page pour éviter les problèmes de cache
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      console.error('🗑️ [DELETE ERROR]', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la transaction",
        variant: "destructive",
      });
    },
  });

  const handleValidate = useCallback((id: number) => {
    validateTransaction.mutate(id);
  }, [validateTransaction]);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette transaction ?")) {
      deleteTransaction.mutate(id);
    }
  }, [deleteTransaction]);

  // Fonction pour marquer une transaction comme vue par l'admin
  const handleMarkAsSeen = async (transactionId: number) => {
    try {
      console.log('👁️ [MARK SEEN] Changing status to seen for transaction:', transactionId);
      
      const response = await apiRequest("PATCH", `/api/transactions/${transactionId}`, {
        status: "seen"
      });
      
      console.log('👁️ [MARK SEEN] Server response:', response);
      
      // Invalidation immédiate du cache
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/transactions/pending"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/stats/pending-count"] }),
        queryClient.refetchQueries({ queryKey: ["/api/transactions/pending"] })
      ]);
      
      toast({
        title: "Transaction marquée comme vue",
        description: "Statut changé de 'En attente' à 'Vu'",
      });
      
      // Force un refresh après 500ms pour garantir la synchronisation
      setTimeout(() => {
        refetchPending();
      }, 500);
      
    } catch (error) {
      console.error('👁️ [MARK SEEN ERROR]', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut de la transaction",
        variant: "destructive",
      });
    }
  };

  // Fonction pour ouvrir le modal de galerie original
  const handleOpenGallery = (transactionId: number) => {
    onOpenProofModal(transactionId);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('fr-FR').format(parseFloat(amount));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case "seen":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Vu</Badge>;
      case "proof_submitted":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Preuve soumise</Badge>;
      case "validated":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Validée</Badge>;
      default:
        return "Inconnu";
    }
  };

  const pendingCount = filteredTransactions.length;



  const formatDateTime = (dateString: string, transaction: any) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      const userNumber = getUserTransactionNumber(dateString, transaction.userId);
      const timeString = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <span>
          <span className="text-gray-700">{timeString}</span>
          <br />
          <span className="text-xs text-green-600 font-medium">#{userNumber} pour {transaction.userName}</span>
        </span>
      );
    } else if (isYesterday) {
      const userNumber = getUserTransactionNumber(dateString, transaction.userId);
      const timeString = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <span>
          <span className="text-gray-700">Hier {timeString}</span>
          <br />
          <span className="text-xs text-orange-600 font-medium">#{userNumber} pour {transaction.userName}</span>
        </span>
      );
    } else {
      const userNumber = getUserTransactionNumber(dateString, transaction.userId);
      const dateTimeString = date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <span>
          <span className="text-gray-700">{dateTimeString}</span>
          <br />
          <span className="text-xs text-blue-600 font-medium">#{userNumber} pour {transaction.userName}</span>
        </span>
      );
    }
  };

  const getUserTransactionNumber = (transactionDate: string, userId: number) => {
    // Récupérer le numéro depuis le cache ou utiliser une logique fallback
    const date = new Date(transactionDate).toISOString().split('T')[0];
    const cacheKey = `${userId}-${date}`;
    
    // Initialiser le cache global si nécessaire
    if (typeof window !== 'undefined' && !window.transactionNumberCache) {
      window.transactionNumberCache = new Map();
    }
    
    if (typeof window !== 'undefined' && window.transactionNumberCache.has(cacheKey)) {
      const cachedData = window.transactionNumberCache.get(cacheKey);
      return cachedData.numberMap[transactionDate] || 1;
    }
    
    // Effectuer une requête pour récupérer les numéros de transaction
    if (typeof window !== 'undefined') {
      fetch(`/api/transactions/user-number/${userId}/${date}`)
        .then(response => response.json())
        .then(data => {
          window.transactionNumberCache.set(cacheKey, data);
          // Trigger un re-render si nécessaire
          setRefreshKey(prev => prev + 1);
        })
        .catch(error => {
          console.error('Error fetching transaction numbers:', error);
        });
    }
    
    return 1; // Valeur par défaut en attendant la réponse
  };

  return (
    <div className="space-y-8">
      <OfflineIndicator />
      
      <LoadingWithRetry
        isLoading={pendingLoading && !(pendingTransactions || []).length}
        error={null}
        onRetry={() => refetchPending()}
        message={isSlowConnection ? "Chargement optimisé pour connexion lente..." : "Chargement des transactions..."}
      />
      
      {/* Search filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par utilisateur..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats header */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-orange-800">Transactions en attente de validation</h3>
            <p className="text-orange-600 mt-1">
              {pendingCount} transaction{pendingCount !== 1 ? 's' : ''} nécessit{pendingCount !== 1 ? 'ent' : 'e'} votre attention
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('🔄 [REFRESH] Actualisation manuelle déclenchée');
                // Force refresh de toutes les données critiques
                queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
                queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
                queryClient.invalidateQueries({ queryKey: ['/api/stats/pending-count'] });
                queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
                queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
                queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
                queryClient.invalidateQueries({ queryKey: ['/api/stats/cancellation-count'] });
                
                // Force refetch immédiat
                refetchPending();
                
                // Toast de confirmation
                toast({
                  title: "Actualisation en cours",
                  description: "Toutes les données sont en cours d'actualisation...",
                  duration: 2000,
                });
              }}
              disabled={pendingLoading}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${pendingLoading ? 'animate-spin' : ''}`} />
              {isSlowConnection ? 'Actualiser (lent)' : 'Actualiser'}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((transaction: Transaction) => (
          <Card key={transaction.id} className="border-l-4 border-warning">
            <div className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                {/* Ligne 1: Utilisateur + Info transaction + Actions (mobile) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {formatDateTime(transaction.createdAt, transaction)}
                    </span>
                  </div>
                  
                  {/* 3 mini icônes d'actions - visibles uniquement sur mobile */}
                  <div className="flex items-center gap-1 sm:hidden">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsSeen(transaction.id)}
                      className={`h-6 w-6 p-0 ${
                        transaction.status === 'seen' || transaction.status === 'proof_submitted'
                          ? 'bg-blue-50 text-blue-600 border-blue-200' 
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                      title={transaction.status === 'seen' || transaction.status === 'proof_submitted' ? "Admin a vu" : "Marquer comme vu"}
                    >
                      <Eye className="h-2.5 w-2.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenGallery(transaction.id)}
                      className="h-6 w-6 p-0 bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200"
                      title="Galerie - Soumettre preuve"
                    >
                      <Image className="h-2.5 w-2.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(transaction.id)}
                      disabled={deleteTransaction.isPending}
                      className="h-6 w-6 p-0"
                      title="Supprimer définitivement"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>

                {/* Ligne 2: Numéro + Montant (une ligne sur mobile) */}
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-900">
                    {transaction.phoneNumber}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-lg font-bold text-green-800">
                    {formatCurrency(transaction.amountGNF)} GNF
                  </span>
                </div>

                {/* 3 mini icônes d'actions - visibles uniquement sur desktop */}
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAsSeen(transaction.id)}
                    className={`h-8 w-8 p-0 ${
                      transaction.status === 'seen' || transaction.status === 'proof_submitted'
                        ? 'bg-blue-50 text-blue-600 border-blue-200' 
                        : 'text-gray-400 hover:text-blue-600'
                    }`}
                    title={transaction.status === 'seen' || transaction.status === 'proof_submitted' ? "Admin a vu" : "Marquer comme vu"}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenGallery(transaction.id)}
                    className="h-8 w-8 p-0 bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200"
                    title="Galerie - Soumettre preuve"
                  >
                    <Image className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(transaction.id)}
                    disabled={deleteTransaction.isPending}
                    className="h-8 w-8 p-0"
                    title="Supprimer définitivement"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredTransactions.length === 0 && !pendingLoading && (
          <Card className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction en attente</h3>
            <p className="text-gray-500">
              {searchUser || selectedDate 
                ? "Aucune transaction ne correspond à vos critères de recherche"
                : "Toutes les transactions ont été traitées"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}