import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/hooks/use-notifications";
import { Send, Search, User, Check, X } from "lucide-react";

interface Client {
  id: number;
  name: string;
  userId: number;
}

interface SystemSettings {
  exchangeRate: string;
  mainBalanceGNF: string;
  feePercentage: string;
}

interface DebtStatus {
  canSend: boolean;
  currentDebt: string;
  debtThreshold: string;
  remainingCredit: string;
  message: string;
}

const transactionSchema = z.object({
  clientId: z.string().optional(),
  phoneNumber: z.string().min(1, "Numéro de téléphone requis"),
  amountFCFA: z.string().min(1, "Montant à envoyer requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Montant invalide"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function TransactionTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isConnected } = useNotifications();
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    queryFn: () => fetch(`/api/clients?userId=${user?.id}`, { credentials: "include" }).then(res => res.json()),
    enabled: !!user?.id,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/system/settings"],
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // Récupérer les données utilisateur actualisées avec le pourcentage personnel
  const { data: currentUser, isLoading: userProfileLoading, error: userProfileError } = useQuery({
    queryKey: ["/api/user/profile", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/user/profile?t=${Date.now()}`, { 
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 0, // Pas de cache - toujours récupérer la dernière version
    gcTime: 30 * 1000, // Garder en mémoire 30 secondes seulement
    refetchInterval: 5000, // Actualiser toutes les 5 secondes pour changements ultra-rapides
  });

  // Vérifier le statut de la dette pour contrôler les envois
  const { data: debtStatus, isLoading: debtStatusLoading, error: debtStatusError } = useQuery<DebtStatus>({
    queryKey: ["/api/user/can-send", user?.id], // Ajouter l'ID utilisateur dans la clé pour éviter cache partagé
    queryFn: async () => {
      console.log('🔍 [DEBT STATUS] Checking debt status for user:', user?.id);
      const response = await fetch("/api/user/can-send", { 
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache', // Forcer un appel frais
        }
      });
      
      if (!response.ok) {
        console.error('❌ [DEBT STATUS] Error response:', response.status, response.statusText);
        if (response.status === 404) {
          throw new Error('User data not found - credit information unavailable');
        }
        throw new Error(`Failed to fetch debt status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ [DEBT STATUS] Data received:', data);
      return data;
    },
    enabled: !!user?.id,
    staleTime: 0, // Toujours considérer comme périmé pour éviter cache incorrect
    gcTime: 0, // Ne pas garder en cache
    refetchInterval: 30000, // Vérifier toutes les 30 secondes
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      // Ne pas retry les erreurs 404 (données utilisateur non trouvées)
      if (error?.message?.includes('404') || error?.message?.includes('not found')) {
        console.log('🚫 [DEBT STATUS] 404 error - not retrying');
        return false;
      }
      return failureCount < 2;
    },
  });

  // Écouter les mises à jour des frais personnalisés via WebSocket
  useEffect(() => {
    if (!isConnected || !user?.id) return;

    const handlePersonalFeeUpdate = (event: any) => {
      if (event.detail?.type === 'PERSONAL_FEE_UPDATED' && event.detail?.userId === user.id) {
        console.log(`💰 [FEE UPDATE] Frais personnalisés mis à jour : ${event.detail.newPercentage}%`);
        
        // Invalidation immédiate et forcée du cache
        queryClient.removeQueries({ queryKey: ['/api/user/profile', user.id] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/profile', user.id] });
        queryClient.invalidateQueries({ queryKey: ['/api/user/can-send', user.id] });
        
        // Force un nouveau fetch immédiat
        queryClient.refetchQueries({ queryKey: ['/api/user/profile', user.id] });
        
        // Afficher une notification
        toast({
          title: "✅ Frais mis à jour",
          description: `Vos frais sont maintenant de ${event.detail.newPercentage}%`,
          duration: 5000,
        });
      }
    };

    // Écouter les événements WebSocket personnalisés
    window.addEventListener('websocket-message', handlePersonalFeeUpdate);

    return () => {
      window.removeEventListener('websocket-message', handlePersonalFeeUpdate);
    };
  }, [isConnected, user?.id, queryClient, toast]);

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      clientId: "",
      phoneNumber: "",
      amountFCFA: "",
    },
  });

  const watchedAmountFCFA = form.watch("amountFCFA");

  // Calculer les montants avec pourcentage personnel de l'utilisateur
  const calculateAmountsWithFee = () => {
    if (!settings || !watchedAmountFCFA) return { amountGNF: 0, feeAmount: 0, totalToPay: 0 };
    
    const amountFCFA = parseFloat(watchedAmountFCFA);
    const exchangeRate = parseFloat(settings.exchangeRate);
    
    // Utiliser le pourcentage personnel de l'utilisateur ou le pourcentage global par défaut
    const feePercentage = parseFloat(currentUser?.personalFeePercentage || settings.feePercentage || "10");
    
    const amountGNF = amountFCFA * exchangeRate;
    const feeAmount = amountFCFA * (feePercentage / 100);
    const totalToPay = amountFCFA + feeAmount;
    
    return { amountGNF, feeAmount, totalToPay };
  };

  const { amountGNF, feeAmount, totalToPay } = calculateAmountsWithFee();

  // Filtrer les clients selon la recherche
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    if (!clientSearch.trim()) return [];
    
    return clients.filter(client =>
      client.name.toLowerCase().includes(clientSearch.toLowerCase())
    ).slice(0, 8); // Limiter à 8 suggestions max
  }, [clients, clientSearch]);

  // Gérer la sélection d'un client
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setClientSearch(client.name);
    setShowSuggestions(false);
    form.setValue("clientId", client.id.toString());
  };

  // Réinitialiser la sélection
  const handleClearSelection = () => {
    setSelectedClient(null);
    setClientSearch("");
    setShowSuggestions(false);
    form.setValue("clientId", "none");
  };

  // Gérer les clics/touches en dehors des suggestions (mobile optimisé)
  useEffect(() => {
    const handleClickOrTouchOutside = (event: MouseEvent | TouchEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    // Gérer à la fois les clics souris et les touches mobiles
    document.addEventListener('mousedown', handleClickOrTouchOutside);
    document.addEventListener('touchstart', handleClickOrTouchOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOrTouchOutside);
      document.removeEventListener('touchstart', handleClickOrTouchOutside);
    };
  }, []);

  // Écouter les suppressions administrateur pour synchronisation en temps réel
  useEffect(() => {
    const handleAdminDeletion = (event: CustomEvent) => {
      console.log('🔄 [USER SYNC] Transaction supprimée par admin, refresh forcé');
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily-user"] });
      
      toast({
        title: "Synchronisation",
        description: "Une transaction a été supprimée par l'administrateur",
        variant: "default",
      });
    };

    window.addEventListener('transaction-deleted-admin', handleAdminDeletion as EventListener);
    
    return () => {
      window.removeEventListener('transaction-deleted-admin', handleAdminDeletion as EventListener);
    };
  }, [queryClient, toast]);

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionForm) => {
      // Si un client existant est sélectionné, utiliser son ID, sinon null
      const clientId = data.clientId && data.clientId !== "" && data.clientId !== "none" ? parseInt(data.clientId) : null;

      return apiRequest("POST", "/api/transactions", {
        clientId: clientId,
        phoneNumber: data.phoneNumber,
        amountFCFA: data.amountFCFA
      });
    },
    onSuccess: () => {
      toast({
        title: "Transaction créée",
        description: "La transaction a été envoyée avec succès à l'administrateur",
      });
      form.reset();
      setSelectedClient(null);
      setClientSearch("");
      setShowSuggestions(false);
      setShowClientSearch(false);
      
      // Invalider les queries pour rafraîchir les données sans recharger la page
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/can-send"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/settings"] });
      
      // Rafraîchir les données immédiatement
      queryClient.refetchQueries({ queryKey: ["/api/transactions"] });
      queryClient.refetchQueries({ queryKey: ["/api/stats/user"] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.details || error?.response?.data?.message || "Impossible de créer la transaction";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransactionForm) => {
    // Vérifier si le montant dépasse le solde admin
    const amountFCFA = parseFloat(data.amountFCFA);
    const exchangeRate = parseFloat(settings?.exchangeRate || "20");
    const amountGNF = amountFCFA * exchangeRate;
    const adminBalance = parseFloat(settings?.mainBalanceGNF || "0");

    if (amountGNF > adminBalance) {
      toast({
        title: "Solde insuffisant",
        description: `Le montant converti (${formatCurrency(amountGNF)} GNF) dépasse le solde admin disponible (${formatCurrency(adminBalance)} GNF)`,
        variant: "destructive",
      });
      return;
    }

    createTransactionMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateConversion = () => {
    if (!settings || !watchedAmountFCFA) return 0;
    const amount = parseFloat(watchedAmountFCFA);
    const rate = parseFloat(settings.exchangeRate);
    return amount * rate;
  };



  if (clientsLoading || settingsLoading || debtStatusLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-96 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  // Afficher le message de blocage si la dette dépasse le seuil
  if (debtStatus && !debtStatus.canSend) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-red-600">⚠</span>
            </div>
            
            <h3 className="text-xl font-semibold text-red-800">Envois Temporairement Bloqués</h3>
            
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 mb-3">{debtStatus.message}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Dette actuelle</p>
                  <p className="font-semibold text-red-600">{parseFloat(debtStatus.currentDebt).toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Seuil maximum</p>
                  <p className="font-semibold text-gray-800">{parseFloat(debtStatus.debtThreshold).toLocaleString('fr-FR')} FCFA</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Pour débloquer les envois :</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Effectuez un paiement pour réduire votre dette</li>
                <li>• Contactez l'administrateur si nécessaire</li>
                <li>• Les envois seront automatiquement rétablis</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-0">
      <Card className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 text-center">Nouvelle Transaction</h3>
          
          {/* Indicateur de crédit restant - Toujours afficher pour information */}
          {debtStatus && debtStatus.canSend && (
            <div className={`mt-4 p-3 rounded-lg border ${
              parseFloat(debtStatus.remainingCredit) < 100000 
                ? 'bg-red-50 border-red-200' 
                : parseFloat(debtStatus.remainingCredit) < 300000
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className={`text-sm ${
                parseFloat(debtStatus.remainingCredit) < 100000 
                  ? 'text-red-800' 
                  : parseFloat(debtStatus.remainingCredit) < 300000
                  ? 'text-yellow-800'
                  : 'text-blue-800'
              }`}>
                <p>
                  <strong>
                    {parseFloat(debtStatus.remainingCredit) < 100000 
                      ? '🚨 Attention - Crédit faible :' 
                      : parseFloat(debtStatus.remainingCredit) < 300000
                      ? '⚠️ Attention :'
                      : 'ℹ️ Information :'}
                  </strong> Crédit restant {parseFloat(debtStatus.remainingCredit).toLocaleString('fr-FR')} FCFA
                </p>
                {parseFloat(debtStatus.remainingCredit) < 100000 && (
                  <p className="text-xs mt-1">Pensez à effectuer un paiement bientôt</p>
                )}
              </div>
            </div>
          )}

          {/* Affichage d'erreur si problème de récupération des données de crédit */}
          {debtStatusError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>⚠ Impossible de vérifier votre crédit restant</strong>
                <br />
                <span className="text-xs">
                  {debtStatusError.message?.includes('404') || debtStatusError.message?.includes('not found') 
                    ? 'Données utilisateur temporairement indisponibles' 
                    : 'Problème de connexion - réessayez dans quelques instants'}
                </span>
              </p>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Client (Optionnel)
                  </FormLabel>
                  
                  {/* Interface simplifiée : soit recherche, soit client sélectionné */}
                  {selectedClient ? (
                    // Client sélectionné - Interface épurée
                    <div className="relative">
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            {selectedClient.name}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelection}
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Interface de recherche épurée
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          ref={searchInputRef}
                          placeholder="Rechercher un client existant..."
                          value={clientSearch}
                          onChange={(e) => {
                            setClientSearch(e.target.value);
                            setShowSuggestions(e.target.value.length > 0);
                          }}
                          onFocus={() => {
                            if (clientSearch.length > 0) {
                              setShowSuggestions(true);
                            }
                          }}
                          className="pl-10 w-full max-w-full box-border focus:ring-blue-500 focus:border-blue-500"
                          disabled={createTransactionMutation.isPending}
                        />
                      </div>

                      {/* Suggestions dropdown - logique corrigée */}
                      {showSuggestions && clientSearch.length > 0 && filteredClients && filteredClients.length > 0 && (
                        <div 
                          ref={suggestionsRef}
                          className="absolute z-10 w-full max-w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        >
                          {filteredClients.length > 0 ? (
                            filteredClients.map((client, index) => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => handleClientSelect(client)}
                                onTouchStart={() => {}} // Améliore la réactivité tactile iOS
                                className="w-full max-w-full px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 transition-all duration-150 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 box-border"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-gray-900 truncate">
                                      {client.name}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center text-gray-500">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Search className="w-6 h-6 text-gray-400" />
                              </div>
                              <div className="text-sm font-medium">Aucun client trouvé</div>
                              <div className="text-xs text-gray-400 mt-1">
                                Essayez un autre terme de recherche
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Message d'aide discret */}
                      {!clientSearch && (
                        <div className="mt-2 text-xs text-gray-500">
                          Laissez vide pour "Client Occasionnel"
                        </div>
                      )}
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro du Destinataire</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+224 628 123 456"
                      {...field}
                      disabled={createTransactionMutation.isPending}
                      className="mobile-input focus:ring-success focus:border-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountFCFA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant à Envoyer (FCFA)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 300000"
                      {...field}
                      disabled={createTransactionMutation.isPending}
                      className="mobile-input focus:ring-success focus:border-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="bg-gray-50 p-4 sm:p-6">
              <h4 className="font-medium text-gray-900 mb-3 sm:mb-4">Résumé de la Transaction</h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-600 flex-shrink-0">Taux de change actuel:</span>
                  <span className="font-medium text-right break-words">1 FCFA = {settings?.exchangeRate || "20"} GNF</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-600 flex-shrink-0">Montant en GNF:</span>
                  <span className="font-medium text-primary text-right break-words">
                    {formatCurrency(amountGNF)} GNF
                  </span>
                </div>
                {parseFloat(currentUser?.personalFeePercentage || settings?.feePercentage || "0") > 0 && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600 flex-shrink-0">Frais ({currentUser?.personalFeePercentage || settings?.feePercentage}%):</span>
                    <span className="font-medium text-orange-600 text-right break-words">
                      {formatCurrency(feeAmount)} FCFA
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-start gap-2 pt-2 border-t">
                  <span className="text-gray-600 flex-shrink-0">Dette de cette transaction:</span>
                  <span className="font-bold text-red-600 text-right break-words">
                    {formatCurrency(totalToPay)} FCFA
                  </span>
                </div>
              </div>
            </Card>

            <Button
              type="submit"
              className="w-full bg-success hover:bg-green-600 text-white py-4 text-lg"
              disabled={createTransactionMutation.isPending}
            >
              <Send className="w-5 h-5 mr-2" />
              Valider la Transaction
            </Button>


          </form>
        </Form>
      </Card>
    </div>
  );
}
