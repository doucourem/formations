import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaymentWithUser {
  id: number;
  userId: number;
  amount: string;
  validatedBy: number;
  createdAt: string;
  userFirstName: string;
  userLastName: string;
  userName: string;
}

export default function PaymentsManagementTab() {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithUser | null>(null);

  const { data: payments, isLoading } = useQuery<PaymentWithUser[]>({
    queryKey: ["/api/payments"],
    queryFn: async () => {
      const response = await fetch("/api/payments", {
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        console.error('Failed to fetch payments:', response.status);
        return [];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 30000, // Actualiser toutes les 30 secondes
    refetchOnWindowFocus: true,
  });

  const cancelPaymentMutation = useMutation({
    mutationFn: async (paymentId: number) => {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'annulation du paiement");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      // Invalider spécifiquement toutes les requêtes de stats utilisateur
      queryClient.invalidateQueries({ queryKey: ["/api/stats/user"] });
      
      toast({
        title: "Paiement annulé",
        description: `Le paiement de ${data.payment.amount} FCFA a été annulé avec succès.`,
      });
      
      setSelectedPayment(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCancelPayment = (payment: PaymentWithUser) => {
    setSelectedPayment(payment);
  };

  const confirmCancelPayment = () => {
    if (selectedPayment) {
      cancelPaymentMutation.mutate(selectedPayment.id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  const sortedPayments = payments?.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Gestion des Paiements
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gérez et annulez les paiements validés. L'annulation d'un paiement notifiera automatiquement l'utilisateur concerné.
          </p>
        </CardHeader>
        <CardContent>
          {sortedPayments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun paiement trouvé
            </div>
          ) : (
            <div className="space-y-4">
              {sortedPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="font-mono">
                        #{payment.id}
                      </Badge>
                      <span className="font-medium">
                        {payment.userFirstName} {payment.userLastName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        @{payment.userName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Montant: <span className="font-medium text-green-600">{payment.amount} FCFA</span>
                      </span>
                      <span>
                        Date: {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm")}
                      </span>
                      <span>
                        Utilisateur ID: {payment.userId}
                      </span>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelPayment(payment)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Annuler
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Confirmer l'annulation du paiement
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            Êtes-vous sûr de vouloir annuler ce paiement ?
                          </p>
                          <div className="bg-muted p-3 rounded-md text-sm">
                            <div><strong>Paiement:</strong> #{selectedPayment?.id}</div>
                            <div><strong>Utilisateur:</strong> {selectedPayment?.userFirstName} {selectedPayment?.userLastName}</div>
                            <div><strong>Montant:</strong> {selectedPayment?.amount} FCFA</div>
                            <div><strong>Date:</strong> {selectedPayment ? format(new Date(selectedPayment.createdAt), "dd/MM/yyyy HH:mm") : ""}</div>
                          </div>
                          <p className="text-red-600 font-medium">
                            ⚠️ Cette action est irréversible et l'utilisateur sera automatiquement notifié.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedPayment(null)}>
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={confirmCancelPayment}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={cancelPaymentMutation.isPending}
                        >
                          {cancelPaymentMutation.isPending ? "Annulation..." : "Confirmer l'annulation"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {sortedPayments.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Total des paiements:</span>
                <span className="font-medium">{sortedPayments.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Montant total:</span>
                <span className="font-medium text-green-600">
                  {sortedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}