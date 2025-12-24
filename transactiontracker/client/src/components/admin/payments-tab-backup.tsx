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
import { useAuth } from "@/hooks/use-auth";
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
  amount: z.string().min(1, "Montant requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Montant invalide"),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function PaymentsTab() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: userSummary, isLoading: summaryLoading } = useQuery<UserSummary>({
    queryKey: ["/api/stats/user", selectedUserId],
    queryFn: () => fetch(`/api/stats/user?userId=${selectedUserId}`, { credentials: "include" }).then(res => res.json()),
    enabled: !!selectedUserId,
  });

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      userId: "",
      amount: "",
    },
  });

  const validatePaymentMutation = useMutation({
    mutationFn: async (data: PaymentForm) => {
      return apiRequest("POST", "/api/payments", {
        userId: parseInt(data.userId),
        amount: data.amount,
        validatedBy: currentUser?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/users"] });
      toast({
        title: "Paiement validé",
        description: "Le paiement a été validé avec succès",
      });
      form.reset();
      setSelectedUserId("");
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sélectionner un utilisateur</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedUserId(value);
                      }} 
                      defaultValue={field.value}
                      disabled={usersLoading || validatePaymentMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un utilisateur..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regularUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.firstName} {user.lastName}
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant du Paiement (FCFA)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 500000"
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
                className="w-full bg-success hover:bg-green-600"
                disabled={validatePaymentMutation.isPending || !selectedUserId}
              >
                <Check className="w-4 h-4 mr-2" />
                Valider le Paiement
              </Button>
            </form>
          </Form>
        </Card>
      
      {/* Résumé utilisateur */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Résumé Utilisateur Sélectionné</h3>
        <div>
          {selectedUserId && !summaryLoading && userSummary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card className="bg-blue-50 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600">Total des Envois</p>
                <p className="text-lg sm:text-xl font-bold text-primary break-words">
                  {formatCurrency(userSummary.totalSent)} FCFA
                </p>
              </Card>
              <Card className="bg-yellow-50 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600">Dette Précédente</p>
                <p className="text-lg sm:text-xl font-bold text-warning break-words">
                  {formatCurrency(userSummary.previousDebt)} FCFA
                </p>
              </Card>
              <Card className="bg-red-50 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600">Dette Actuelle</p>
                <p className="text-lg sm:text-xl font-bold text-error break-words">
                  {formatCurrency(userSummary.currentDebt)} FCFA
                </p>
              </Card>
              <Card className="bg-green-50 p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-gray-600">Total Payé</p>
                <p className="text-lg sm:text-xl font-bold text-success break-words">
                  {formatCurrency(userSummary.totalPaid)} FCFA
                </p>
              </Card>
            </div>
          ) : selectedUserId && summaryLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Sélectionnez un utilisateur pour voir son résumé
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
