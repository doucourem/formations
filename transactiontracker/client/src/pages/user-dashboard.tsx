import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { logout } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Coins, LogOut, ChartPie, Users, Send, History, CheckCircle, FileText, RefreshCw } from "lucide-react";
import DashboardTab from "@/components/user/dashboard-tab";
import ClientsTab from "@/components/user/clients-tab";
import TransactionTab from "@/components/user/transaction-tab";
import HistoryTab from "@/components/user/history-tab-simple";
import ValidatedTab from "@/components/user/validated-tab";
import ReportsTab from "@/components/user/reports-tab";
import ClientModal from "@/components/modals/client-modal";
import MobileNavigation from "@/components/mobile/mobile-navigation";
import MobileHeader from "@/components/mobile/mobile-header";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationSystem } from "@/components/notifications/notification-system";

type UserTab = "dashboard" | "clients" | "transaction" | "history" | "validated" | "reports";

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<UserTab>("dashboard");
  
  // S'assurer que l'onglet est valide
  const validTabs: UserTab[] = ["dashboard", "clients", "transaction", "history", "validated", "reports"];
  const currentTab = validTabs.includes(activeTab as UserTab) ? activeTab : "dashboard";
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const { user, updateUser, logout } = useAuth();
  const { forceRefresh } = useAutoRefresh();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    if (!confirm("Voulez-vous vraiment vous déconnecter ?")) {
      return;
    }
    logout();
  };

  // Fonction de rafraîchissement spécialisée pour l'utilisateur
  const handleUserRefresh = async () => {
    console.log('📱 [USER REFRESH] Rafraîchissement des données utilisateur...');
    
    // Invalider toutes les données utilisateur spécifiques
    await Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/clients'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/stats/user'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/stats/daily-user'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/system/settings'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/user/can-send'], refetchType: 'all' }),
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'], refetchType: 'all' })
    ]);
    
    console.log('✅ [USER REFRESH] Données utilisateur rafraîchies');
  };

  const tabs = [
    { id: "dashboard", label: "Tableau de Bord", icon: ChartPie },
    { id: "clients", label: "Mes Clients", icon: Users },
    { id: "transaction", label: "Nouvelle Transaction", icon: Send },
    { id: "history", label: "Historique", icon: History },
    { id: "validated", label: "Validées", icon: CheckCircle },
    { id: "reports", label: "Rapports", icon: FileText },
  ];

  const getTabTitle = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    return currentTab ? currentTab.label : "GesFinance";
  };

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader 
          title={getTabTitle()} 
          showRefreshButton={true}
          onRefresh={handleUserRefresh}
        />
      </div>
      
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block w-64 bg-white shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-success p-2 rounded-lg">
              <Coins className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-heading tracking-tight">GesFinance</h1>
              <p className="text-sm text-gray-500 font-medium">Utilisateur</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center text-white font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Compte utilisateur</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as UserTab)}
                className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-success text-white border-r-2 border-success"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200 bg-white">
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="w-full justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 pt-16 pb-24 md:p-8 md:pt-8 md:pb-8">
        <div className="bg-white rounded-lg shadow-sm md:rounded-xl">
          <div className="p-4 md:p-6">
            {currentTab === "dashboard" && <DashboardTab />}
            {currentTab === "clients" && <ClientsTab onOpenClientModal={() => setIsClientModalOpen(true)} />}
            {currentTab === "transaction" && <TransactionTab />}
            {currentTab === "history" && <HistoryTab />}
            {currentTab === "validated" && <ValidatedTab />}
            {currentTab === "reports" && <ReportsTab />}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNavigation 
          activeTab={currentTab}
          onTabChange={(tab) => {
            if (validTabs.includes(tab as UserTab)) {
              setActiveTab(tab as UserTab);
            } else {
              setActiveTab("dashboard");
            }
          }}
          userRole="user"
        />
      </div>

      {/* Modals */}
      <ClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
      />

      {/* Système de notification invisible */}
      {/* Notifications handled by useNotifications hook in App.tsx */}
    </div>
  );
}
