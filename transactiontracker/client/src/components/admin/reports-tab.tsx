import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface DailyReport {
  date: string;
  previousDebt: number;
  totalSent: number;
  totalFees: number;
  totalPaid: number;
  remainingDebt: number;
}

export default function ReportsTab() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/stats/users"],
  });

  const { data: dailyReports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports/user", selectedUserId],
    enabled: !!selectedUserId,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDebtTrend = (current: number, previous: number) => {
    if (current > previous) return "increase";
    if (current < previous) return "decrease";
    return "stable";
  };

  if (usersLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="h-32 bg-gray-200 animate-pulse rounded-xl"></div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">Rapports Détaillés par Utilisateur</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un utilisateur
            </label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un utilisateur..." />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user: User) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedUserId && (
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setSelectedUserId("")}
                className="flex items-center space-x-2"
              >
                <span>Réinitialiser</span>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Reports Table */}
      {selectedUserId && (
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Rapport Détaillé - {users?.find((u: User) => u.id.toString() === selectedUserId)?.name}
              </h3>
              <Badge variant="outline">
                {dailyReports?.length || 0} jour{(dailyReports?.length || 0) > 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
          
          {reportsLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Chargement des rapports...</span>
              </div>
            </div>
          ) : (
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
                      Total Payé
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
                  {dailyReports?.map((report: DailyReport, index: number) => {
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {formatCurrency(report.totalSent)} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-mono font-semibold">
                          {formatCurrency(report.totalFees)} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {formatCurrency(report.totalPaid)} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          <span className={`${report.remainingDebt >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(Math.abs(report.remainingDebt))} FCFA
                            {report.remainingDebt < 0 && ' (Crédit)'}
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
                            {trend === "increase" && <TrendingUp className="w-3 h-3 mr-1" />}
                            {trend === "decrease" && <TrendingDown className="w-3 h-3 mr-1" />}
                            {trend === "stable" && <Minus className="w-3 h-3 mr-1" />}
                            {trend === "increase" && "Augmentation"}
                            {trend === "decrease" && "Diminution"}
                            {trend === "stable" && "Stable"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {(!dailyReports || dailyReports.length === 0) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        {selectedUserId ? "Aucun rapport disponible pour cet utilisateur" : "Sélectionnez un utilisateur pour voir ses rapports"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}