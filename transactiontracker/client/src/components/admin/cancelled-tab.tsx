import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Trash2, Calendar, Search, X } from "lucide-react";

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

export default function CancelledTab() {
  const { toast } = useToast();
  const [searchUser, setSearchUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const { data: transactionsData, isLoading } = useQuery<{transactions: Transaction[], pagination: any}>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions", { 
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        console.error('Failed to fetch transactions:', response.status);
        return { transactions: [], pagination: {} };
      }
      const data = await response.json();
      // Handle both old format (array) and new format (object with transactions)
      if (Array.isArray(data)) {
        return { transactions: data, pagination: {} };
      }
      return data;
    },
    refetchInterval: 120000, // Actualisation toutes les 2 minutes
    refetchOnWindowFocus: true,
  });

  // Extract transactions array from the response
  const transactions = transactionsData?.transactions || [];
  
  // Sort transactions by date (newest first)
  const sortedTransactions = transactions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Filter transactions by user and optionally by date
  const filteredTransactions = sortedTransactions.filter(transaction => {
    // Filter by user
    if (searchUser.trim()) {
      const userName = transaction.userName.toLowerCase();
      if (!userName.includes(searchUser.toLowerCase())) {
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

  // Filter only cancelled transactions - check multiple possible statuses
  const cancelledTransactions = filteredTransactions.filter(t => 
    t.status === 'cancelled' || 
    t.status === 'canceled' || 
    t.status === 'annulée' || 
    t.status === 'annulee' ||
    t.status === 'rejected'
  ) || [];

  const deleteTransactionMutation = useMutation({
    mutationFn: async (transactionId: number) => {
      return apiRequest("DELETE", `/api/transactions/${transactionId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/users"] });
      toast({
        title: "Succès",
        description: "Transaction supprimée définitivement",
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

  const handleDeleteCancelledTransaction = (transactionId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement cette transaction annulée ?")) {
      deleteTransactionMutation.mutate(transactionId);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cancelled":
        return "bg-red-100 text-red-800 animate-pulse";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "cancelled":
        return "Annulée";
      default:
        return "Inconnu";
    }
  };

  const getTodayTransactionNumber = (transactionDate: string, allTransactions: any[]) => {
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

  const formatDateTime = (dateString: string, allTransactions: any[]) => {
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      {/* Cancelled transactions section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Transactions Annulées</h2>
          <Badge variant="destructive" className="px-3 py-1">
            {cancelledTransactions.length} transaction{cancelledTransactions.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="space-y-6">
          {cancelledTransactions.length === 0 ? (
            <Card className="p-8 text-center">
              <X className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction annulée</h3>
              <p className="text-gray-500">Les transactions annulées par les utilisateurs apparaîtront ici.</p>
              <div className="mt-4 text-sm text-gray-400">
                <p>Statuts recherchés : cancelled, canceled, annulée, annulee, rejected</p>
                <p>Total des transactions : {sortedTransactions.length}</p>
              </div>
            </Card>
          ) : (
            cancelledTransactions.map((transaction) => (
              <Card key={transaction.id} className="border-l-4 border-red-500 bg-red-50">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="bg-red-500 p-1.5 sm:p-3 rounded-full flex-shrink-0">
                        <X className="text-white" size={12} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{transaction.userName}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{formatDateTime(transaction.createdAt, transactions || [])}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    <Card className="bg-white p-3 sm:p-4">
                      <p className="text-xs text-gray-600">Téléphone</p>
                      <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">{transaction.phoneNumber}</p>
                    </Card>
                    <Card className="bg-white p-3 sm:p-4">
                      <p className="text-xs text-gray-600">Montant FCFA</p>
                      <p className="text-sm sm:text-base font-semibold text-primary break-words">
                        {formatCurrency(transaction.amountFCFA)}
                      </p>
                    </Card>
                    <Card className="bg-white p-3 sm:p-4">
                      <p className="text-xs text-gray-600">Montant GNF</p>
                      <p className="text-sm sm:text-base font-semibold text-secondary break-words">
                        {formatCurrency(transaction.amountGNF)}
                      </p>
                    </Card>
                    <Card className="bg-white p-3 sm:p-4">
                      <p className="text-xs text-gray-600">À Payer</p>
                      <p className="text-sm sm:text-base font-semibold text-orange-600 break-words">
                        {formatCurrency(transaction.amountToPay)}
                      </p>
                    </Card>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                    <Badge className={`px-3 py-1 ${getStatusColor(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCancelledTransaction(transaction.id)}
                      disabled={deleteTransactionMutation.isPending}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      <Trash2 className="w-3 h-3 mr-1.5 sm:w-4 sm:h-4 sm:mr-2" />
                      Supprimer Définitivement
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}