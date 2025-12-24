import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { X } from "lucide-react";

const clientSchema = z.object({
  name: z.string().min(1, "Nom du client requis"),
});

type ClientForm = z.infer<typeof clientSchema>;

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientModal({ isOpen, onClose }: ClientModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientForm) => {
      return apiRequest("POST", "/api/clients", {
        ...data,
        userId: user?.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "Client ajouté",
        description: "Le client a été ajouté avec succès",
      });
      form.reset();
      onClose();
      // Invalider les queries pour rafraîchir les données sans recharger la page
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.refetchQueries({ queryKey: ["/api/clients"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le client",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClientForm) => {
    createClientMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Ajouter un Client
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du Client</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Mamadou Barry"
                      {...field}
                      disabled={createClientMutation.isPending}
                      className="focus:ring-success focus:border-success"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createClientMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-success hover:bg-green-600"
                disabled={createClientMutation.isPending}
              >
                {createClientMutation.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
