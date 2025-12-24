import { useState } from "react";
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
import { RefreshCw, Save, AlertTriangle } from "lucide-react";

interface SystemSettings {
  exchangeRate: string;
  updatedAt: string;
}

const exchangeSchema = z.object({
  exchangeRate: z.string().min(1, "Taux requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Taux invalide"),
});

type ExchangeForm = z.infer<typeof exchangeSchema>;

export default function ExchangeTab() {
  const { toast } = useToast();

  const { data: settings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/system/settings"],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await fetch(`/api/system/settings?t=${Date.now()}`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      return response.json();
    }
  });

  const form = useForm<ExchangeForm>({
    resolver: zodResolver(exchangeSchema),
    defaultValues: {
      exchangeRate: "",
    },
  });

  const updateExchangeRateMutation = useMutation({
    mutationFn: async (data: ExchangeForm) => {
      console.log('🔄 [EXCHANGE] Updating rate to:', data.exchangeRate);
      return apiRequest("PATCH", "/api/system/settings", {
        exchangeRate: parseFloat(data.exchangeRate).toFixed(4)
      });
    },
    onSuccess: (result) => {
      console.log('✅ [EXCHANGE] Rate updated successfully:', result);
      
      // Invalidation immédiate et forcée
      queryClient.removeQueries({ queryKey: ["/api/system/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/settings"] });
      queryClient.refetchQueries({ queryKey: ["/api/system/settings"] });
      
      toast({
        title: "Taux mis à jour",
        description: "Le taux de change a été mis à jour avec succès",
      });
      form.reset();
    },
    onError: (error) => {
      console.error('❌ [EXCHANGE] Update failed:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le taux de change",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExchangeForm) => {
    updateExchangeRateMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (settingsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Taux actuel - Version compacte pour mobile */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Taux de Change Actuel</h3>
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl text-white p-4 sm:p-6">
          <div className="flex items-center justify-between sm:justify-center sm:flex-col">
            <div className="flex items-center space-x-3 sm:space-x-0 sm:flex-col sm:text-center">
              <RefreshCw className="text-white flex-shrink-0" size={32} />
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold break-words">1 FCFA = {settings?.exchangeRate} GNF</p>
                <p className="text-blue-100 text-xs sm:text-sm break-words">
                  Mise à jour: {settings?.updatedAt ? formatDate(settings.updatedAt) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Formulaire de modification */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Modifier le Taux de Change</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="exchangeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau Taux (1 FCFA = X GNF)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 20.5"
                      {...field}
                      disabled={updateExchangeRateMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="bg-yellow-50 p-3 sm:p-4 border border-yellow-200">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <AlertTriangle className="text-warning flex-shrink-0 mt-0.5" size={16} />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-yellow-800">Impact du changement</p>
                  <p className="text-xs sm:text-sm text-yellow-700">
                    Ce taux sera appliqué à toutes les nouvelles transactions et conversions.
                  </p>
                </div>
              </div>
            </Card>

            <Button
              type="submit"
              className="w-full bg-warning hover:bg-yellow-600 text-white"
              disabled={updateExchangeRateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Mettre à Jour le Taux
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
