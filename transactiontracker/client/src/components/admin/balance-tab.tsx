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
import { Coins, Plus, Minus, Settings } from "lucide-react";

interface SystemSettings {
  exchangeRate: string;
  mainBalanceGNF: string;
}

interface User {
  id: number;
  name: string;
}

const balanceSchema = z.object({
  userId: z.number({ required_error: "Utilisateur requis" }),
  amountFCFA: z.string()
    .min(1, "Montant requis")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Montant invalide"),
});

type BalanceForm = z.infer<typeof balanceSchema>;

export default function BalanceTab() {
  const { toast } = useToast();

  // Formulaire
  const form = useForm<BalanceForm>({
    resolver: zodResolver(balanceSchema),
    defaultValues: { amountFCFA: "", userId: 0 },
  });

  // Liste des utilisateurs
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const res = await fetch("/api/users", { credentials: "include" });
      if (!res.ok) throw new Error("Impossible de charger les utilisateurs");
      return res.json();
    },
    staleTime: 60000,
  });

  // Paramètres système
  const { data: settings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/system/settings"],
    queryFn: async () => {
      const response = await fetch(`/api/system/settings?t=${Date.now()}`, {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!response.ok) throw new Error('Impossible de récupérer les paramètres');
      return response.json();
    },
    staleTime: 0,
  });

  const watchedAmount = form.watch("amountFCFA");
  const watchedUserId = form.watch("userId");

  const formatCurrency = (amount?: number) => new Intl.NumberFormat("fr-FR").format(amount ?? 0);

  const calculateConversion = () => {
    if (!settings || !watchedAmount) return 0;
    const amount = parseFloat(watchedAmount);
    const rate = parseFloat(settings.exchangeRate);
    return isNaN(amount) || isNaN(rate) ? 0 : amount * rate;
  };

  const handleMutationSuccess = async (action: string) => {
    try {
      const response = await fetch('/api/system/settings', {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const newData = await response.json();
      queryClient.setQueryData(["/api/system/settings"], newData);
      toast({
        title: `Solde ${action}`,
        description: `Nouveau solde: ${parseFloat(newData.mainBalanceGNF).toLocaleString('fr-FR')} GNF`,
      });
      form.reset();
    } catch (err) {
      console.error("Erreur mise à jour solde:", err);
      toast({
        title: `Solde ${action}`,
        description: "Le solde a été mis à jour avec succès",
      });
    }
  };

  const addBalanceMutation = useMutation({
    mutationFn: async (data: BalanceForm) => {
      return apiRequest("POST", "/api/balance/add", {
        amountFCFA: parseFloat(data.amountFCFA),
        userId: data.userId,
      });
    },
    onSuccess: () => handleMutationSuccess("augmenté"),
    onError: () => toast({ title: "Erreur", description: "Impossible d'augmenter le solde", variant: "destructive" }),
  });

  const subtractBalanceMutation = useMutation({
    mutationFn: async (data: BalanceForm) => {
      return apiRequest("POST", "/api/balance/subtract", {
        amountFCFA: parseFloat(data.amountFCFA),
        userId: data.userId,
      });
    },
    onSuccess: () => handleMutationSuccess("diminué"),
    onError: () => toast({ title: "Erreur", description: "Impossible de diminuer le solde", variant: "destructive" }),
  });

  const onAddSubmit = (data: BalanceForm) => addBalanceMutation.mutate(data);
  const onSubtractSubmit = (data: BalanceForm) => subtractBalanceMutation.mutate(data);

  if (settingsLoading || usersLoading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Solde Actuel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Solde Admin</span>
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary mt-2">
                {settings?.mainBalanceGNF ? formatCurrency(parseFloat(settings.mainBalanceGNF)) : "0"} GNF
              </p>
            </div>
           
            {users?.map((user) => (
            <><div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{user.firstName} {user.lastName}</span>
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary mt-2">
                  {user.walletGNF ? formatCurrency(parseFloat(user.walletGNF)) : "0"} GNF
                </p>
              </div>
                </>
             ))}
              <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taux de Change</span>
                <span className="text-sm text-gray-500">FCFA → GNF</span>
              </div>
              <p className="text-xl font-semibold text-gray-900 mt-2">
                1 FCFA = {settings?.exchangeRate || "0"} GNF
              </p>
            </div>
          </div>
        </div>
      </Card>
     

      <Card className="p-4 sm:p-6">
        <Form {...form}>
          <div className="space-y-4">

            {/* Sélecteur utilisateur */}
           <FormField
  control={form.control}
  name="userId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Utilisateur</FormLabel>
      <FormControl>
        <select
          {...field}
          onChange={(e) => field.onChange(parseInt(e.target.value))}
          value={field.value}
          className="w-full border rounded p-2"
        >
          <option value={0}>Sélectionner un utilisateur</option>
          {users?.map(u => <option key={u.id} value={u.id}>{u.firstName}</option>)}
        </select>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


            {/* Montant */}
            <FormField
              control={form.control}
              name="amountFCFA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant en FCFA</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: 1000000" disabled={addBalanceMutation.isPending || subtractBalanceMutation.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conversion */}
            <Card className="bg-gray-50 p-3 sm:p-4 my-4">
              <div className="flex justify-between">
                <span>Équivalent GNF:</span>
                <span className="font-medium text-primary">{formatCurrency(calculateConversion())} GNF</span>
              </div>
            </Card>

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button type="button" onClick={form.handleSubmit(onAddSubmit)} className="w-full bg-success hover:bg-green-600" disabled={addBalanceMutation.isPending || subtractBalanceMutation.isPending}>
                <Plus className="w-4 h-4 mr-2" /> {addBalanceMutation.isPending ? "Ajout..." : "Augmenter"}
              </Button>
              <Button type="button" onClick={form.handleSubmit(onSubtractSubmit)} className="w-full bg-red-500 hover:bg-red-600 text-white" disabled={addBalanceMutation.isPending || subtractBalanceMutation.isPending}>
                <Minus className="w-4 h-4 mr-2" /> {subtractBalanceMutation.isPending ? "Retrait..." : "Diminuer"}
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}
