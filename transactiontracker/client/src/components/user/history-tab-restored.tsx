import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Clock, Check, Trash2, X, AlertTriangle, Calendar, Search, Eye } from "lucide-react";
import { useState, useMemo } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { useSyncManager } from "@/hooks/use-sync-manager";

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
  const [searchClient, setSearchClient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [autoSelectedYesterday, setAutoSelectedYesterday] = useState(false);

  // Utiliser le gestionnaire de synchronisation centralisé
  useSyncManager();

  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/transactions?userId=${user?.id}`, { 
        credentials: "include",
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id,
    staleTime: 300000, // Cache de 5 minutes pour stabilité
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const response = await fetch(`/api/clients?userId=${user?.id}`, { 
        credentials: "include",
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // Get daily stats for the selected date
  const { data: dailyStats } = useQuery({
    queryKey: ["/api/stats/daily-user", user?.id, selectedDate],
    queryFn: () => {
      const dateParam = selectedDate || new Date().toISOString().split('T')[0];
      return fetch(`/api/stats/daily-user?userId=${user?.id}&date=${dateParam}`, { credentials: "include" }).then(res => res.json());
    },
    enabled: !!user?.id,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // Debug removed to prevent console spam causing UI instability

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

  const getClientName = (clientId: number) => {
    const client = clients?.find(c => c.id === clientId);
    return client?.name || "Client Inconnu";
  };

  const getClientInitials = (clientId: number) => {
    const clientName = getClientName(clientId);
    return getInitials(clientName);
  };

  const getClientAvatarColor = (clientId: number) => {
    const colors = ["bg-success", "bg-primary", "bg-purple-500", "bg-warning", "bg-pink-500"];
    return colors[clientId % colors.length];
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
      await apiRequest("DELETE", `/api/transactions/${transactionId}`);
      
      // Invalider toutes les requêtes de cache liées aux données utilisateur
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily-user"] });
      
      // Invalider spécifiquement les stats quotidiennes avec l'ID utilisateur et toutes les dates
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily-user", user?.id, today] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily-user", user?.id, selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily-user", user?.id, ""] });
      
      // Forcer le rechargement immédiat des données avec cache clear
      queryClient.removeQueries({ queryKey: ["/api/stats/daily-user"] });
      queryClient.refetchQueries({ queryKey: ["/api/stats/daily-user"] });
      
      // Rechargement complet des statistiques
      window.location.reload();
      
      toast({
        title: "Transaction supprimée",
        description: "La transaction a été supprimée définitivement",
      });
    } catch (error) {
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

  if (transactionsLoading || clientsLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="overflow-x-auto">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Sort transactions by date (newest first)
  const sortedTransactions = transactions?.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];

  // Filter transactions by client and date (default today)
  const filteredTransactions = sortedTransactions.filter(transaction => {
    // Filter by client
    if (searchClient.trim()) {
      const clientName = getClientName(transaction.clientId).toLowerCase();
      if (!clientName.includes(searchClient.toLowerCase())) {
        return false;
      }
    }
    
    // Filter by date - default today, or selected date
    const today = new Date().toISOString().split('T')[0];
    const filterDate = selectedDate || today;
    const transactionDate = new Date(transaction.createdAt).toISOString().split('T')[0];
    
    if (transactionDate !== filterDate) {
      return false;
    }
    
    return true;
  });

  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  const getTodayTransactionNumber = (transactionDate: string, allTransactions: Transaction[]) => {
    const today = new Date();
    const todayTransactions = allTransactions
      .filter(t => {
        const tDate = new Date(t.createdAt);
        return tDate.toDateString() === today.toDateString();
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const currentTransactionIndex = todayTransactions.findIndex(t => t.createdAt === transactionDate);
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
      const transactionNumber = getTodayTransactionNumber(dateString, allTransactions);
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

  return (
    <div className="space-y-6">
      {/* Daily Total Card */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-700 p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-blue-100 text-xs sm:text-sm font-medium truncate">
              Total Envoyé ({formatSelectedDate()})
            </p>
            <p className="text-lg sm:text-2xl font-bold text-white break-words">
              {formatCurrency(dailyStats?.totalSentDay || 0)} FCFA
            </p>
            <p className="text-blue-100 text-xs mt-1">
              {dailyStats?.transactionCount || 0} transaction{(dailyStats?.transactionCount || 0) > 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-blue-200 flex-shrink-0 ml-2">
            <Calendar size={32} />
          </div>
        </div>
      </Card>

      {/* Fees Summary Card - Only show if there are actual transactions with fees */}
      {filteredTransactions && filteredTransactions.length > 0 && 
       filteredTransactions.some(t => parseFloat(t.feeAmount || "0") > 0) && (
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-orange-100 text-xs sm:text-sm font-medium truncate">
                Total des Frais ({formatSelectedDate()})
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white break-words">
                {formatCurrency(
                  filteredTransactions.reduce((sum, t) => {
                    const feeAmount = parseFloat(t.feeAmount || "0");
                    return sum + feeAmount;
                  }, 0)
                )} FCFA
              </p>
              <p className="text-orange-100 text-xs mt-1">
                Frais appliqués sur {filteredTransactions.filter(t => parseFloat(t.feeAmount || "0") > 0).length} transaction{filteredTransactions.filter(t => parseFloat(t.feeAmount || "0") > 0).length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-orange-200 flex-shrink-0 ml-2" style={{ fontSize: '32px' }}>
              💰
            </div>
          </div>
        </Card>
      )}

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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
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
                Montant Envoyé
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
                      <div className={`h-8 w-8 rounded-full ${getClientAvatarColor(transaction.clientId)} flex items-center justify-center text-white text-xs font-medium`}>
                        {getClientInitials(transaction.clientId)}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {getClientName(transaction.clientId)}
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
                  <div className="text-sm text-gray-900 font-mono">
                    {formatCurrency(transaction.amountFCFA)} FCFA
                  </div>
                  {parseFloat(transaction.feeAmount || "0") > 0 && (
                    <div className="text-xs text-orange-600">
                      + {formatCurrency(transaction.feeAmount || "0")} FCFA frais ({transaction.feePercentage}%)
                    </div>
                  )}
                  {parseFloat(transaction.amountToPay) !== parseFloat(transaction.amountFCFA) && (
                    <div className="text-xs text-red-600 font-semibold">
                      Dette: {formatCurrency(transaction.amountToPay)} FCFA
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
