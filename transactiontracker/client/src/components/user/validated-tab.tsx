import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/hooks/use-notifications";
import { queryClient } from "@/lib/queryClient";
import { Calendar, Eye, Search, Share2, RefreshCw, X, Copy, Check } from "lucide-react";

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

export default function ValidatedTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isConnected } = useNotifications();
  const [searchClient, setSearchClient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedProof, setSelectedProof] = useState<{
    proof: string;
    proofType: string;
    transactionId: number;
    clientName: string;
    amount: string;
  } | null>(null);
  const [copiedProof, setCopiedProof] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const { data: transactions, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user?.id,
    staleTime: 0,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 1000,
    queryFn: async () => {
      const response = await fetch(`/api/transactions?userId=${user?.id}&t=${Date.now()}`, { 
        credentials: "include",
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      // L'API retourne maintenant un objet avec transactions et pagination
      const transactions = data.transactions || data;
      console.log("🔍 [VALIDATED USER] Données API reçues:", transactions?.length || 0, "transactions");
      return Array.isArray(transactions) ? transactions : [];
    }
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    enabled: !!user?.id,
    staleTime: 300000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: 1000,
  });

  // Écouter les événements WebSocket pour synchronisation
  useEffect(() => {
    if (!isConnected || !user?.id) return;

    const handleTransactionValidated = (event: any) => {
      console.log('🔄 [VALIDATED TAB] Transaction validée détectée, actualisation...');
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    };

    document.addEventListener('transaction-validated', handleTransactionValidated);
    return () => {
      document.removeEventListener('transaction-validated', handleTransactionValidated);
    };
  }, [isConnected, user?.id]);

  const handleViewProof = (transaction: Transaction) => {
    if (!transaction.proof) {
      toast({
        title: "Aucune preuve",
        description: "Cette transaction n'a pas de preuve de paiement",
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
    setCopiedProof(false); // Reset copy status when opening new proof
  };

  const handleCopyProof = async () => {
    if (!selectedProof) return;
    
    try {
      if (selectedProof.proofType === "image") {
        // Pour les images, copier l'URL de l'image
        await navigator.clipboard.writeText(selectedProof.proof);
        toast({
          title: "Copié !",
          description: "L'URL de l'image a été copiée dans le presse-papiers"
        });
      } else {
        // Pour le texte, copier le contenu directement
        await navigator.clipboard.writeText(selectedProof.proof);
        toast({
          title: "Copié !",
          description: "Le texte de la preuve a été copié dans le presse-papiers"
        });
      }
      setCopiedProof(true);
      // Reset après 2 secondes
      setTimeout(() => setCopiedProof(false), 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papiers",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const getClientName = (transaction: Transaction) => {
    return transaction.clientName || "Client non trouvé";
  };

  const getClientInitials = (transaction: Transaction) => {
    const name = getClientName(transaction);
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const getClientAvatarColor = (transaction: Transaction) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
    ];
    const name = getClientName(transaction);
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Fonction pour calculer le numéro de transaction quotidien (comme dans l'historique)
  const getUserTransactionNumber = (transactionDate: string, allTransactions: any[]) => {
    if (!allTransactions) return 0;
    
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

  // Fonction pour formater la date/heure avec numéros corrects
  const formatDateTime = (dateString: string, allTransactions: any[]) => {
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

  // Filtrage intelligent : aujourd'hui par défaut, autres dates via calendrier
  const validatedTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }

    const allValidated = transactions.filter((t: Transaction) => t.status === "validated");
    
    console.log("🔍 [VALIDATED USER DEBUG] Toutes les transactions:", transactions.length);
    console.log("🔍 [VALIDATED USER DEBUG] Transactions validées:", allValidated.length);

    // Si aucune date sélectionnée = afficher seulement aujourd'hui
    if (!selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayValidated = allValidated.filter((t: Transaction) => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= today && transactionDate < tomorrow;
      });
      
      console.log("📅 [VALIDATED USER] Affichage aujourd'hui:", todayValidated.length, "transactions");
      return todayValidated.sort((a: Transaction, b: Transaction) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Si "all" sélectionné = afficher toutes les transactions
    if (selectedDate === "all") {
      console.log("📅 [VALIDATED USER] Affichage TOUTES:", allValidated.length, "transactions");
      return allValidated.sort((a: Transaction, b: Transaction) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Si date spécifique sélectionnée = afficher cette date
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    const nextDay = new Date(selectedDateObj);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const dateFiltered = allValidated.filter((t: Transaction) => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate >= selectedDateObj && transactionDate < nextDay;
    });
    
    console.log("📅 [VALIDATED USER] Affichage pour", selectedDate, ":", dateFiltered.length, "transactions");
    return dateFiltered.sort((a: Transaction, b: Transaction) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [transactions, selectedDate]);

  const filteredTransactions = useMemo(() => {
    return validatedTransactions.filter((transaction: Transaction) => {
      const clientName = getClientName(transaction);
      const matchesClient = !searchClient || 
        clientName.toLowerCase().includes(searchClient.toLowerCase()) ||
        transaction.phoneNumber.toLowerCase().includes(searchClient.toLowerCase());
      return matchesClient;
    });
  }, [validatedTransactions, searchClient]);

  const handleManualRefresh = () => {
    console.log('🔄 [VALIDATED USER] Actualisation manuelle...');
    queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    toast({
      title: "Actualisation",
      description: "Données mises à jour",
    });
  };

  if (transactionsLoading && !transactions) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600">Chargement des transactions validées...</span>
        </div>
      </div>
    );
  }

  if (transactionsError) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement des transactions</p>
          <Button onClick={() => refetchTransactions()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Transactions Validées
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleManualRefresh}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par client ou numéro..."
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSelectedDate(selectedDate === "all" ? "" : "all")}
              variant={selectedDate === "all" ? "default" : "outline"}
              size="sm"
            >
              {selectedDate === "all" ? "Aujourd'hui" : "Toutes"}
            </Button>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="date"
                value={selectedDate === "all" ? "" : selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 w-40"
                disabled={selectedDate === "all"}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto" ref={tableScrollRef}>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {selectedDate === "all" ? 
                "Aucune transaction validée trouvée" : 
                selectedDate ? 
                `Aucune transaction validée pour le ${selectedDate}` : 
                "Aucune transaction validée aujourd'hui"
              }
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <p>• Les transactions validées s'affichent ici avec leur preuve</p>
              <p>• Utilisez le calendrier pour voir les autres dates</p>
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preuve
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDateTime(transaction.createdAt, transactions)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getClientAvatarColor(transaction)} flex items-center justify-center`}>
                        <span className="text-xs font-medium text-white">
                          {getClientInitials(transaction)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {getClientName(transaction)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(transaction.amountFCFA)} FCFA
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(transaction.amountGNF)} GNF
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-xs text-green-700">Validée</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      onClick={() => handleViewProof(transaction)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal pour afficher la preuve */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Preuve de Paiement
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedProof.clientName} - {selectedProof.amount}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleCopyProof}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {copiedProof ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    onClick={() => setSelectedProof(null)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6">
              {selectedProof.proofType === "image" ? (
                <img
                  src={selectedProof.proof}
                  alt="Preuve de paiement"
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedProof.proof}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}