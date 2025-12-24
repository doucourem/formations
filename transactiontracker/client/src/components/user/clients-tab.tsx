import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { Plus, Edit, Check, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
}

interface ClientsTabProps {
  onOpenClientModal: () => void;
}

export default function ClientsTab({ onOpenClientModal }: ClientsTabProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingClient, setEditingClient] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingClient, setDeletingClient] = useState<number | null>(null);

  const { data: clients, isLoading: clientsLoading, refetch: refetchClients } = useQuery<Client[]>({
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
      const data = await response.json();
      console.log('📋 [CLIENTS] Loaded:', data.length, 'clients');
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      return apiRequest("PATCH", `/api/clients/${id}`, { name });
    },
    onSuccess: () => {
      setEditingClient(null);
      setEditName("");
      toast({
        title: "Client modifié",
        description: "Le nom du client a été mis à jour avec succès.",
      });
      // Force complete reload with cache bypass
      window.location.href = window.location.href;
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la modification du client.",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('🗑️ [DELETE] Attempting to delete client:', id);
      try {
        const result = await apiRequest("DELETE", `/api/clients/${id}`);
        console.log('🗑️ [DELETE] Success:', result);
        return result;
      } catch (error) {
        console.error('🗑️ [DELETE] Error:', error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log('🗑️ [DELETE] Mutation success:', data);
      setDeletingClient(null);
      
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès.",
      });
      
      // Force complete reload with cache bypass
      window.location.href = window.location.href;
    },
    onError: (error: any) => {
      console.error('🗑️ [DELETE] Mutation error:', error);
      setDeletingClient(null);
      const message = error?.message || error?.error?.message || "Une erreur est survenue lors de la suppression du client.";
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleEditStart = (client: Client) => {
    setEditingClient(client.id);
    setEditName(client.name);
  };

  const handleEditSave = () => {
    if (editingClient && editName.trim()) {
      updateClientMutation.mutate({ id: editingClient, name: editName.trim() });
    }
  };

  const handleEditCancel = () => {
    setEditingClient(null);
    setEditName("");
  };

  const handleDeleteStart = (clientId: number) => {
    setDeletingClient(clientId);
  };

  const handleDeleteConfirm = () => {
    if (deletingClient) {
      deleteClientMutation.mutate(deletingClient);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingClient(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (clientsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-36 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Mes Clients</h3>
        <Button onClick={onOpenClientModal} className="bg-success hover:bg-green-600 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter Client
        </Button>
      </div>

      <div className="space-y-3">
        {clients?.map((client) => (
          <Card key={client.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3 flex-1">
                <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                  {getInitials(client.name)}
                </div>
                {editingClient === client.id ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mobile-input flex-1"
                      placeholder="Nom du client"
                      autoFocus
                    />
                    <div className="flex space-x-1 flex-shrink-0">
                      <Button
                        onClick={handleEditSave}
                        size="sm"
                        variant="ghost"
                        className="mobile-touch-target text-green-600 hover:text-green-700 p-2"
                        disabled={updateClientMutation.isPending}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleEditCancel}
                        size="sm"
                        variant="ghost"
                        className="mobile-touch-target text-red-600 hover:text-red-700 p-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-gray-900 truncate">{client.name}</h4>
                  </div>
                )}
              </div>
              {editingClient !== client.id && deletingClient !== client.id && (
                <div className="flex space-x-2 self-start sm:self-center">
                  <Button
                    onClick={() => handleEditStart(client)}
                    variant="ghost"
                    size="sm"
                    className="mobile-touch-target text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteStart(client.id)}
                    variant="ghost"
                    size="sm"
                    className="mobile-touch-target text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {deletingClient === client.id && (
                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <span className="text-sm text-gray-600 mr-2">Supprimer ?</span>
                  <Button
                    onClick={handleDeleteConfirm}
                    size="sm"
                    variant="ghost"
                    className="mobile-touch-target text-red-600 hover:text-red-700 p-2"
                    disabled={deleteClientMutation.isPending}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleDeleteCancel}
                    size="sm"
                    variant="ghost"
                    className="mobile-touch-target text-gray-600 hover:text-gray-700 p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {(!clients || clients.length === 0) && (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">Aucun client trouvé</p>
            <Button onClick={onOpenClientModal} className="bg-success hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter votre premier client
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}