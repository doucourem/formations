import { useState, useEffect } from "react";
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
import { Coins, Plus, Minus, Percent } from "lucide-react";

interface SystemSettings {
  exchangeRate: string;
  mainBalanceGNF: string;
  feePercentage: string;
}

const balanceSchema = z.object({
  amountFCFA: z.string().min(1, "Montant requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Montant invalide"),
});

const feeSchema = z.object({
  feePercentage: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, "Pourcentage entre 0 et 100"),
});



type BalanceForm = z.infer<typeof balanceSchema>;
type FeeForm = z.infer<typeof feeSchema>;

export default function BalanceTab() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings } = useQuery<SystemSettings>({
    queryKey: ["/api/system/settings"],
    staleTime: 0, // Toujours considérer comme périmé
    gcTime: 0, // Pas de cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await fetch('/api/system/settings', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('💰 [BALANCE] Settings reçus:', data.mainBalanceGNF, 'GNF');
      return data;
    },
  });

  const form = useForm<BalanceForm>({
    resolver: zodResolver(balanceSchema),
    defaultValues: {
      amountFCFA: "",
    },
  });

  const feeForm = useForm<FeeForm>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      feePercentage: "0",
    },
  });



  // Update forms when settings load
  useEffect(() => {
    if (settings?.feePercentage) {
      feeForm.reset({ feePercentage: settings.feePercentage });
    }
    if (settings?.debtThresholdFCFA) {
      debtThresholdForm.reset({ debtThresholdFCFA: settings.debtThresholdFCFA });
    }
  }, [settings?.feePercentage, settings?.debtThresholdFCFA]);

  const watchedAmount = form.watch("amountFCFA");

  const updateFeePercentageMutation = useMutation({
    mutationFn: async (data: FeeForm) => {
      const feePercentage = parseFloat(data.feePercentage);
      
      return apiRequest("PATCH", "/api/system/settings", {
        feePercentage: feePercentage.toFixed(2)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/settings"] });
      toast({
        title: "Pourcentage mis à jour",
        description: "Le pourcentage des frais a été mis à jour avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le pourcentage",
        variant: "destructive",
      });
    },
  });

  const onUpdateFeePercentage = (data: FeeForm) => {
    updateFeePercentageMutation.mutate(data);
  };

  const updateDebtThresholdMutation = useMutation({
    mutationFn: async (data: DebtThresholdForm) => {
      const debtThreshold = parseFloat(data.debtThresholdFCFA);
      
      return apiRequest("PATCH", "/api/system/settings", {
        debtThresholdFCFA: debtThreshold.toFixed(2)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system/settings"] });
      toast({
        title: "Seuil de dette mis à jour",
        description: "Le seuil de dette maximum a été mis à jour avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le seuil de dette",
        variant: "destructive",
      });
    },
  });

  const onUpdateDebtThreshold = (data: DebtThresholdForm) => {
    updateDebtThresholdMutation.mutate(data);
  };

  const calculateConversion = () => {
    if (!settings || !watchedAmount) return 0;
    const amount = parseFloat(watchedAmount);
    const rate = parseFloat(settings.exchangeRate);
    return amount * rate;
  };

  const addBalanceMutation = useMutation({
    mutationFn: async (data: BalanceForm) => {
      const amountFCFA = parseFloat(data.amountFCFA);
      
      return apiRequest("POST", "/api/balance/add", {
        amountFCFA: amountFCFA
      });
    },
    onSuccess: async () => {
      // Force refetch immédiat des données
      queryClient.removeQueries({ queryKey: ["/api/system/settings"] });
      
      // Fetch direct du serveur pour contourner le cache
      try {
        const response = await fetch('/api/system/settings', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' },
        });
        const newData = await response.json();
        
        // Mise à jour manuelle du cache avec les nouvelles données
        queryClient.setQueryData(["/api/system/settings"], newData);
        console.log('💰 [BALANCE] Nouveau solde forcé:', newData.mainBalanceGNF, 'GNF');
        
        toast({
          title: "Solde augmenté",
          description: `Nouveau solde: ${parseFloat(newData.mainBalanceGNF).toLocaleString('fr-FR')} GNF`,
        });
      } catch (error) {
        console.error('Erreur mise à jour solde:', error);
        toast({
          title: "Solde augmenté",
          description: "Le solde a été mis à jour avec succès",
        });
      }
      
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'augmenter le solde",
        variant: "destructive",
      });
    },
  });

  const subtractBalanceMutation = useMutation({
    mutationFn: async (data: BalanceForm) => {
      const amountFCFA = parseFloat(data.amountFCFA);
      
      return apiRequest("POST", "/api/balance/subtract", {
        amountFCFA: amountFCFA
      });
    },
    onSuccess: async () => {
      // Force refetch immédiat des données
      queryClient.removeQueries({ queryKey: ["/api/system/settings"] });
      
      // Fetch direct du serveur pour contourner le cache
      try {
        const response = await fetch('/api/system/settings', {
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' },
        });
        const newData = await response.json();
        
        // Mise à jour manuelle du cache avec les nouvelles données
        queryClient.setQueryData(["/api/system/settings"], newData);
        console.log('💰 [BALANCE] Nouveau solde forcé:', newData.mainBalanceGNF, 'GNF');
        
        toast({
          title: "Solde diminué",
          description: `Nouveau solde: ${parseFloat(newData.mainBalanceGNF).toLocaleString('fr-FR')} GNF`,
        });
      } catch (error) {
        console.error('Erreur mise à jour solde:', error);
        toast({
          title: "Solde diminué",
          description: "Le solde a été mis à jour avec succès",
        });
      }
      
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de diminuer le solde",
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = (data: BalanceForm) => {
    addBalanceMutation.mutate(data);
  };

  const onSubtractSubmit = (data: BalanceForm) => {
    subtractBalanceMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (settingsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  const currentBalanceGNF = parseFloat(settings?.mainBalanceGNF || "0");
  const exchangeRate = parseFloat(settings?.exchangeRate || "20");
  const currentBalanceFCFA = currentBalanceGNF / exchangeRate;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Solde actuel - Version compacte pour mobile */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Solde Principal Actuel</h3>
        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl text-white p-4 sm:p-6">
          <div className="flex items-center justify-between sm:justify-center sm:flex-col">
            <div className="flex items-center space-x-3 sm:space-x-0 sm:flex-col sm:text-center">
              <Coins className="text-white flex-shrink-0" size={32} />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold break-words">{formatCurrency(currentBalanceGNF)} GNF</p>
                <p className="text-blue-200 text-xs sm:text-sm break-words">
                  ≈ {formatCurrency(currentBalanceFCFA)} FCFA
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Formulaire de gestion du solde */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Gérer le Solde Principal</h3>
        <Form {...form}>
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="amountFCFA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant en FCFA</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 1000000"
                      {...field}
                      disabled={addBalanceMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="bg-gray-50 p-3 sm:p-4">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span className="text-gray-600 text-xs sm:text-sm">Taux actuel:</span>
                  <span className="font-medium text-xs sm:text-sm">1 FCFA = {settings?.exchangeRate} GNF</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span className="text-gray-600 text-xs sm:text-sm">Équivalent GNF:</span>
                  <span className="font-medium text-primary text-xs sm:text-sm break-words">
                    {formatCurrency(calculateConversion())} GNF
                  </span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                type="button"
                onClick={form.handleSubmit(onAddSubmit)}
                className="w-full bg-success hover:bg-green-600"
                disabled={addBalanceMutation.isPending || subtractBalanceMutation.isPending}
              >
                <Plus className="w-4 h-4 mr-2" />
                {addBalanceMutation.isPending ? "Ajout..." : "Augmenter"}
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(onSubtractSubmit)}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                disabled={addBalanceMutation.isPending || subtractBalanceMutation.isPending}
              >
                <Minus className="w-4 h-4 mr-2" />
                {subtractBalanceMutation.isPending ? "Retrait..." : "Diminuer"}
              </Button>
            </div>
          </div>
        </Form>
      </Card>

      {/* Fee Percentage Configuration */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Percent className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">Pourcentage des Frais</h2>
        </div>
        
        <Form {...feeForm}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={feeForm.control}
                name="feePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pourcentage (%)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: 9.5"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={feeForm.handleSubmit(onUpdateFeePercentage)}
                  className="w-full"
                  disabled={updateFeePercentageMutation.isPending}
                >
                  <Percent className="w-4 h-4 mr-2" />
                  {updateFeePercentageMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </div>
            </div>
            
            {settings?.feePercentage && parseFloat(settings.feePercentage) > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Pourcentage actuel : {settings.feePercentage}%</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Ce pourcentage s'applique aux montants dans les rapports et calculs de dette, 
                  sans affecter les dépôts réels ni le solde admin.
                </p>
              </div>
            )}
          </div>
        </Form>
      </Card>

      {/* Debt Threshold Configuration */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="h-6 w-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 text-sm font-bold">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Seuil de Dette Maximum</h2>
        </div>
        
        <Form {...debtThresholdForm}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={debtThresholdForm.control}
                name="debtThresholdFCFA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seuil maximum (FCFA)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Ex: 100000"
                        type="number"
                        min="0"
                        step="1000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={debtThresholdForm.handleSubmit(onUpdateDebtThreshold)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                  disabled={updateDebtThresholdMutation.isPending}
                >
                  ⚠ {updateDebtThresholdMutation.isPending ? "Mise à jour..." : "Mettre à jour le seuil"}
                </Button>
              </div>
            </div>
            
            {settings?.debtThresholdFCFA && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-800">
                  <strong>Seuil actuel : {parseFloat(settings.debtThresholdFCFA).toLocaleString('fr-FR')} FCFA</strong>
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Les utilisateurs ne pourront plus effectuer d'envois si leur dette dépasse ce montant. 
                  Ils devront effectuer un paiement pour débloquer les envois.
                </p>
              </div>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
}
