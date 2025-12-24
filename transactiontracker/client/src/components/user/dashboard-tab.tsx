import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { AlertTriangle, Send, CheckCircle, Eye, Copy } from "lucide-react";
import { useSyncManager } from "@/hooks/use-sync-manager";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTransactionNumbers } from "@/hooks/use-transaction-numbers";

interface UserSummary {
  totalSent: number;
  totalPaid: number;
  previousDebt: number;
  currentDebt: number;
}

interface Client {
  id: number;
  name: string;
  userId: number;
}

interface Transaction {
  id: number;
  clientId: number;
  amountFCFA: string;
  amountToPay: string;
  createdAt: string;
}

export default function DashboardTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  // Charger l'état copiedProofs depuis localStorage
  const [copiedProofs, setCopiedProofs] = useState<Set<number>>(new Set());
  
  // Charger les données depuis localStorage une fois que l'utilisateur est disponible
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`copiedProofs_${user.id}`);
        if (saved) {
          setCopiedProofs(new Set(JSON.parse(saved)));
        }
      } catch (error) {
        console.error('Error loading copied proofs from localStorage:', error);
      }
    }
  }, [user?.id]);
  
  // Sauvegarder l'état copiedProofs dans localStorage quand il change
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`copiedProofs_${user.id}`, JSON.stringify(Array.from(copiedProofs)));
    }
  }, [copiedProofs, user?.id]);
  
  // Utiliser le gestionnaire de synchronisation centralisé
  useSyncManager();
  
  // Hook pour la numérotation des transactions
  const today = new Date().toISOString().split('T')[0];
  const { getTransactionNumber } = useTransactionNumbers(user?.id || 0, today);

  const { data: userSummary, isLoading: summaryLoading } = useQuery<UserSummary>({
    queryKey: ["/api/stats/user", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/stats/user?userId=${user?.id}`, { 
        credentials: "include",
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        console.error('🔴 [USER SUMMARY API] Error:', response.status, response.statusText);
        return { totalSent: 0, totalPaid: 0, previousDebt: 0, currentDebt: 0 };
      }
      const data = await response.json();
      return data;
    },
    enabled: !!user?.id,
    refetchInterval: 180000,
    refetchOnWindowFocus: true,
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/clients?userId=${user?.id}`, { 
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        console.error('🔴 [CLIENTS API] Error:', response.status, response.statusText);
        return [];
      }
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 120000, // Optimisé pour 3G : 2 minutes au lieu de 15 secondes
    refetchOnWindowFocus: true,
    staleTime: 60000, // Données considérées fraîches pendant 1 minute
  });

  const { data: transactionData, isLoading: transactionsLoading } = useQuery<{
    transactions: Transaction[];
    pagination?: any;
  } | Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user?.id,
    staleTime: 10000, // Données considérées fraîches pendant 10 secondes
    refetchInterval: 15000, // Rafraîchir toutes les 15 secondes
    refetchOnWindowFocus: true,
  });

  // Extraire les transactions du format de réponse (compatible avec ancien et nouveau format)
  const transactions = Array.isArray(transactionData) 
    ? transactionData 
    : (transactionData?.transactions || []);

  const { data: systemSettings } = useQuery({
    queryKey: ["/api/system/settings"],
    queryFn: () => fetch("/api/system/settings", { credentials: "include" }).then(res => res.json()),
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // Force refetch when data is incomplete
  useEffect(() => {
    const checkDataCompleteness = async () => {
      if (user?.id && (!clients || !transactions || transactions.length === 0)) {
        console.log('🔄 [DATA CHECK] Forcing refetch - Clients:', !!clients, 'Transactions:', !!transactions);
        // Force refetch of all data
        queryClient.invalidateQueries({ queryKey: ["/api/clients", user.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/stats/user", user.id] });
      }
    };
    
    // Check immediately and then every 5 seconds if data is missing
    checkDataCompleteness();
    const interval = setInterval(checkDataCompleteness, 5000);
    
    return () => clearInterval(interval);
  }, [user?.id, clients, transactions, queryClient]);



  const formatCurrency = (amount: number | string | undefined | null) => {
    // Handle all possible data types and edge cases
    let numAmount = 0;
    
    if (amount === null || amount === undefined) {
      numAmount = 0;
    } else if (typeof amount === 'string') {
      numAmount = parseFloat(amount) || 0;
    } else if (typeof amount === 'number') {
      numAmount = amount;
    } else {
      numAmount = 0;
    }
    
    // Additional check for NaN
    if (isNaN(numAmount)) {
      numAmount = 0;
    }
    
    // Mobile-specific formatting fallback
    try {
      return new Intl.NumberFormat("fr-FR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numAmount);
    } catch (error) {
      // Fallback for browsers with limited Intl support
      return numAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper function to check if a transaction is from today
  const isToday = (dateString: string) => {
    const today = new Date();
    const transactionDate = new Date(dateString);
    return today.toDateString() === transactionDate.toDateString();
  };

  // Calculate client debts including transactions without clientId (TODAY ONLY)
  const clientDebts = [];
  
  // Filter transactions to only include today's transactions
  const todayTransactions = transactions && Array.isArray(transactions) ? transactions.filter(t => isToday(t.createdAt)) : [];
  
  // Log pour diagnostiquer le problème
  console.log('🔍 [CLIENT DEBTS] Clients:', clients?.length || 0, 'Today Transactions:', todayTransactions?.length || 0);
  
  // Add debts for existing clients (TODAY ONLY)
  if (clients && Array.isArray(clients) && todayTransactions.length > 0) {
    for (const client of clients) {
      const clientTransactions = todayTransactions.filter(t => t.clientId === client.id) || [];
      if (clientTransactions.length > 0) {
        const totalSent = clientTransactions.reduce((sum, t) => sum + parseFloat(t.amountFCFA), 0);
        const totalToPay = clientTransactions.reduce((sum, t) => sum + parseFloat(t.amountToPay), 0);
        const lastTransaction = clientTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

        clientDebts.push({
          ...client,
          totalSent,
          debt: totalToPay,
          lastTransaction: formatDate(lastTransaction.createdAt),
          transactions: clientTransactions, // Ajouter les transactions pour le partage
        });
      }
    }
  }
  
  // Add transactions without clientId as "Client Occasionnel" (TODAY ONLY)
  const orphanTransactions = todayTransactions.filter(t => t.clientId === null);
  if (orphanTransactions.length > 0) {
    const totalSent = orphanTransactions.reduce((sum, t) => sum + parseFloat(t.amountFCFA), 0);
    const totalToPay = orphanTransactions.reduce((sum, t) => sum + parseFloat(t.amountToPay), 0);
    const lastTransaction = orphanTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    clientDebts.push({
      id: 0,
      name: "Client Occasionnel",
      userId: user?.id || 0,
      totalSent,
      debt: totalToPay,
      lastTransaction: formatDate(lastTransaction.createdAt),
      transactions: orphanTransactions, // Ajouter les transactions pour le partage
    });
  }

  // Function to generate proofs text for a client
  const generateClientProofsText = (client: any) => {
    if (!client || !client.transactions || client.transactions.length === 0) {
      return "";
    }

    // Filter transactions that have valid proofs (approved/validated status only)
    const transactionsWithProofs = client.transactions.filter((t: any) => {
      return (t.status === 'approved' || t.status === 'validated') && 
             (t.proof || (t.proofImages && t.proofImages.length > 0));
    });
    
    if (transactionsWithProofs.length === 0) {
      return "";
    }

    // Create message with just transaction details
    let message = '';

    // Add details for each transaction
    transactionsWithProofs.forEach((transaction: any, index: number) => {
      const time = new Date(transaction.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      message += `${index + 1}. ${time} - ${transaction.phoneNumber}\n`;
      message += `   💸 ${formatCurrency(parseFloat(transaction.amountFCFA))} FCFA → ${formatCurrency(parseFloat(transaction.amountToPay))} FCFA\n\n`;
      
      if (transaction.proof) {
        message += `${transaction.proof}\n\n`;
        message += `-------------------------------------------------------\n\n`;
      }
      if (transaction.proofImages && transaction.proofImages.length > 0) {
        message += `   📸 ${transaction.proofImages.length} image(s) attachée(s)\n`;
        message += `-------------------------------------------------------\n\n`;
      }
    });

    return message;
  };

  // Function to copy all client proofs to clipboard
  const copyAllClientProofs = async (client: any) => {
    if (!client) {
      toast({
        title: "Erreur",
        description: "Client non sélectionné",
        variant: "destructive",
      });
      return;
    }
    
    const proofsText = generateClientProofsText(client);
    
    if (!proofsText) {
      toast({
        title: "Aucune preuve à copier",
        description: "Ce client n'a pas de preuves de paiement validées disponibles",
        variant: "destructive",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(proofsText);
      toast({
        title: "Preuves copiées",
        description: `Toutes les preuves de ${client.name} ont été copiées dans le presse-papiers`,
      });
    } catch (err) {
      toast({
        title: "Erreur de copie",
        description: "Impossible de copier les preuves dans le presse-papiers",
        variant: "destructive",
      });
    }
  };

  // Function to share all client proofs on WhatsApp as separate messages
  const shareAllClientProofs = async (client: any) => {
    if (!client) {
      toast({
        title: "Erreur",
        description: "Client non sélectionné",
        variant: "destructive",
      });
      return;
    }
    
    if (!client.transactions || client.transactions.length === 0) {
      toast({
        title: "Aucune preuve à partager",
        description: "Ce client n'a pas de transactions avec preuves aujourd'hui",
        variant: "destructive",
      });
      return;
    }

    // Filter transactions that have valid proofs (approved/validated status only)
    const transactionsWithProofs = client.transactions.filter((t: any) => {
      return (t.status === 'approved' || t.status === 'validated') && 
             (t.proof || (t.proofImages && t.proofImages.length > 0));
    });
    
    if (transactionsWithProofs.length === 0) {
      toast({
        title: "Aucune preuve disponible",
        description: "Ce client n'a pas de preuves de paiement validées disponibles",
        variant: "destructive",
      });
      return;
    }

    // Create individual WhatsApp messages for each proof using prompt
    const shareIndividualProofs = () => {
      let confirmMessage = `Voulez-vous partager les ${transactionsWithProofs.length} preuves séparément ?\n\n`;
      confirmMessage += `Cela ouvrira ${transactionsWithProofs.length} onglets WhatsApp (un pour chaque preuve).\n\n`;
      confirmMessage += `Chaque preuve sera dans un message séparé que le client peut partager individuellement.`;
      
      if (confirm(confirmMessage)) {
        // Open each proof in a separate WhatsApp tab with delay
        transactionsWithProofs.forEach((transaction: any, index: number) => {
          const time = new Date(transaction.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          
          let message = '';
          if (transaction.proof) {
            message = transaction.proof.trim();
          } else if (transaction.proofImages && transaction.proofImages.length > 0) {
            message = `📸 ${transaction.proofImages.length} image(s) de preuve de paiement\n${time} - ${transaction.phoneNumber}\n💸 ${formatCurrency(parseFloat(transaction.amountFCFA))} FCFA → ${formatCurrency(parseFloat(transaction.amountToPay))} FCFA`;
          }
          
          if (message) {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            // Use user interaction for each window opening
            setTimeout(() => {
              window.open(whatsappUrl, '_blank');
            }, index * 500); // Reduced delay to 0.5s
          }
        });
        
        toast({
          title: "Preuves partagées",
          description: `${transactionsWithProofs.length} preuves séparées ouvertes dans WhatsApp`,
        });
      }
    };

    shareIndividualProofs();
  };

  // Calculate monthly total (simplified to current total)
  const monthlyTotal = userSummary?.totalSent || 0;

  if (summaryLoading || clientsLoading || transactionsLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      
      {/* Financial Status */}
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-6">
        <Card className={`p-4 sm:p-6 text-white ${
          (userSummary?.currentDebt || 0) < 0 
            ? "bg-gradient-to-r from-green-500 to-green-700" 
            : "bg-gradient-to-r from-red-500 to-red-700"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-xs sm:text-sm font-medium truncate ${
                (userSummary?.currentDebt || 0) < 0 ? "text-green-100" : "text-red-100"
              }`}>
                {(userSummary?.currentDebt || 0) < 0 ? "Crédit Disponible" : "Dette Actuelle"}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-white break-words">
                {formatCurrency(Math.abs(userSummary?.currentDebt || 0))} FCFA
              </p>
            </div>
            {(userSummary?.currentDebt || 0) < 0 ? (
              <CheckCircle className="text-green-200 flex-shrink-0 ml-2" size={32} />
            ) : (
              <AlertTriangle className="text-red-200 flex-shrink-0 ml-2" size={32} />
            )}
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-purple-100 text-xs sm:text-sm font-medium truncate">Solde Admin (GNF)</p>
              <p className="text-lg sm:text-2xl font-bold text-white break-words">
                {formatCurrency(parseFloat(systemSettings?.mainBalanceGNF || "0"))} GNF
              </p>
            </div>
            <div className="text-purple-200 flex-shrink-0 ml-2" style={{ fontSize: '32px' }}>💰</div>
          </div>
        </Card>
         <Card className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-purple-100 text-xs sm:text-sm font-medium truncate">Solde Utilisateur  (GNF)</p>
              <p className="text-lg sm:text-2xl font-bold text-white break-words">
                {formatCurrency(parseFloat(user?.walletGNF || "0"))} GNF
              </p>
            </div>
            <div className="text-purple-200 flex-shrink-0 ml-2" style={{ fontSize: '32px' }}>💰</div>
          </div>
        </Card>
      </div>

      {/* Client Debt Summary */}
      <Card>
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transactions du Jour par Client</h3>
        </div>
        
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Envoyé Aujourd'hui
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dette Aujourd'hui
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientDebts.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center text-white font-medium">
                          {getInitials(client.name)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {formatCurrency(client.totalSent)} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning text-white">
                      {formatCurrency(client.debt)} FCFA
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.lastTransaction}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              // Ne pas réinitialiser les couleurs pour que l'utilisateur se souvienne
                            }}
                            className="inline-flex items-center p-2 border border-transparent rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Voir les preuves"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Preuves d'aujourd'hui - {selectedClient?.name || 'Client'}</DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              Preuves de paiement validées d'aujourd'hui seulement
                            </p>
                          </DialogHeader>
                          <div className="mt-4">
                            <div className="space-y-4">
                              {(() => {
                                const todayTransactions = selectedClient && selectedClient.transactions && selectedClient.transactions.length > 0 ? selectedClient.transactions
                                  .filter((t: any) => {
                                    const today = new Date();
                                    const transactionDate = new Date(t.createdAt);
                                    const isToday = transactionDate.toDateString() === today.toDateString();
                                    return isToday && (t.status === 'approved' || t.status === 'validated') && (t.proof || (t.proofImages && t.proofImages.length > 0));
                                  }) : [];
                                
                                return (
                                  <>
                                    {todayTransactions.length > 0 && (
                                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-blue-800">
                                            📊 Transactions d'aujourd'hui
                                          </span>
                                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {todayTransactions.length} transaction{todayTransactions.length > 1 ? 's' : ''}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {todayTransactions.length > 0 ? (
                                      todayTransactions
                                  .map((transaction: any, index: number) => {
                                    const transactionNumber = getTransactionNumber(transaction.createdAt);
                                    const time = new Date(transaction.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                    const amountFCFA = formatCurrency(parseFloat(transaction.amountFCFA));
                                    const amountToPay = formatCurrency(parseFloat(transaction.amountToPay));
                                    
                                    return (
                                      <div key={transaction.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-start space-x-3">
                                          <button
                                            onClick={() => {
                                              let proofText = '';
                                              if (transaction.proof) {
                                                proofText = transaction.proof.trim();
                                              } else if (transaction.proofImages && transaction.proofImages.length > 0) {
                                                proofText = `📸 ${transaction.proofImages.length} image(s) de preuve de paiement\n${time} - ${transaction.phoneNumber}\n💸 ${amountFCFA} FCFA → ${amountToPay} FCFA`;
                                              }
                                              
                                              if (proofText) {
                                                navigator.clipboard.writeText(proofText);
                                                // Marquer cette preuve comme copiée
                                                setCopiedProofs(prev => {
                                                  const newSet = new Set(prev);
                                                  newSet.add(transaction.id);
                                                  console.log('✅ Preuve copiée (Desktop) - ID:', transaction.id, 'Set:', Array.from(newSet));
                                                  return newSet;
                                                });
                                                toast({
                                                  title: "Preuve copiée",
                                                  description: "La preuve a été copiée dans le presse-papiers",
                                                });
                                              }
                                            }}
                                            className={`inline-flex items-center p-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                              copiedProofs.has(transaction.id) 
                                                ? "text-green-600 bg-green-100 hover:text-green-800 hover:bg-green-200 focus:ring-green-500" 
                                                : "text-blue-600 bg-blue-50 hover:text-blue-800 hover:bg-blue-100 focus:ring-blue-500"
                                            }`}
                                            style={{
                                              backgroundColor: copiedProofs.has(transaction.id) ? '#dcfce7' : '#dbeafe',
                                              color: copiedProofs.has(transaction.id) ? '#16a34a' : '#2563eb'
                                            }}
                                            title={copiedProofs.has(transaction.id) ? "Preuve déjà copiée" : "Copier cette preuve"}
                                          >
                                            <Copy className="w-4 h-4" />
                                          </button>
                                          <div className="flex-1">
                                            <div className="mb-2 text-sm font-medium text-gray-700">
                                              <span className="text-blue-600 font-bold">#{transactionNumber}</span>
                                              <span className="text-gray-500 mx-2">•</span>
                                              <span className="text-gray-600">{time}</span>
                                              <span className="text-gray-500 mx-2">•</span>
                                              <span className="underline text-orange-600 font-bold">{transaction.phoneNumber}</span>
                                              <span className="text-gray-500 mx-2">•</span>
                                              <span className="underline text-green-600 font-bold">{amountFCFA} FCFA</span>
                                            </div>
                                            <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                              {transaction.proof ? 
                                                transaction.proof : 
                                                (transaction.proofImages && transaction.proofImages.length > 0 ? 
                                                  `📸 ${transaction.proofImages.length} image(s) de preuve de paiement\n${transaction.phoneNumber}` : 
                                                  'Aucune preuve disponible'
                                                )
                                              }
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                    ) : (
                                      <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                                        Aucune preuve de paiement d'aujourd'hui pour ce client
                                        <br />
                                        <small className="text-gray-400">Les preuves des autres jours sont dans l'onglet "Validées"</small>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </tr>
              ))}
              {clientDebts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucune transaction aujourd'hui
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden p-4 space-y-4">
          {clientDebts.map((client) => (
            <div key={client.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center text-white font-medium text-sm">
                  {getInitials(client.name)}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{client.name}</div>
                </div>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Envoyé Aujourd'hui:</span>
                  <span className="font-medium">{formatCurrency(client.totalSent)} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dette Aujourd'hui:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning text-white">
                    {formatCurrency(client.debt)} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernière Transaction:</span>
                  <span className="font-medium">{client.lastTransaction}</span>
                </div>
                <div className="flex justify-center space-x-4 mt-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          // Ne pas réinitialiser les couleurs pour que l'utilisateur se souvienne
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Voir les preuves
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Preuves d'aujourd'hui - {selectedClient?.name || 'Client'}</DialogTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Preuves de paiement validées d'aujourd'hui seulement
                        </p>
                      </DialogHeader>
                      <div className="mt-4">
                        <div className="space-y-4">
                          {(() => {
                            const todayTransactions = selectedClient && selectedClient.transactions && selectedClient.transactions.length > 0 ? selectedClient.transactions
                              .filter((t: any) => {
                                const today = new Date();
                                const transactionDate = new Date(t.createdAt);
                                const isToday = transactionDate.toDateString() === today.toDateString();
                                return isToday && (t.status === 'approved' || t.status === 'validated') && (t.proof || (t.proofImages && t.proofImages.length > 0));
                              }) : [];
                            
                            return (
                              <>
                                {todayTransactions.length > 0 && (
                                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-blue-800">
                                        📊 Transactions d'aujourd'hui
                                      </span>
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {todayTransactions.length} transaction{todayTransactions.length > 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                {todayTransactions.length > 0 ? (
                                  todayTransactions
                              .map((transaction: any, index: number) => {
                                const transactionNumber = getTransactionNumber(transaction.createdAt);
                                const time = new Date(transaction.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                const amountFCFA = formatCurrency(parseFloat(transaction.amountFCFA));
                                const amountToPay = formatCurrency(parseFloat(transaction.amountToPay));
                                
                                return (
                                  <div key={transaction.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-start space-x-3">
                                      <button
                                        onClick={() => {
                                          let proofText = '';
                                          if (transaction.proof) {
                                            proofText = transaction.proof.trim();
                                          } else if (transaction.proofImages && transaction.proofImages.length > 0) {
                                            proofText = `📸 ${transaction.proofImages.length} image(s) de preuve de paiement\n${time} - ${transaction.phoneNumber}\n💸 ${amountFCFA} FCFA → ${amountToPay} FCFA`;
                                          }
                                          
                                          if (proofText) {
                                            navigator.clipboard.writeText(proofText);
                                            // Marquer cette preuve comme copiée
                                            setCopiedProofs(prev => {
                                              const newSet = new Set(prev);
                                              newSet.add(transaction.id);
                                              console.log('✅ Preuve copiée - ID:', transaction.id, 'Set:', Array.from(newSet));
                                              return newSet;
                                            });
                                            toast({
                                              title: "Preuve copiée",
                                              description: "La preuve a été copiée dans le presse-papiers",
                                            });
                                          }
                                        }}
                                        className={`inline-flex items-center p-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                          copiedProofs.has(transaction.id) 
                                            ? "text-green-600 bg-green-100 hover:text-green-800 hover:bg-green-200 focus:ring-green-500" 
                                            : "text-blue-600 bg-blue-50 hover:text-blue-800 hover:bg-blue-100 focus:ring-blue-500"
                                        }`}
                                        style={{
                                          backgroundColor: copiedProofs.has(transaction.id) ? '#dcfce7' : '#dbeafe',
                                          color: copiedProofs.has(transaction.id) ? '#16a34a' : '#2563eb'
                                        }}
                                        title={copiedProofs.has(transaction.id) ? "Preuve déjà copiée" : "Copier cette preuve"}
                                      >
                                        <Copy className="w-4 h-4" />
                                      </button>
                                      <div className="flex-1">
                                        <div className="mb-2 text-sm font-medium text-gray-700">
                                          <span className="text-blue-600 font-bold">#{transactionNumber}</span>
                                          <span className="text-gray-500 mx-2">•</span>
                                          <span className="text-gray-600">{time}</span>
                                          <span className="text-gray-500 mx-2">•</span>
                                          <span className="underline text-orange-600 font-bold">{transaction.phoneNumber}</span>
                                          <span className="text-gray-500 mx-2">•</span>
                                          <span className="underline text-green-600 font-bold">{amountFCFA} FCFA</span>
                                        </div>
                                        <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                          {transaction.proof ? 
                                            transaction.proof : 
                                            (transaction.proofImages && transaction.proofImages.length > 0 ? 
                                              `📸 ${transaction.proofImages.length} image(s) de preuve de paiement\n${transaction.phoneNumber}` : 
                                              'Aucune preuve disponible'
                                            )
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                                ) : (
                                  <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-500">
                                    Aucune preuve de paiement d'aujourd'hui pour ce client
                                    <br />
                                    <small className="text-gray-400">Les preuves des autres jours sont dans l'onglet "Validées"</small>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          ))}
          {clientDebts.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Aucune transaction aujourd'hui
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
