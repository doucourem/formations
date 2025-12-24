import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useSmartRefresh } from "@/hooks/use-smart-refresh";
import { Search, Calendar, Coins, Eye, Check } from "lucide-react";

interface Transaction {
  id: number;
  userId: number;
  clientId: number;
  phoneNumber: string;
  amountFCFA: string;
  amountGNF: string;
  exchangeRate: string;
  status: "pending" | "seen" | "validated" | "cancelled";
  proof?: string;
  proofType?: "image" | "text";
  createdAt: string;
  clientName?: string;
  feeAmount?: string;
  feePercentage?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: number;
}

interface Client {
  id: number;
  name: string;
  userId: number;
}

export default function HistoryTab() {
  const { user } = useAuth();
  const [searchClient, setSearchClient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const smartRefresh = useSmartRefresh();

  // Charger les transactions avec pagination
  const { data: transactionData, isLoading: transactionsLoading, refetch: refetchTransactions } = useQuery<{
    transactions: Transaction[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  } | Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user?.id,
    staleTime: 30000, // 30 secondes - données fraîches mais pas intrusives
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Extraire les transactions du format de réponse (compatible avec ancien et nouveau format)
  const transactions = Array.isArray(transactionData) 
    ? transactionData 
    : (transactionData?.transactions || []);

  // Debug pour vérifier les données reçues (activé seulement en développement)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [HISTORY TAB] Transaction data received:', {
      isArray: Array.isArray(transactionData),
      dataType: typeof transactionData,
      transactionCount: transactions.length,
      sampleTransaction: transactions[0]
    });
    
    // Debug spécifique pour les transactions supprimées
    const deletedTransactions = transactions.filter(t => t.isDeleted);
    console.log('🗑️ [HISTORY TAB] Deleted transactions:', {
      count: deletedTransactions.length,
      deletedIds: deletedTransactions.map(t => t.id),
      samples: deletedTransactions.slice(0, 2)
    });
  }

  // Charger les clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: !!user?.id,
    staleTime: 300000,
  });

  // Mutation pour supprimer une transaction
  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      return apiRequest("DELETE", `/api/transactions/${transactionId}`, {});
    },
    onSuccess: (data, transactionId) => {
      toast({
        title: "✅ Transaction supprimée",
        description: `La transaction #${transactionId} a été supprimée avec succès.`,
      });
      
      // Utiliser le système de rafraîchissement intelligent immédiat
      console.log('🔄 [DELETE SUCCESS] Triggering smart refresh...');
      smartRefresh.refreshUserData();
      
      // Forcer une actualisation complète immédiate
      setTimeout(() => {
        smartRefresh.refreshAll();
      }, 100);
    },
    onError: (error: any) => {
      console.error('Delete transaction error:', error);
      toast({
        title: "❌ Erreur",
        description: error?.message || "Impossible de supprimer la transaction.",
        variant: "destructive",
      });
    },
  });

  // Mutation pour annuler une transaction
  const cancelTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      return apiRequest("PATCH", `/api/transactions/${transactionId}/cancel`, {});
    },
    onSuccess: () => {
      toast({
        title: "Transaction annulée",
        description: "La transaction a été annulée avec succès.",
      });
      
      // Invalider les queries pour rafraîchir les données sans recharger la page
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/can-send"] });
      queryClient.refetchQueries({ queryKey: ["/api/transactions"] });
      queryClient.refetchQueries({ queryKey: ["/api/stats/user"] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la transaction.",
        variant: "destructive",
      });
    },
  });



  // Fonction pour obtenir le nom du client
  const getClientName = (transaction: Transaction) => {
    // Utiliser d'abord le nom du client enrichi par le serveur
    if ((transaction as any).clientName) {
      return (transaction as any).clientName;
    }
    // Sinon, chercher dans la liste des clients
    const client = clients.find(c => c.id === transaction.clientId);
    return client?.name || "Client Occasionnel";
  };

  // Filtrer et trier les transactions (s'assurer que transactions est un tableau)
  const sortedTransactions = Array.isArray(transactions) 
    ? transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  const filteredTransactions = sortedTransactions.filter(transaction => {
    // Filtrer par client
    if (searchClient.trim()) {
      const clientName = getClientName(transaction).toLowerCase();
      if (!clientName.includes(searchClient.toLowerCase())) {
        return false;
      }
    }
    
    // Filtrer par date
    if (selectedDate) {
      const transactionDate = new Date(transaction.createdAt).toISOString().split('T')[0];
      if (transactionDate !== selectedDate) {
        return false;
      }
    } else {
      // Par défaut, afficher les transactions d'aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const transactionDate = new Date(transaction.createdAt);
      if (transactionDate < today || transactionDate >= tomorrow) {
        return false;
      }
    }
    
    return true;
  });

  // Formater la devise
  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  };

  // Formater l'heure
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Calculer le total (montant envoyé + frais) en excluant les transactions supprimées
  const calculateTodayTotal = () => {
    return filteredTransactions.reduce((total, transaction) => {
      // Exclure les transactions supprimées du calcul
      if (transaction.isDeleted) {
        return total;
      }
      const amountFCFA = parseFloat(transaction.amountFCFA);
      const feeAmount = parseFloat(transaction.feeAmount || "0");
      return total + amountFCFA + feeAmount;
    }, 0);
  };

  const formatSelectedDate = () => {
    if (selectedDate) {
      return new Date(selectedDate + 'T12:00:00').toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric"
      });
    }
    return "Aujourd'hui";
  };

  // Obtenir le numéro de transaction du jour
  const getUserTransactionNumber = (transactionDate: string, allTransactions: Transaction[]) => {
    const transactionDate_obj = new Date(transactionDate);
    const transactionDateString = transactionDate_obj.toDateString();
    
    // Filtrer les transactions du même jour que la transaction actuelle
    const dayTransactions = allTransactions
      .filter(t => {
        const tDate = new Date(t.createdAt);
        return tDate.toDateString() === transactionDateString;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const currentTransactionIndex = dayTransactions.findIndex(t => t.createdAt === transactionDate);
    return Math.max(1, currentTransactionIndex + 1);
  };

  if (transactionsLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="text-center">Chargement des données...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rechercher par client</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nom du client..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tableau des transactions */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              📊 Rapport Quotidien ({formatSelectedDate()})
            </h3>
            <div className="flex flex-col sm:flex-row gap-6 text-base font-medium">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">💰 Total Envoyé:</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatCurrency(
                    filteredTransactions.reduce((total, transaction) => {
                      if (transaction.isDeleted) return total;
                      return total + parseFloat(transaction.amountFCFA);
                    }, 0)
                  )} FCFA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700">📈 Total Frais:</span>
                <span className="font-bold text-red-600 text-lg">
                  {formatCurrency(
                    filteredTransactions.reduce((total, transaction) => {
                      if (transaction.isDeleted) return total;
                      return total + parseFloat(transaction.feeAmount || "0");
                    }, 0)
                  )} FCFA
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div 
            ref={tableScrollRef}
            className="overflow-x-auto" 
            style={{ 
              WebkitOverflowScrolling: 'touch', 
              overscrollBehaviorX: 'contain',
              scrollbarWidth: 'auto',
              touchAction: 'pan-x pan-y',
              minHeight: '44px'
            }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° - Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">
                    Montant FCFA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">
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
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      Aucune transaction trouvée pour les critères sélectionnés
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                            {getUserTransactionNumber(transaction.createdAt, sortedTransactions)}
                          </span>
                          <span className="text-gray-600 font-medium">
                            {formatTime(transaction.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-blue-700 font-semibold">
                          {getClientName(transaction)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-gray-700 font-mono">
                          {transaction.phoneNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="text-green-700 font-bold">
                          {formatCurrency(transaction.amountFCFA)} FCFA
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {parseFloat(transaction.feeAmount || "0") > 0 ? (
                          <span className="text-orange-700 font-semibold">
                            {formatCurrency(transaction.feeAmount || "0")} FCFA 
                            <span className="text-orange-600 ml-1">({transaction.feePercentage || "0"}%)</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Aucun frais</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.isDeleted ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
                            🗑️ SUPPRIMÉE
                          </Badge>
                        ) : (
                          <Badge 
                            variant={transaction.status === "validated" ? "default" : 
                                     transaction.status === "seen" ? "secondary" : 
                                     transaction.status === "pending" ? "outline" : "destructive"}
                            className={transaction.status === "seen" ? "bg-blue-100 text-blue-800" : ""}
                          >
                            <div className="flex items-center">
                              {transaction.status === "validated" && <Check className="w-3 h-3 mr-1" />}
                              {transaction.status === "seen" && <Eye className="w-3 h-3 mr-1" />}
                              {transaction.status === "validated" ? "Validée" :
                               transaction.status === "seen" ? "Vue par Admin" :
                               transaction.status === "pending" ? "En Attente" : "Annulée"}
                            </div>
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {transaction.isDeleted ? (
                            <span className="text-red-600 text-sm italic">
                              Supprimée {transaction.deletedAt && `le ${new Date(transaction.deletedAt).toLocaleDateString("fr-FR")}`}
                            </span>
                          ) : (
                            <>
                              {/* Supprimer si admin n'a pas vu (status = pending) */}
                              {transaction.status === "pending" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteTransactionMutation.mutate(transaction.id)}
                                  disabled={deleteTransactionMutation.isPending}
                                >
                                  {deleteTransactionMutation.isPending ? "Suppression..." : "Supprimer"}
                                </Button>
                              )}
                              
                              {/* Annuler si admin a vu (status = seen) */}
                              {transaction.status === "seen" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                  onClick={() => cancelTransactionMutation.mutate(transaction.id)}
                                  disabled={cancelTransactionMutation.isPending}
                                >
                                  {cancelTransactionMutation.isPending ? "..." : "Annuler"}
                                </Button>
                              )}
                              
                              {/* Transaction Validée si il y a une preuve soumise et validée */}
                              {transaction.status === "validated" && transaction.proof && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Transaction Validée
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Résumé */}
        {filteredTransactions.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}
              </span>
              <span className="font-semibold text-gray-900">
                Total: {formatCurrency(calculateTodayTotal())} FCFA
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}