import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, Percent, Edit3, Save, X } from "lucide-react";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  personalFeePercentage: string;
}

interface EditingUser {
  id: number;
  percentage: string;
}

export function FeeManagementTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [backupUsers, setBackupUsers] = useState<User[]>([]);

  const { data: users = [], isLoading, error, refetch } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      console.log('💰 [FEE MANAGEMENT] Fetching users data...');
      const response = await fetch('/api/users', { 
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        console.error('💰 [FEE MANAGEMENT] API Error:', response.status, response.statusText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('💰 [FEE MANAGEMENT] Users data received:', data);
      console.log('💰 [FEE MANAGEMENT] Fee percentages:', data.map((u: User) => ({ 
        id: u.id, 
        username: u.username, 
        personalFeePercentage: u.personalFeePercentage 
      })));
      return data;
    },
    staleTime: 10 * 60 * 1000,  // 10 minutes - cache stable
    gcTime: 30 * 60 * 1000,     // 30 minutes - garde en mémoire
    refetchOnWindowFocus: true,  // Actualise au retour sur l'onglet
    refetchOnMount: true,        // Actualise au montage
    retry: 3,                    // Retry automatique en cas d'erreur
    retryDelay: 1000,           // Délai entre les retry
  });

  // Sauvegarde automatique des données quand elles sont chargées avec succès
  useEffect(() => {
    if (users && users.length > 0) {
      console.log('💰 [FEE BACKUP] Saving users backup to localStorage');
      setBackupUsers(users);
      localStorage.setItem('feeManagement_usersBackup', JSON.stringify(users));
      localStorage.setItem('feeManagement_lastUpdate', Date.now().toString());
    }
  }, [users]);

  // Récupération automatique en cas d'échec de chargement
  useEffect(() => {
    if (error && backupUsers.length === 0) {
      console.log('💰 [FEE BACKUP] Attempting to restore from localStorage');
      try {
        const savedUsers = localStorage.getItem('feeManagement_usersBackup');
        const lastUpdate = localStorage.getItem('feeManagement_lastUpdate');
        
        if (savedUsers && lastUpdate) {
          const backup = JSON.parse(savedUsers);
          const updateTime = parseInt(lastUpdate);
          const ageMinutes = (Date.now() - updateTime) / (1000 * 60);
          
          if (ageMinutes < 60) { // Backup valide si moins d'1 heure
            console.log('💰 [FEE BACKUP] Restored users from backup (age: ' + ageMinutes.toFixed(1) + ' minutes)');
            setBackupUsers(backup);
          }
        }
      } catch (e) {
        console.error('💰 [FEE BACKUP] Failed to restore backup:', e);
      }
    }
  }, [error, backupUsers.length]);

  // Utiliser les données de backup si les données principales ne sont pas disponibles
  const displayUsers = users.length > 0 ? users : backupUsers;

  const updateFeePercentageMutation = useMutation({
    mutationFn: async ({ userId, feePercentage }: { userId: number; feePercentage: string }) => {
      const response = await fetch(`/api/users/${userId}/fee-percentage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feePercentage }),
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour');
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "✅ Pourcentage mis à jour",
        description: `${data.user.name} : ${data.user.feePercentage}%`,
      });
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erreur",
        description: error.message || "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (user: User) => {
    setEditingUser({
      id: user.id,
      percentage: user.personalFeePercentage || "10.00"
    });
  };

  const handleForceRefresh = () => {
    console.log('💰 [FEE MANAGEMENT] Force refresh triggered');
    queryClient.removeQueries({ queryKey: ['/api/users'] });
    refetch();
  };

  const handleSave = () => {
    if (!editingUser) return;
    
    const percentage = parseFloat(editingUser.percentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast({
        title: "❌ Erreur",
        description: "Le pourcentage doit être un nombre entre 0 et 100",
        variant: "destructive",
      });
      return;
    }

    updateFeePercentageMutation.mutate({
      userId: editingUser.id,
      feePercentage: editingUser.percentage
    });
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && displayUsers.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-8 space-y-4">
        <div className="text-red-600">Erreur lors du chargement des utilisateurs</div>
        <div className="text-sm text-gray-500">{error.message}</div>
        <Button onClick={handleForceRefresh}>
          Réessayer
        </Button>
      </div>
    );
  }

  console.log('💰 [FEE MANAGEMENT] Rendering component with users:', displayUsers);

  const isUsingBackup = users.length === 0 && backupUsers.length > 0;

  // Séparer admins et utilisateurs
  const regularUsers = displayUsers.filter((user) => user.role === 'user');
  const adminUsers = displayUsers.filter((user) => user.role === 'admin');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Percent className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Frais Personnalisés</h2>
          {isUsingBackup && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">
              Données sauvegardées
            </span>
          )}
        </div>
        <Button
          onClick={handleForceRefresh}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
          disabled={isLoading}
        >
          <span>{isLoading ? 'Chargement...' : 'Actualiser'}</span>
        </Button>
      </div>
      
      <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <strong>💡 Info :</strong> Chaque utilisateur peut maintenant avoir son propre pourcentage de frais. 
        Ces frais sont appliqués automatiquement à toutes ses nouvelles transactions.
      </div>

      {/* Utilisateurs normaux */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Utilisateurs ({regularUsers.length})</h3>
        </div>
        
        <div className="space-y-4">
          {regularUsers.map((user: User) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-500">@{user.username}</div>
              </div>
              
              <div className="flex items-center space-x-3">
                {editingUser?.id === user.id ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={editingUser.percentage}
                      onChange={(e) => setEditingUser({
                        ...editingUser,
                        percentage: e.target.value
                      })}
                      className="w-20 text-center"
                      placeholder="10.00"
                    />
                    <span className="text-sm text-gray-500">%</span>
                    
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateFeePercentageMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateFeePercentageMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-semibold text-lg text-blue-600">
                        {user.personalFeePercentage || "10.00"}%
                      </div>
                      <div className="text-xs text-gray-500">frais</div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(user)}
                      className="hover:bg-blue-50"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Administrateurs */}
      {adminUsers.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Users className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Administrateurs ({adminUsers.length})</h3>
          </div>
          
          <div className="space-y-4">
            {adminUsers.map((user: User) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-purple-600">@{user.username} (Admin)</div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {editingUser?.id === user.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={editingUser.percentage}
                        onChange={(e) => setEditingUser({
                          ...editingUser,
                          percentage: e.target.value
                        })}
                        className="w-20 text-center"
                        placeholder="10.00"
                      />
                      <span className="text-sm text-gray-500">%</span>
                      
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateFeePercentageMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateFeePercentageMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-semibold text-lg text-purple-600">
                          {user.personalFeePercentage || "10.00"}%
                        </div>
                        <div className="text-xs text-gray-500">frais</div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(user)}
                        className="hover:bg-purple-50"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {users.length === 0 && (
        <Card className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur</h3>
          <p className="text-gray-500">Il n'y a actuellement aucun utilisateur dans le système.</p>
        </Card>
      )}
    </div>
  );
}