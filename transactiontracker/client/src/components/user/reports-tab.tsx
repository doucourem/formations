import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

interface DailyReport {
  date: string;
  previousDebt: number;
  totalSent: number;
  totalFees: number;
  totalPaid: number;
  remainingDebt: number;
}

export default function ReportsTab() {
  const { user } = useAuth();

  // Synchronisation après suppression admin pour rapports
  useEffect(() => {
    const handleAdminDeletion = () => {
      console.log('🔄 [REPORTS SYNC] Transaction supprimée par admin, actualisation des rapports');
      queryClient.invalidateQueries({ queryKey: ['/api/reports/user'] });
      queryClient.refetchQueries({ queryKey: ['/api/reports/user'] });
    };

    window.addEventListener('transaction-deleted-admin', handleAdminDeletion as EventListener);
    
    return () => {
      window.removeEventListener('transaction-deleted-admin', handleAdminDeletion as EventListener);
    };
  }, []);
  
  const { data: dailyReports, isLoading, error } = useQuery<DailyReport[]>({
    queryKey: ["/api/reports/user", user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/reports/user/${user?.id}`, { 
        credentials: "include",
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user?.id,
    staleTime: 0,
    refetchInterval: false,
    refetchOnWindowFocus: true,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getDebtTrend = (current: number, previous: number) => {
    if (current > previous) return "increase";
    if (current < previous) return "decrease";
    return "stable";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-600">Erreur lors du chargement des rapports</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Calendar className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-gray-900">Rapport Quotidien</h2>
      </div>

      {/* Summary Cards */}
      {dailyReports && dailyReports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Envoyé</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(dailyReports.reduce((sum, r) => sum + r.totalSent, 0))} FCFA
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payé</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dailyReports.reduce((sum, r) => sum + r.totalPaid, 0))} FCFA
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dette Actuelle</p>
                <p className={`text-2xl font-bold ${
                  (dailyReports[0]?.remainingDebt || 0) < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(dailyReports[0]?.remainingDebt || 0))} FCFA
                  {(dailyReports[0]?.remainingDebt || 0) < 0 && ' (Crédit)'}
                </p>
              </div>
              <TrendingDown className={`h-8 w-8 ${
                (dailyReports[0]?.remainingDebt || 0) < 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
          </Card>
        </div>
      )}

      {/* Daily Reports Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détails par Jour</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dette Précédente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Envoyé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frais (%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paiement du Jour
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dette Restante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tendance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyReports?.map((report, index) => {
                const trend = index < dailyReports.length - 1 
                  ? getDebtTrend(report.remainingDebt, dailyReports[index + 1].remainingDebt)
                  : "stable";
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(report.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {formatCurrency(report.previousDebt)} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-mono">
                      {formatCurrency(report.totalSent)} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-mono">
                      {formatCurrency(report.totalFees)} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-mono">
                      {formatCurrency(report.totalPaid)} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono ${
                        report.remainingDebt > 0 
                          ? "bg-red-100 text-red-800" 
                          : report.remainingDebt < 0
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {formatCurrency(Math.abs(report.remainingDebt))}
                        {report.remainingDebt < 0 && ' (Crédit)'} FCFA
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trend === "increase" 
                          ? "bg-red-100 text-red-800" 
                          : trend === "decrease"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {trend === "increase" && "↗ Augmentation"}
                        {trend === "decrease" && "↘ Diminution"}
                        {trend === "stable" && "→ Stable"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(!dailyReports || dailyReports.length === 0) && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Aucun rapport disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}