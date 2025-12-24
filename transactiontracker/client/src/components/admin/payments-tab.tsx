import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Check } from "lucide-react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
}

interface UserSummary {
  totalSent: number;
  totalPaid: number;
  previousDebt: number;
  currentDebt: number;
}

const paymentSchema = z.object({
  userId: z.string().min(1, "Utilisateur requis"),
  amountFCFA: z.string().min(1, "Montant requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Montant invalide"),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function PaymentsTab() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { toast } = useToast();

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: userSummary, isLoading: summaryLoading } = useQuery<UserSummary>({
    queryKey: ["/api/stats/user", selectedUserId],
    queryFn: async () => {
      const response = await fetch(`/api/stats/user?userId=${selectedUserId}`, { 
        credentials: "include",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user summary');
      }
      return response.json();
    },
    enabled: !!selectedUserId,
    staleTime: 0, // Forcer la réactualisation immédiate
    cacheTime: 0, // Ne pas garder en cache
  });

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      userId: "",
      amountFCFA: "",
    },
  });

  const validatePaymentMutation = useMutation({
    mutationFn: async (data: PaymentForm) => {
      const paymentData = {
        userId: parseInt(data.userId),
        amount: data.amountFCFA,
        validatedBy: 3 // Admin ID
      };
      
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(paymentData),
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la validation du paiement");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      form.reset();
      setSelectedUserId("");
      toast({
        title: "Succès",
        description: "Paiement validé avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de valider le paiement",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentForm) => {
    validatePaymentMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const regularUsers = users?.filter(user => user.role === "user") || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Formulaire de validation - Version compacte */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Validation de Paiement</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Sélectionner un utilisateur</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedUserId(value);
                      // Invalider explicitement le cache des stats utilisateur pour forcer le refresh
                      queryClient.invalidateQueries({ queryKey: ["/api/stats/user", value] });
                    }} 
                    defaultValue={field.value}
                    disabled={usersLoading || validatePaymentMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Choisir un utilisateur..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regularUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.firstName} {user.lastName} ({user.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountFCFA"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Montant Reçu (FCFA)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 50000"
                      className="text-sm"
                      {...field}
                      disabled={validatePaymentMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-success hover:bg-green-600 text-sm"
              disabled={validatePaymentMutation.isPending || !selectedUserId}
            >
              <Check className="w-3 h-3 mr-2" />
              Valider le Paiement
            </Button>
          </form>
        </Form>
      </Card>
      
      {/* Résumé utilisateur */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Résumé Utilisateur</h3>
        {selectedUserId && !summaryLoading && userSummary ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Card className="bg-blue-50 p-2 sm:p-3">
              <p className="text-xs text-gray-600">Total Envois</p>
              <p className="text-sm sm:text-base font-bold text-primary break-words">
                {formatCurrency(userSummary.totalSent)}
              </p>
            </Card>
            <Card className="bg-gray-50 p-2 sm:p-3">
              <p className="text-xs text-gray-600">Total Paiements</p>
              <p className="text-sm sm:text-base font-bold text-green-600 break-words">
                {formatCurrency(userSummary.totalPaid)}
              </p>
            </Card>
            <Card className="bg-red-50 p-2 sm:p-3">
              <p className="text-xs text-gray-600">Dette Précédente</p>
              <p className="text-sm sm:text-base font-bold text-red-600 break-words">
                {formatCurrency(userSummary.previousDebt)}
              </p>
            </Card>
            <Card className="bg-yellow-50 p-2 sm:p-3">
              <p className="text-xs text-gray-600">Dette Actuelle</p>
              <p className="text-sm sm:text-base font-bold text-yellow-600 break-words">
                {formatCurrency(userSummary.currentDebt)}
              </p>
            </Card>
          </div>
        ) : summaryLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6 text-sm">
            Sélectionnez un utilisateur pour voir son résumé
          </div>
        )}
      </Card>
    </div>
  );
}