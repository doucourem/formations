import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Ban, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface UsersTabProps {
  onOpenUserModal: () => void;
}

export default function UsersTab({ onOpenUserModal }: UsersTabProps) {
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    role: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch('/api/users', { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        console.error('🔴 [USERS API] Error:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<User> }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      toast({
        title: "Utilisateur modifié",
        description: "Les informations ont été mises à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'utilisateur",
        variant: "destructive",
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Statut modifié",
        description: "Le statut de l'utilisateur a été mis à jour",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      });
    },
  });

  const handleEditStart = (user: User) => {
    setEditingUser(user.id);
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      role: user.role
    });
  };

  const handleEditSave = () => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser,
        data: editData
      });
    }
  };

  const handleEditCancel = () => {
    setEditingUser(null);
    setEditData({
      firstName: "",
      lastName: "",
      username: "",
      role: ""
    });
  };

  const handleToggleStatus = (user: User) => {
    toggleUserStatusMutation.mutate({
      id: user.id,
      isActive: !user.isActive
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800";
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-10 w-36 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Gestion des Utilisateurs</h3>
        <Button onClick={onOpenUserModal} className="bg-primary hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Créer Utilisateur
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Création
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!users || users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <p>Aucun utilisateur trouvé</p>
                      <p className="text-sm">Vérifiez votre connexion ou contactez l'administrateur</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                          {getInitials(user.firstName, user.lastName)}
                        </div>
                      </div>
                      <div className="ml-4">
                        {editingUser === user.id ? (
                          <div className="space-y-2">
                            <div className="flex space-x-2">
                              <Input
                                value={editData.firstName}
                                onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                                placeholder="Prénom"
                                className="text-sm w-24"
                              />
                              <Input
                                value={editData.lastName}
                                onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                                placeholder="Nom"
                                className="text-sm w-24"
                              />
                            </div>
                            <Input
                              value={editData.username}
                              onChange={(e) => setEditData({...editData, username: e.target.value})}
                              placeholder="Nom d'utilisateur"
                              className="text-sm"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.username}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUser === user.id ? (
                      <Select value={editData.role} onValueChange={(value) => setEditData({...editData, role: value})}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manageur">Manageur</SelectItem>
                          <SelectItem value="user">Utilisateur</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role === "admin" ? "Admin" : "Utilisateur"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                      {user.isActive ? "Actif" : "Bloqué"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingUser === user.id ? (
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleEditSave}
                          disabled={updateUserMutation.isPending}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleEditCancel}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditStart(user)}
                          className="text-primary hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleStatus(user)}
                          disabled={toggleUserStatusMutation.isPending}
                          className={user.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
