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
import { Settings, Users, AlertTriangle, Edit } from "lucide-react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  personalDebtThresholdFCFA: string;
  isActive: boolean;
}

interface UserSummary {
  totalSent: number;
  totalPaid: number;
  currentDebt: number;
}

const debtThresholdSchema = z.object({
  personalDebtThresholdFCFA: z.string().min(1, "Seuil requis").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Montant invalide"),
});

type DebtThresholdForm = z.infer<typeof debtThresholdSchema>;

export default function UserDebtManagementTab() {
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      console.log('🔧 [USERS API] Fetching users...');
      const response = await fetch('/api/users', { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('🔧 [USERS API] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [USERS API] Error response:', errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ [USERS API] Users loaded:', data);
      return data;
    },
    refetchInterval: 10000,
    staleTime: 0,
    gcTime: 30000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error: any) => {
      console.log('🔄 [USERS API] Retry attempt:', failureCount, error?.message);
      return failureCount < 3;
    },
  });

  const form = useForm<DebtThresholdForm>({
    resolver: zodResolver(debtThresholdSchema),
    defaultValues: {
      personalDebtThresholdFCFA: "100000",
    },
  });

  const updateDebtThresholdMutation = useMutation({
    mutationFn: async ({ userId, threshold }: { userId: number; threshold: string }) => {
      console.log('🔧 [DEBT THRESHOLD] Mutation started:', { userId, threshold });
      
      try {
        const result = await apiRequest("PATCH", `/api/users/${userId}/debt-threshold`, {
          personalDebtThresholdFCFA: threshold
        });
        console.log('✅ [DEBT THRESHOLD] API call successful:', result);
        return result;
      } catch (error) {
        console.error('❌ [DEBT THRESHOLD] API call failed:', error);
        throw error;
      }
    },
    onSuccess: (data: any, variables: any) => {
      console.log('🎉 [DEBT THRESHOLD] Mutation success:', data);
      console.log('🔄 [DEBT THRESHOLD] Invalidating cache...');
      
      // Invalidation forcée avec suppression du cache
      queryClient.removeQueries({ queryKey: ["/api/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      
      // Forcer un rechargement complet après un délai
      setTimeout(() => {
        console.log('🔄 [DEBT THRESHOLD] Force refetch after delay...');
        queryClient.refetchQueries({ queryKey: ["/api/users"] });
        
        // Si les données ne se mettent toujours pas à jour, recharger la page
        setTimeout(() => {
          console.log('🔄 [DEBT THRESHOLD] Final fallback - reloading page...');
          window.location.reload();
        }, 1000);
      }, 100);
      
      setEditingUserId(null);
      toast({
        title: "✅ Seuil mis à jour",
        description: `Nouveau seuil: ${variables.threshold} FCFA`,
      });
    },
    onError: (error: any) => {
      console.error('💥 [DEBT THRESHOLD] Mutation error:', error);
      toast({
        title: "❌ Erreur de mise à jour",
        description: error?.message || "Impossible de mettre à jour le seuil de dette",
        variant: "destructive",
      });
    },
  });

  const handleStartEditing = (user: User) => {
    setEditingUserId(user.id);
    form.reset({ personalDebtThresholdFCFA: user.personalDebtThresholdFCFA });
  };

  const handleSaveThreshold = (data: DebtThresholdForm) => {
    if (editingUserId) {
      updateDebtThresholdMutation.mutate({
        userId: editingUserId,
        threshold: data.personalDebtThresholdFCFA
      });
    }
  };

  const handleCancelEditing = () => {
    setEditingUserId(null);
    form.reset();
  };

  if (usersLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (usersError) {
    console.error('💥 [USERS ERROR]', usersError);
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="h-6 w-6 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Seuils de Dette</h2>
        </div>
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Erreur de chargement</h3>
              <p className="text-sm text-red-700 mt-1">
                {usersError instanceof Error ? usersError.message : 'Impossible de charger les utilisateurs'}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-2 bg-red-600 hover:bg-red-700"
                size="sm"
              >
                Recharger la page
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Filtrer les utilisateurs non-admin
  const regularUsers = users?.filter(user => user.role === 'user') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-gray-900">Gestion des Seuils de Dette par Utilisateur</h2>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Fonctionnement du Contrôle de Dette</h3>
            <p className="text-sm text-blue-700 mt-1">
              Chaque utilisateur a un seuil de dette personnalisé. Quand ce seuil est dépassé, 
              l'utilisateur ne peut plus effectuer d'envois jusqu'à ce qu'il effectue un paiement.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {regularUsers.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Seuil de Dette</p>
                  {editingUserId === user.id ? (
                    <Form {...form}>
                      <div className="flex items-center space-x-2 mt-1">
                        <FormField
                          control={form.control}
                          name="personalDebtThresholdFCFA"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="w-32 text-sm"
                                  type="number"
                                  min="0"
                                  step="1000"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <span className="text-xs text-gray-500">FCFA</span>
                      </div>
                    </Form>
                  ) : (
                    <p className="font-semibold text-lg text-gray-800">
                      {parseFloat(user.personalDebtThresholdFCFA || "0").toLocaleString('fr-FR')} FCFA
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  {editingUserId === user.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={form.handleSubmit(handleSaveThreshold)}
                        disabled={updateDebtThresholdMutation.isPending}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        {updateDebtThresholdMutation.isPending ? "..." : "Valider"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditing}
                        disabled={updateDebtThresholdMutation.isPending}
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartEditing(user)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {user.isActive ? (
              <div className="mt-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-green-700">Utilisateur actif</span>
              </div>
            ) : (
              <div className="mt-3 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm text-red-700">Utilisateur inactif</span>
              </div>
            )}
          </Card>
        ))}

        {regularUsers.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-600">Il n'y a actuellement aucun utilisateur régulier dans le système.</p>
          </Card>
        )}
      </div>
    </div>
  );
}