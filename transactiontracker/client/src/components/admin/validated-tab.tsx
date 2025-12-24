import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Eye, FileText, Image, Check, Trash2, Calendar, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import ProofViewerModal from "@/components/modals/proof-viewer-modal";
import { useNotifications } from "@/hooks/use-notifications";

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
  exchangeRate: string;
  createdAt: string;
  userName: string;
  clientName: string;
}

export default function ValidatedTab() {
  const { toast } = useToast();
  const [searchUser, setSearchUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedProof, setSelectedProof] = useState<{
    proof: string;
    proofType: string;
    transactionId: number;
    clientName: string;
    amount: string;
  } | null>(null);

  const { data: transactions, isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    staleTime: 0,
    gcTime: 30 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    networkMode: 'always',
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    queryFn: async () => {
      const response = await fetch(`/api/transactions?t=${Date.now()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      // L'API retourne maintenant un objet avec transactions et pagination
      const transactions = data.transactions || data;
      console.log("🔍 [VALIDATED] Données API reçues:", transactions?.length || 0, "transactions");
      return Array.isArray(transactions) ? transactions : [];
    },
    placeholderData: (previousData) => previousData,
  });

  // WebSocket temps réel pour affichage instantané
  const { isConnected } = useNotifications();
  
  // Force refresh immédiat quand transaction validée
  useEffect(() => {
    if (isConnected) {
      const handleWebSocketMessage = () => {
        refetch(); // Recharger immédiatement
      };
      
      // Écouter les événements WebSocket
      window.addEventListener('transaction-validated', handleWebSocketMessage);
      window.addEventListener('transaction-updated', handleWebSocketMessage);
      
      return () => {
        window.removeEventListener('transaction-validated', handleWebSocketMessage);
        window.removeEventListener('transaction-updated', handleWebSocketMessage);
      };
    }
  }, [isConnected, refetch]);

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      return apiRequest("DELETE", `/api/transactions/${transactionId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/settings"] });
      toast({
        title: "Transaction supprimée",
        description: "La transaction validée a été supprimée définitivement",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la transaction",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTransaction = (transactionId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette transaction validée ?")) {
      deleteTransactionMutation.mutate(transactionId);
    }
  };

  const handleViewProof = (transaction: Transaction) => {
    if (!transaction.proof) {
      toast({
        title: "Aucune preuve",
        description: "Cette transaction n'a pas de preuve disponible",
        variant: "destructive",
      });
      return;
    }

    setSelectedProof({
      proof: transaction.proof,
      proofType: transaction.proofType || "text",
      transactionId: transaction.id,
      clientName: transaction.clientName,
      amount: `${formatCurrency(transaction.amountFCFA)} FCFA → ${formatCurrency(transaction.amountGNF)} GNF`,
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  // Filtrage intelligent : aujourd'hui par défaut, autres dates via calendrier
  const validatedTransactions = useMemo(() => {
    // L'API retourne maintenant un objet avec transactions et pagination
    const actualTransactions = transactions?.transactions || transactions;
    
    if (!actualTransactions || !Array.isArray(actualTransactions)) {
      console.log("🔍 [VALIDATED DEBUG] Pas de transactions ou format incorrect:", actualTransactions);
      return [];
    }
    
    const allValidated = actualTransactions.filter((t: Transaction) => t.status === "validated");
    
    console.log("🔍 [VALIDATED DEBUG] Structure reçue:", {
      isObject: typeof transactions === 'object',
      hasTransactions: !!transactions?.transactions,
      totalReceived: actualTransactions.length,
      validatedCount: allValidated.length
    });
    
    console.log("🔍 [VALIDATED DEBUG] Échantillon transactions:", actualTransactions.slice(0, 5).map(t => ({
      id: t.id,
      status: t.status,
      createdAt: t.createdAt,
      userId: t.userId
    })));
    
    // Si aucune date sélectionnée = afficher seulement aujourd'hui
    if (!selectedDate) {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      const todayValidated = allValidated.filter((t: Transaction) => {
        const transactionDate = new Date(t.createdAt);
        const transactionDateStr = transactionDate.toISOString().split('T')[0];
        return transactionDateStr === todayStr;
      });
      
      console.log("📅 [VALIDATED] Affichage aujourd'hui:", todayValidated.length, "transactions");
      console.log("📅 [VALIDATED] Date d'aujourd'hui:", todayStr);
      console.log("📅 [VALIDATED] Transactions d'aujourd'hui:", todayValidated.map(t => ({
        id: t.id,
        date: new Date(t.createdAt).toISOString().split('T')[0],
        status: t.status
      })));
      
      return todayValidated.sort((a: Transaction, b: Transaction) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    // Si "all" sélectionné = afficher toutes les transactions
    if (selectedDate === "all") {
      console.log("📅 [VALIDATED] Affichage TOUTES:", allValidated.length, "transactions");
      return allValidated.sort((a: Transaction, b: Transaction) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    // Si date spécifique sélectionnée = afficher cette date
    const dateFiltered = allValidated.filter((t: Transaction) => {
      const transactionDate = new Date(t.createdAt);
      const transactionDateStr = transactionDate.toISOString().split('T')[0];
      return transactionDateStr === selectedDate;
    });
    
    console.log("📅 [VALIDATED] Affichage pour", selectedDate, ":", dateFiltered.length, "transactions");
    return dateFiltered.sort((a: Transaction, b: Transaction) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions, selectedDate]);

  const filteredTransactions = useMemo(() => {
    return validatedTransactions.filter((transaction: Transaction) => {
      const matchesUser = !searchUser || 
        transaction.userName.toLowerCase().includes(searchUser.toLowerCase()) ||
        transaction.clientName.toLowerCase().includes(searchUser.toLowerCase()) ||
        transaction.phoneNumber.toLowerCase().includes(searchUser.toLowerCase());
      // Le filtrage par date est déjà fait dans validatedTransactions
      return matchesUser;
    });
  }, [validatedTransactions, searchUser]);

  // Affichage instantané sans skeleton - utiliser données en cache si disponibles
  if (isLoading && !transactions) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Chargement des transactions validées...</span>
        </div>
      </div>
    );
  }





  const getUserTransactionNumber = (transactionDate: string, userId: number, allTransactions: any[]) => {
    // Récupérer le numéro depuis le cache ou utiliser une logique fallback
    const date = new Date(transactionDate).toISOString().split('T')[0];
    const cacheKey = `${userId}-${date}`;
    
    // Cache basique pour éviter les requêtes multiples
    if (typeof window !== 'undefined' && window.transactionNumberCache) {
      const cached = window.transactionNumberCache.get(cacheKey);
      if (cached) {
        return cached.numberMap[transactionDate] || 1;
      }
    }
    
    // Fallback: calculer depuis les transactions locales
    if (!allTransactions) return 1;
    
    const transactionDate_obj = new Date(transactionDate);
    const transactionDateString = transactionDate_obj.toDateString();
    
    const userTransactionsThisDay = allTransactions
      .filter(t => {
        const tDate = new Date(t.createdAt);
        return t.userId === userId && tDate.toDateString() === transactionDateString;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    const currentTransactionIndex = userTransactionsThisDay.findIndex(t => t.createdAt === transactionDate);
    return Math.max(1, currentTransactionIndex + 1);
  };

  const formatDateTime = (dateString: string, allTransactions: any[], transaction?: any) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday && transaction) {
      const userNumber = getUserTransactionNumber(dateString, transaction.userId, allTransactions);
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
    } else if (isYesterday && transaction) {
      const userNumber = getUserTransactionNumber(dateString, transaction.userId, allTransactions);
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
    } else if (transaction) {
      const userNumber = getUserTransactionNumber(dateString, transaction.userId, allTransactions);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Transactions Validées</h3>
          <p className="text-sm text-gray-600">
            {selectedDate ? 
              `Transactions du ${new Date(selectedDate).toLocaleDateString("fr-FR")}` :
              "Toutes les transactions validées"
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="bg-success text-white">
            <Check className="w-3 h-3 mr-1" />
            {filteredTransactions.length} validée{filteredTransactions.length > 1 ? 's' : ''}
          </Badge>
          {!selectedDate ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                📅 Aujourd'hui seulement
              </span>
              <div className="flex items-center space-x-1">

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate("all")}
                  className="text-xs h-6 px-2"
                >
                  Toutes
                </Button>
              </div>
            </div>
          ) : selectedDate === "all" ? (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                📊 Toutes les transactions
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate("")}
                className="text-xs h-6 px-2"
              >
                Retour aujourd'hui
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                📅 {new Date(selectedDate).toLocaleDateString('fr-FR')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate("")}
                className="text-xs h-6 px-2"
              >
                Aujourd'hui
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('🔄 [REFRESH] Actualisation des transactions validées déclenchée');
              // Force refresh de toutes les données critiques
              queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
              queryClient.invalidateQueries({ queryKey: ['/api/transactions/pending'] });
              queryClient.invalidateQueries({ queryKey: ['/api/stats/pending-count'] });
              queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
              queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
              queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
              queryClient.invalidateQueries({ queryKey: ['/api/stats/cancellation-count'] });
              
              // Force refetch immédiat
              refetch();
              
              // Toast de confirmation
              toast({
                title: "Actualisation en cours",
                description: "Toutes les données sont en cours d'actualisation...",
                duration: 2000,
              });
            }}
            disabled={isLoading}
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            <Eye className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres de recherche */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par utilisateur, client ou téléphone..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="date"
            value={selectedDate === "all" ? "" : selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10"
            placeholder="Choisir une date..."
          />
        </div>
      </div>

      {/* Badges informatifs */}
      {(searchUser || selectedDate) && (
        <div className="flex flex-wrap gap-2">
          {searchUser && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Utilisateur: {searchUser}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => setSearchUser("")}
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



      {/* Desktop Table */}
      <Card className="hidden sm:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Destinataire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant GNF
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(transaction.createdAt, Array.isArray(transactions) ? transactions : [], transaction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {transaction.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {formatCurrency(transaction.amountGNF)} GNF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      {/* Icône validée (verte fixe) */}
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      </div>
                      
                      {/* Bouton voir preuve si elle existe */}
                      {transaction.proof && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProof(transaction)}
                          className="w-5 h-5 sm:w-6 sm:h-6 p-0 text-blue-500 hover:bg-blue-100"
                        >
                          {transaction.proofType === "text" ? (
                            <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          ) : (
                            <Image className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          )}
                        </Button>
                      )}
                      
                      {/* Bouton supprimer */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        disabled={deleteTransactionMutation.isPending}
                        className="w-5 h-5 sm:w-6 sm:h-6 p-0 text-red-500 hover:bg-red-100"
                      >
                        <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-6 sm:p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">📭</div>
            <p className="text-gray-600 font-medium">
              {selectedDate === "all" ? 
                "Aucune transaction validée dans la base de données" :
                selectedDate ? 
                  `Aucune transaction validée le ${new Date(selectedDate).toLocaleDateString("fr-FR")}` :
                  searchUser ? 
                    `Aucune transaction trouvée pour "${searchUser}"` :
                    "Aucune transaction validée aujourd'hui"
              }
            </p>
            <p className="text-sm text-gray-400 mt-3">
              {!selectedDate && !searchUser ? 
                "Utilisez le bouton 'Voir toutes' pour consulter les transactions des autres jours" :
                selectedDate === "all" ?
                  `Total de ${transactions?.length || 0} transactions dans la base (toutes statuts confondus)` :
                  "Essayez de changer la date ou effacer les filtres"
              }
            </p>
          </div>
        )}
      </Card>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filteredTransactions.map((transaction) => (
          <Card key={transaction.id} className="border-l-4 border-success">
            <div className="p-4">
              {/* Header avec date et actions */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500">
                  {formatDateTime(transaction.createdAt, Array.isArray(transactions) ? transactions : [], transaction)}
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  {transaction.proof && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProof(transaction)}
                      className="p-0.5 h-5 w-5 text-blue-500 hover:bg-blue-50"
                    >
                      {transaction.proofType === "text" ? (
                        <FileText className="w-2.5 h-2.5" />
                      ) : (
                        <Image className="w-2.5 h-2.5" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    disabled={deleteTransactionMutation.isPending}
                    className="p-0.5 h-5 w-5 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </div>

              {/* Informations principales */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">Utilisateur:</span>
                  <span className="text-sm font-medium text-gray-900 text-right flex-1 truncate ml-2">
                    {transaction.userName}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">Numéro:</span>
                  <span className="text-sm font-medium text-gray-700 text-right flex-1 break-all ml-2">
                    {transaction.phoneNumber}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">Montant:</span>
                  <span className="text-sm font-semibold text-green-600 text-right flex-1 break-all ml-2">
                    {formatCurrency(transaction.amountGNF)} GNF
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredTransactions.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-gray-500">
              {selectedDate ? 
                `Aucune transaction validée pour le ${new Date(selectedDate).toLocaleDateString("fr-FR")}` :
                searchUser ? 
                  `Aucune transaction trouvée pour "${searchUser}" aujourd'hui` :
                  "Aucune transaction validée aujourd'hui"
              }
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {selectedDate || searchUser ? 
                "Essayez de modifier les filtres pour voir d'autres résultats" :
                "Utilisez le calendrier pour voir les transactions des jours précédents"
              }
            </p>
          </Card>
        )}
      </div>

      {/* Modal de visualisation et partage des preuves */}
      <ProofViewerModal
        isOpen={!!selectedProof}
        onClose={() => setSelectedProof(null)}
        proof={selectedProof?.proof || null}
        proofType={selectedProof?.proofType || null}
        transactionId={selectedProof?.transactionId || 0}
        clientName={selectedProof?.clientName}
        amount={selectedProof?.amount}
      />
    </div>
  );
}