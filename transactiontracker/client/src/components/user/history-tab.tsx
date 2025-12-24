import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Check, Trash2, X, AlertTriangle, Calendar, Search, Eye, Coins } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useNotifications } from "@/hooks/use-notifications";

interface Transaction {
  id: number;
  userId: number;
  clientId: number;
  phoneNumber: string;
  amountFCFA: string;
  amountGNF: string;
  amountToPay: string;
  feeAmount?: string;
  feePercentage?: string;
  status: string;
  proof: string | null;
  proofType: string | null;
  isProofShared: boolean;
  exchangeRate: string;
  createdAt: string;
  userName: string;
  clientName: string;
}

interface Client {
  id: number;
  name: string;
  userId: number;
}

export default function HistoryTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isConnected } = useNotifications();
  const [searchClient, setSearchClient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [autoSelectedYesterday, setAutoSelectedYesterday] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Gestion de la navigation clavier dans le tableau
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Vérifier si l'utilisateur est en train de taper dans un input
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return; // Ne pas intercepter si l'utilisateur tape dans un champ
      }
      
      if (!tableScrollRef.current) return;
      
      const scrollContainer = tableScrollRef.current;
      const scrollAmount = 150; // Pixels à faire défiler (augmenté pour une meilleure navigation)
      
      console.log('⌨️ [KEYBOARD] Touche pressée:', event.key, 'Container:', !!scrollContainer);
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
          console.log('⌨️ [KEYBOARD] Navigation gauche, scroll position:', scrollContainer.scrollLeft);
          break;
        case 'ArrowRight':
          event.preventDefault();
          scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          console.log('⌨️ [KEYBOARD] Navigation droite, scroll position:', scrollContainer.scrollLeft);
          break;
        case 'Home':
          if (event.ctrlKey || event.metaKey) { // Ctrl+Home ou Cmd+Home
            event.preventDefault();
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
            console.log('⌨️ [KEYBOARD] Navigation début');
          }
          break;
        case 'End':
          if (event.ctrlKey || event.metaKey) { // Ctrl+End ou Cmd+End
            event.preventDefault();
            scrollContainer.scrollTo({ left: scrollContainer.scrollWidth, behavior: 'smooth' });
            console.log('⌨️ [KEYBOARD] Navigation fin');
          }
          break;
      }
    };

    // Ajouter l'écouteur d'événements
    document.addEventListener('keydown', handleKeyDown);
    
    // Nettoyer l'écouteur lors du démontage
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);



  // Vérification automatique de l'authentification
  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me", { 
        credentials: "include",
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok && response.status === 401) {
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      setAuthChecked(true);
    } catch (error) {
      console.error("Erreur lors de la vérification d'authentification:", error);
      setAuthChecked(true);
    }
  };

  // Vérifier l'authentification au chargement
  useEffect(() => {
    if (user?.id && !authChecked) {
      checkAuthStatus();
    }
  }, [user?.id, authChecked]);

  const { data: transactions, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user?.id, // Simplifié : charger dès que l'utilisateur est disponible
    staleTime: 0, // Pas de cache pour voir les nouvelles transactions immédiatement
    refetchInterval: false,
    refetchOnWindowFocus: true, // Actualiser quand on revient à l'onglet
    retry: (failureCount, error: any) => {
      // Ne pas réessayer les erreurs 401 (non autorisé)
      if (error?.response?.status === 401 || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 1000,
  });

  const { data: clients, isLoading: clientsLoading, error: clientsError } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: !!user?.id, // Simplifié aussi pour les clients
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Ne pas réessayer les erreurs 401 (non autorisé)
      if (error?.response?.status === 401 || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 1000,
  });

  // Force un refetch des données quand l'utilisateur change ou se connecte
  useEffect(() => {
    if (user?.id) {
      console.log('📊 [HISTORY TAB] Utilisateur connecté, actualisation des données...');
      // Petite pause pour laisser le temps aux données de se synchroniser
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      }, 500);
    }
  }, [user?.id, queryClient]);

  // Écouter les événements WebSocket pour synchronisation après suppression
  useEffect(() => {
    if (!isConnected || !user?.id) return;

    const handleTransactionDeleted = (event: any) => {
      const notification = event.detail;
      
      if (notification?.type === 'TRANSACTION_DELETED_BY_USER' && notification?.refreshNeeded) {
        console.log('🔄 [HISTORY TAB] Suppression détectée via WebSocket, actualisation...');
        
        // Suppression complète du cache et rechargement immédiat
        queryClient.removeQueries({ queryKey: ["/api/transactions"] });
        queryClient.removeQueries({ queryKey: ["/api/stats/user"] });
        
        // Actualisation immédiate des données
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
          queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
        }, 100);
      }
      
      // Écouter également les événements de suppression globaux
      if (notification?.type === 'FORCE_REFRESH' && notification?.reason === 'transaction-deleted') {
        console.log('🔄 [HISTORY TAB] Refresh forcé détecté, actualisation globale...');
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      }
    };

    const handleTransactionCreated = () => {
      console.log('🔄 [HISTORY TAB] Nouvelle transaction créée, actualisation immédiate...');
      
      // Suppression complète du cache et rechargement forcé
      queryClient.removeQueries({ queryKey: ["/api/transactions"] });
      queryClient.removeQueries({ queryKey: ["/api/stats/user"] });
      queryClient.removeQueries({ queryKey: ["/api/clients"] });
      
      // Actualisation immédiate pour afficher la nouvelle transaction
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
        refetchTransactions();
      }, 200);
    };

    // Écouter les événements WebSocket et personnalisés
    window.addEventListener('websocket-message', handleTransactionDeleted);
    window.addEventListener('transaction-created', handleTransactionCreated);

    return () => {
      window.removeEventListener('websocket-message', handleTransactionDeleted);
      window.removeEventListener('transaction-created', handleTransactionCreated);
    };
  }, [isConnected, user?.id, queryClient, refetchTransactions]);

  // Daily stats maintenant calculées directement à partir des transactions filtrées
  // Plus besoin de l'API /api/stats/daily-user pour le total affiché

  // Interface optimisée pour affichage complet des transactions

  const deleteProofMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      return apiRequest("PATCH", `/api/transactions/${transactionId}`, {
        proof: null,
        proofType: null,
        status: "pending",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Preuve supprimée",
        description: "La preuve a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la preuve",
        variant: "destructive",
      });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      return apiRequest("DELETE", `/api/transactions/${transactionId}`, {});
    },
    onSuccess: (data, variables) => {
      // Solution robuste : rechargement immédiat de la page
      toast({
        title: "Transaction supprimée",
        description: "Actualisation en cours...",
      });
      
      // Recharger la page après 500ms pour laisser le toast s'afficher
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la transaction",
        variant: "destructive",
      });
    },
  });

  const cancelTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      return apiRequest("PATCH", `/api/transactions/${transactionId}/cancel`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Transaction annulée",
        description: "La demande d'annulation a été envoyée à l'admin",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'annuler la transaction",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "seen":
        return "bg-blue-100 text-blue-800";
      case "validated":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800 animate-pulse";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En Attente";
      case "seen":
        return "Vue par Admin";
      case "validated":
        return "Validée";
      case "cancelled":
        return "Annulée";
      default:
        return "Inconnu";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3 mr-1" />;
      case "seen":
        return <Eye className="w-3 h-3 mr-1" />;
      case "validated":
        return <Check className="w-3 h-3 mr-1" />;
      case "cancelled":
        return <X className="w-3 h-3 mr-1" />;
      default:
        return <Clock className="w-3 h-3 mr-1" />;
    }
  };

  const getClientName = (transaction: Transaction) => {
    // Utiliser directement clientName de l'API au lieu de rechercher dans la liste
    return transaction.clientName || "Client Occasionnel";
  };

  const getClientInitials = (transaction: Transaction) => {
    const clientName = getClientName(transaction);
    return getInitials(clientName);
  };

  const getClientAvatarColor = (transaction: Transaction) => {
    const colors = ["bg-success", "bg-primary", "bg-purple-500", "bg-warning", "bg-pink-500"];
    return colors[(transaction.clientId || 0) % colors.length];
  };

  const handleDeleteProof = (transactionId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette preuve ?")) {
      deleteProofMutation.mutate(transactionId);
    }
  };

  const handleDeleteTransaction = async (transactionId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette transaction ?")) {
      return;
    }

    try {
      // Afficher le toast avant la suppression
      toast({
        title: "⏳ Suppression en cours...",
        description: "La transaction est en cours de suppression",
        duration: 2000,
      });

      await apiRequest("DELETE", `/api/transactions/${transactionId}`);
      
      console.log(`🗑️ [USER DELETE] Transaction ${transactionId} supprimée par utilisateur ${user?.id}`);
      
      // Suppression complète du cache pour forcer rechargement immédiat
      queryClient.removeQueries({ queryKey: ["/api/transactions"] });
      queryClient.removeQueries({ queryKey: ["/api/stats/user"] });
      queryClient.removeQueries({ queryKey: ["/api/stats/daily-user"] });
      
      // Rechargement forcé immédiat après un délai pour voir le toast
      setTimeout(() => {
        console.log('🔄 [USER DELETE] Rechargement forcé après suppression utilisateur');
        window.location.reload();
      }, 1500); // Délai pour voir le toast de suppression
      
    } catch (error) {
      console.error('❌ [USER DELETE] Erreur suppression transaction:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la transaction",
        variant: "destructive",
      });
    }
  };

  const handleCancelTransaction = async (transactionId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir annuler cette transaction ? L'admin pourra la voir dans l'onglet 'Annulées'.")) {
      return;
    }

    try {
      await apiRequest("PATCH", `/api/transactions/${transactionId}/cancel`);
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily-user"] });
      toast({
        title: "Transaction annulée",
        description: "La transaction a été envoyée dans l'onglet 'Annulées' de l'admin",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la transaction",
        variant: "destructive",
      });
    }
  };

  // Améliorer la gestion d'erreurs avec reconnexion automatique
  if (transactionsError || clientsError) {
    const errorMessage = transactionsError || clientsError;
    const isAuthError = errorMessage?.message?.includes('401') || errorMessage?.message?.includes('Unauthorized');
    
    return (
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-red-600">Problème de connexion</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            {isAuthError 
              ? "Session expirée. Veuillez vous reconnecter." 
              : "Impossible de charger les données. Vérifiez votre connexion."}
          </p>
          <div className="space-y-2">
            <Button onClick={() => {
              if (isAuthError) {
                window.location.href = '/login';
              } else {
                refetchTransactions();
                window.location.reload();
              }
            }}>
              {isAuthError ? "Se reconnecter" : "Réessayer"}
            </Button>
            {!isAuthError && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Actualiser la page
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Afficher un message pendant la vérification d'authentification
  if (!authChecked) {
    return (
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-blue-600">Vérification en cours...</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Connexion au serveur...</p>
        </div>
      </Card>
    );
  }

  // Ne pas afficher de squelette si l'utilisateur est connecté et nous avons au moins une des données
  // Cela évite les boucles infinies de chargement
  const shouldShowSkeleton = !user?.id || (transactionsLoading && !transactions && clientsLoading && !clients);
  
  if (shouldShowSkeleton) {
    return (
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="overflow-x-auto">
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // L'API retourne maintenant un objet avec transactions et pagination
  const actualTransactions = transactions?.transactions || transactions;
  console.log('🔍 [HISTORY TAB] Transaction data received:', {
    isArray: Array.isArray(actualTransactions),
    dataType: typeof actualTransactions,
    transactionCount: actualTransactions?.length || 0,
    sampleTransaction: actualTransactions?.[0]
  });
  
  // Debug des transactions supprimées
  if (actualTransactions) {
    const deletedTransactions = actualTransactions.filter(t => t.isDeleted);
    console.log('🗑️ [HISTORY TAB] Deleted transactions:', {
      count: deletedTransactions.length,
      deletedIds: deletedTransactions.map(t => t.id),
      samples: deletedTransactions.slice(0, 3)
    });
  }
  
  // Sort transactions by date (newest first)
  const sortedTransactions = actualTransactions?.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];

  // Filter transactions by client and date (default aujourd'hui)
  const filteredTransactions = sortedTransactions.filter(transaction => {
    // CORRECTION CRITIQUE : Exclure les transactions supprimées des totaux
    if (transaction.isDeleted) {
      console.log('🗑️ [FILTER] Transaction supprimée exclue:', transaction.id, 'Fee:', transaction.feeAmount);
      return false;
    }
    
    // Filter by client
    if (searchClient.trim()) {
      const clientName = getClientName(transaction).toLowerCase();
      if (!clientName.includes(searchClient.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by date - Par défaut afficher seulement les transactions d'aujourd'hui
    if (selectedDate) {
      // Si une date spécifique est sélectionnée
      const transactionDate = new Date(transaction.createdAt).toISOString().split('T')[0];
      if (transactionDate !== selectedDate) {
        return false;
      }
    } else {
      // Par défaut, afficher seulement les transactions d'aujourd'hui
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
      const transactionDate = new Date(transaction.createdAt).toISOString().split('T')[0];
      
      console.log('🔍 [DATE FILTER] Aujourd\'hui:', todayStr, 'Transaction:', transactionDate, 'ID:', transaction.id, 'FeeAmount:', transaction.feeAmount, 'IsDeleted:', transaction.isDeleted);
      
      if (transactionDate !== todayStr) {
        return false;
      }
    }
    
    return true;
  });

  // Debug détaillé des transactions filtrées
  console.log('📊 [FILTERED TRANSACTIONS] Count:', filteredTransactions.length);
  console.log('📊 [FILTERED TRANSACTIONS] Details:', filteredTransactions.map(t => ({
    id: t.id,
    amountFCFA: t.amountFCFA,
    amountToPay: t.amountToPay,
    feeAmount: t.feeAmount,
    isDeleted: t.isDeleted,
    date: t.createdAt.split('T')[0]
  })));

  // ANALYSE CRITIQUE : Vérifier les transactions du 16 juillet
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = sortedTransactions.filter(t => 
    t.createdAt.split('T')[0] === today
  );
  
  console.log('🔍 [TODAY ANALYSIS] Date aujourd\'hui:', today);
  console.log('🔍 [TODAY ANALYSIS] Transactions du jour total:', todayTransactions.length);
  console.log('🔍 [TODAY ANALYSIS] Transactions actives:', todayTransactions.filter(t => !t.isDeleted).length);
  console.log('🔍 [TODAY ANALYSIS] Transactions supprimées:', todayTransactions.filter(t => t.isDeleted).length);
  
  // Test des frais pour diagnostic
  const activeFees = todayTransactions
    .filter(t => !t.isDeleted)
    .reduce((sum, t) => sum + parseFloat(t.feeAmount || "0"), 0);
  const deletedFees = todayTransactions
    .filter(t => t.isDeleted)
    .reduce((sum, t) => sum + parseFloat(t.feeAmount || "0"), 0);
  
  console.log('🔍 [TODAY ANALYSIS] Frais actifs:', activeFees, 'FCFA');
  console.log('🔍 [TODAY ANALYSIS] Frais supprimés:', deletedFees, 'FCFA');
  console.log('🔍 [TODAY ANALYSIS] Total (bug):', activeFees + deletedFees, 'FCFA');

  // Test du calcul des frais sur filteredTransactions
  const filteredFees = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.feeAmount || "0"), 0);
  console.log('🔍 [FILTERED FEES] Frais des transactions filtrées:', filteredFees, 'FCFA');
  console.log('🔍 [FILTERED FEES] Nombre de transactions filtrées:', filteredTransactions.length);

  // Donner le focus au tableau automatiquement pour la navigation clavier
  useEffect(() => {
    if (tableScrollRef.current && filteredTransactions.length > 0) {
      // Donner le focus au conteneur du tableau après un petit délai
      setTimeout(() => {
        if (tableScrollRef.current) {
          tableScrollRef.current.focus();
          console.log('⌨️ [KEYBOARD] Focus donné au tableau pour navigation clavier');
        }
      }, 500);
    }
  }, [filteredTransactions.length]);

  // Calculer le total des transactions filtrées (toutes par défaut)
  const calculateTodayTotal = () => {
    // CORRECTION : filteredTransactions exclut déjà les transactions supprimées
    // Calculer uniquement le montant FCFA envoyé (sans frais)
    console.log('🔥 [TOTAL START] Starting calculation with', filteredTransactions.length, 'transactions');
    console.log('🔥 [TOTAL START] Transaction IDs:', filteredTransactions.map(t => t.id));
    
    const total = filteredTransactions.reduce((total, transaction) => {
      const amountFCFA = parseFloat(transaction.amountFCFA);
      const amountToPay = parseFloat(transaction.amountToPay);
      console.log('💰 [TOTAL CALC] Transaction:', transaction.id, 'AmountFCFA:', amountFCFA, 'AmountToPay:', amountToPay, 'Running Total:', total + amountFCFA);
      return total + amountFCFA;
    }, 0);
    
    console.log('💰 [TOTAL FINAL] Total Envoyé du Jour (sans frais):', total, 'FCFA');
    console.log('💰 [TOTAL FINAL] Expected: Transaction 843 (1000) + Transaction 844 (5000) = 6000 FCFA');
    console.log('💰 [TOTAL FINAL] Transactions filtrées:', filteredTransactions.length);
    
    return total;
  };

  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  const getUserTransactionNumber = (transactionDate: string, allTransactions: Transaction[]) => {
    // Numérotation spécifique à l'utilisateur : SES transactions D'AUJOURD'HUI SEULEMENT (recommence à 1 chaque jour)
    const transactionDate_obj = new Date(transactionDate);
    
    const userTransactionsToday = allTransactions
      .filter(t => {
        const tDate = new Date(t.createdAt);
        return t.userId === user?.id && tDate.toDateString() === transactionDate_obj.toDateString();
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const currentTransactionIndex = userTransactionsToday.findIndex(t => t.createdAt === transactionDate);
    return currentTransactionIndex + 1;
  };

  const formatDateTime = (dateString: string, allTransactions: Transaction[]) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      const transactionNumber = getUserTransactionNumber(dateString, allTransactions);
      const timeString = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <span>
          <span className="font-bold text-blue-600">{transactionNumber}</span>
          <span className="text-gray-400 mx-1">-</span>
          <span className="text-gray-700">{timeString}</span>
        </span>
      );
    } else if (isYesterday) {
      return `Hier ${date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "Aujourd'hui";
    const date = new Date(selectedDate);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) return "Aujourd'hui";
    
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Affichage des états de chargement et d'erreur
  if (transactionsLoading && !transactions) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span>Chargement de l'historique...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (transactionsError && !transactions) {
    return (
      <div className="space-y-6">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <h3 className="text-lg font-medium text-red-800 mb-1">Erreur de chargement</h3>
            <p className="text-red-600 mb-4">Impossible de charger l'historique des transactions</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-red-300 text-red-700">
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" key={`history-tab-${Date.now()}`}>


      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            <h3 className="text-lg font-semibold text-gray-900">Historique des Transactions</h3>
            <Badge variant="outline">
              {searchClient || selectedDate ? filteredTransactions.length : sortedTransactions.length} transaction{(searchClient || selectedDate ? filteredTransactions.length : sortedTransactions.length) > 1 ? 's' : ''}
            </Badge>
          </div>
        
        {/* Search filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par client..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
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

        {/* Filter badges */}
        {(searchClient || selectedDate) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {searchClient && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                Client: {searchClient}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => setSearchClient("")}
                >
                  ✕
                </Button>
              </Badge>
            )}
            {selectedDate && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date: {new Date(selectedDate).toLocaleDateString("fr-FR")}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => setSelectedDate("")}
                >
                  ✕
                </Button>
              </Badge>
            )}
            <Badge variant="outline">
              {filteredTransactions.length} résultat{filteredTransactions.length > 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </div>
      </Card>



      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">📊 Totaux du Jour</h3>
            <div className="flex flex-col sm:flex-row gap-6 text-base font-medium">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">💰 Total Envoyé:</span>
                <span className="font-bold text-blue-700 text-lg">{formatCurrency(calculateTodayTotal())} FCFA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">📈 Total Frais:</span>
                <span className="font-bold text-green-700 text-lg">
                  {formatCurrency(
                    filteredTransactions.reduce((total, transaction) => {
                      return total + parseFloat(transaction.feeAmount || "0");
                    }, 0)
                  )} FCFA
                </span>
              </div>
            </div>
          </div>
        </div>
        
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="bg-blue-100">
              <th colSpan={7} className="px-6 py-3 text-center">
                <div className="flex justify-center gap-8 text-sm font-medium">
                  <span className="text-blue-700">
                    💰 Total Envoyé: <strong className="text-lg">{formatCurrency(calculateTodayTotal())} FCFA</strong>
                  </span>
                  <span className="text-green-700">
                    📈 Total Frais: <strong className="text-lg">
                      {formatCurrency(
                        filteredTransactions.reduce((total, transaction) => {
                          return total + parseFloat(transaction.feeAmount || "0");
                        }, 0)
                      )} FCFA
                    </strong>
                  </span>
                </div>
              </th>
            </tr>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Heure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro Destinataire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant FCFA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Frais Détaillés
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>

            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className={transaction.status === 'cancelled' ? 'bg-red-50 animate-pulse' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDateTime(transaction.createdAt, transactions || [])}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className={`h-8 w-8 rounded-full ${getClientAvatarColor(transaction)} flex items-center justify-center text-white text-xs font-medium`}>
                        {getClientInitials(transaction)}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {getClientName(transaction)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-mono text-blue-600">
                    {transaction.phoneNumber}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono font-semibold">
                    {formatCurrency(transaction.amountFCFA)} FCFA
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(parseFloat(transaction.amountFCFA) * parseFloat(transaction.exchangeRate))} GNF
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {parseFloat(transaction.feeAmount || "0") > 0 ? (
                    <div>
                      <div className="text-sm text-orange-600 font-semibold">
                        {formatCurrency(transaction.feeAmount || "0")} FCFA
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.feePercentage}% de frais
                      </div>
                      <div className="text-xs text-red-600 font-semibold">
                        Total: {formatCurrency(transaction.amountToPay)} FCFA
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">
                      Aucun frais
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`inline-flex items-center ${getStatusColor(transaction.status)}`}>
                    {getStatusIcon(transaction.status)}
                    {getStatusText(transaction.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.status === "pending" ? (
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Supprimer
                    </button>
                  ) : transaction.status === "seen" ? (
                    <button
                      onClick={() => handleCancelTransaction(transaction.id)}
                      className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-xs font-medium"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Annuler
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>

              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <Clock className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">
                      {selectedDate ? 
                        `Aucune transaction pour le ${new Date(selectedDate).toLocaleDateString("fr-FR")}` :
                        searchClient ? 
                          `Aucune transaction trouvée pour "${searchClient}" aujourd'hui` :
                          "Aucune transaction aujourd'hui"
                      }
                    </p>
                    <p className="text-sm">
                      {selectedDate || searchClient ? 
                        "Essayez de modifier les filtres pour voir d'autres résultats" :
                        "Utilisez le calendrier pour voir les transactions des jours précédents"
                      }
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
    </div>
  );
}
