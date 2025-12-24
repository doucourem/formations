import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

interface BalanceHistory {
  id: number;
  date: string;
  openingBalance: string;
  dailyAdditionsFCFA: string;
  dailyUsageGNF: string;
  closingBalance: string;
  createdAt: string;
  updatedAt: string;
}

export default function BalanceHistoryTab() {
  const { data: balanceHistory, isLoading, error } = useQuery<BalanceHistory[]>({
    queryKey: ["/api/balance/history"],
    queryFn: async () => {
      const res = await fetch("/api/balance/history", { credentials: "include" });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
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
        <div className="text-red-600">Erreur lors du chargement de l'historique</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-gray-900">Historique du Solde</h2>
      </div>

      {/* Summary Cards */}
      {balanceHistory && balanceHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solde Restant</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(balanceHistory[0]?.closingBalance || 0)} GNF
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solde d'Ouverture</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(balanceHistory[0]?.openingBalance || 0)} GNF
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisé Aujourd'hui</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(balanceHistory[0]?.dailyUsageGNF || 0)} GNF
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Balance History Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Historique Détaillé</h3>
          <p className="text-sm text-gray-600 mt-1">
            Calcul en temps réel : solde qui restait hier + utilisé aujourd'hui = solde restant
          </p>
        </div>
        
        {balanceHistory && balanceHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solde d'Ouverture
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solde Utilisé
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solde Restant
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {balanceHistory.map((record, index) => {
                  const openingBalance = parseFloat(record.openingBalance);
                  const usedBalance = parseFloat(record.dailyUsageGNF);
                  const closingBalance = parseFloat(record.closingBalance);
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {formatCurrency(openingBalance)} GNF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-mono">
                        {formatCurrency(usedBalance)} GNF
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono ${
                          closingBalance > 0 
                            ? "bg-green-100 text-green-800" 
                            : closingBalance < 0
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {formatCurrency(Math.abs(closingBalance))} GNF
                          {closingBalance < 0 && ' (Déficit)'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun historique disponible</p>
            <p className="text-sm text-gray-400 mt-1">
              Les données d'aujourd'hui s'afficheront automatiquement
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}