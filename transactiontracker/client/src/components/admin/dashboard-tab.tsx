import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Coins, FileText } from "lucide-react";
import UserReportModal from "@/components/modals/user-report-modal";

interface DailyStats {
  totalSent: number;
  totalPaid: number;
  globalDebt: number;
}

interface UserSummary {
  id: number;
  name: string;
  email: string;
  totalSent: number;
  totalPaid: number;
  previousDebt: number;
  currentDebt: number;
  transactionCount: number;
}

interface SystemSettings {
  mainBalanceGNF: string;
}

export default function DashboardTab() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: dailyStats, isLoading: statsLoading } = useQuery<DailyStats>({
    queryKey: ["/api/stats/daily"],
    queryFn: async () => {
      const response = await fetch('/api/stats/daily', { 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        console.error('🔴 [DAILY STATS API] Error:', response.status, response.statusText);
        return { totalSent: 0, totalPaid: 0, globalDebt: 0 };
      }
      return response.json();
    },
    refetchInterval: 60000, // Optimisé pour 3G : 60 secondes au lieu de 2 secondes
    refetchOnWindowFocus: true,
    staleTime: 30000, // Données fraîches pendant 30 secondes pour éviter requêtes inutiles
  });

  const { data: userSummaries, isLoading: summariesLoading } = useQuery<UserSummary[]>({
    queryKey: ["/api/stats/users"],
    queryFn: async () => {
      const response = await fetch('/api/stats/users', { 
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      if (!response.ok) {
        console.error('🔴 [USER STATS API] Error:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      console.log('📊 [USER STATS] Data loaded:', data);
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 60000, // Optimisé pour 3G : 60 secondes au lieu de 2 secondes
    refetchOnWindowFocus: true,
    staleTime: 30000, // Données fraîches pendant 30 secondes
    gcTime: 120000, // Conserver en cache 2 minutes pour éviter re-téléchargement
  });

  const { data: settings, isLoading: settingsLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/system/settings"],
    refetchInterval: 60000, // Optimisé pour 3G : 60 secondes au lieu de 2 secondes
    refetchOnWindowFocus: true,
    staleTime: 30000, // Données fraîches pendant 30 secondes
  });

  // Écouter les événements de mise à jour du solde
  useEffect(() => {
    const handleBalanceUpdate = (event: CustomEvent) => {
      console.log('💰 [DASHBOARD] Balance update event received:', event.detail);
      
      // Rafraîchir immédiatement et forcer un refetch
      queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
      queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
      
      // Forcer un refetch immédiat sans attendre
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/stats/daily'] });
        queryClient.refetchQueries({ queryKey: ['/api/system/settings'] });
        queryClient.refetchQueries({ queryKey: ['/api/stats/users'] });
      }, 100);
      
      console.log('💰 [DASHBOARD] Dashboard data refreshed immediately');
    };

    window.addEventListener('balance-updated', handleBalanceUpdate as EventListener);
    
    return () => {
      window.removeEventListener('balance-updated', handleBalanceUpdate as EventListener);
    };
  }, [queryClient]);

  const openReportModal = (userId: number, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsReportModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

 const getInitials = (name?: string | null) => {
  if (!name) return ""; // valeur par défaut si name est null/undefined
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};


  const getCurrentDate = () => {
    return new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (statsLoading || summariesLoading || settingsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-orange-100 text-xs sm:text-sm font-medium truncate">Dette Globale</p>
              <p className="text-lg sm:text-2xl font-bold truncate">
                {formatCurrency(dailyStats?.globalDebt || 0)} FCFA
              </p>
            </div>
            <AlertTriangle className="text-orange-200 flex-shrink-0 ml-2" size={32} />
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-purple-100 text-xs sm:text-sm font-medium truncate">Solde Principal (GNF)</p>
              <p className="text-lg sm:text-2xl font-bold truncate">
                {formatCurrency(parseFloat(settings?.mainBalanceGNF || "0"))} GNF
              </p>
            </div>
            <Coins className="text-purple-200 flex-shrink-0 ml-2" size={32} />
          </div>
        </Card>
      </div>

      {/* User Summary Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Résumé par Utilisateur - {getCurrentDate()}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Envoyé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Payé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dette Précédente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dette Actuelle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!userSummaries || userSummaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <p>Aucun résumé utilisateur disponible</p>
                      <p className="text-sm">Les données apparaîtront après la première connexion admin réussie</p>
                    </div>
                  </td>
                </tr>
              ) : (
                userSummaries?.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                          {getInitials(user.firstName)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {formatCurrency(user.totalSent)} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-success font-mono">
                    {formatCurrency(user.totalPaid)} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {formatCurrency(user.previousDebt)} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning text-white">
                      {formatCurrency(user.currentDebt)} FCFA
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReportModal(user.id, user.name)}
                      className="flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      Rapport
                    </Button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de rapport utilisateur */}
      <UserReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userId={selectedUserId || 0}
        userName={selectedUserName}
      />
    </div>
  );
}
