import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/hooks/use-notifications";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useAutoRefresh } from "@/hooks/use-auto-refresh";
import { useQuery } from "@tanstack/react-query";
import { logout } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { Coins, Bell, LogOut, ChartPie, Users, Wallet, RefreshCw, CreditCard, ArrowLeftRight, CheckCircle, Smartphone, Archive, X, Trash2, History, Settings, Percent } from "lucide-react";
import DashboardTab from "@/components/admin/dashboard-tab";
import UsersTab from "@/components/admin/users-tab";
import BalanceTab from "@/components/admin/balance-tab";
import ExchangeTab from "@/components/admin/exchange-tab";
import PaymentsTab from "@/components/admin/payments-tab";
import PaymentsManagementTab from "@/components/admin/payments-management-tab";
import TransactionsTab from "@/components/admin/transactions-tab";
import ValidatedTab from "@/components/admin/validated-tab";
import CancelledTab from "@/components/admin/cancelled-tab";

import BalanceHistoryTab from "@/components/admin/balance-history-tab";
import UserDebtManagementTab from "@/components/admin/user-debt-management-tab";
import { FeeManagementTab } from "@/components/admin/fee-management-tab";
import UserModal from "@/components/modals/user-modal";
import SimpleEnhancedProofModal from "@/components/modals/simple-enhanced-proof-modal";
import MobileNavigation from "@/components/mobile/mobile-navigation";
import MobileHeader from "@/components/mobile/mobile-header";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotificationSystem } from "@/components/notifications/notification-system";
import { useToast } from "@/hooks/use-toast";
import { OfflineIndicator } from "@/components/network/offline-indicator";
import { useNetworkOptimization } from "@/hooks/use-network-optimization";
import { ResponsiveTest } from "@/components/test/responsive-test";

type AdminTab = "dashboard" | "users" | "balance" | "balance-history" | "exchange" | "payments" | "payments-mgmt" | "transactions" | "validated" | "cancelled" | "debt-management" | "fee-management" | "responsive-test";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const { updateUser, logout } = useAuth();
  const { unreadCount, pendingTransactions, markAsRead, markPendingTransactionsAsRead } = useNotifications();
  
  // Audio alert system
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(true);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);
  const [previousPendingCount, setPreviousPendingCount] = useState(0);
  const [showNotificationAlert, setShowNotificationAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  // Listen for transaction notifications
  useEffect(() => {
    const handleTransactionNotification = (event: CustomEvent) => {
      console.log('🔔 [VISUAL] Transaction notification received:', event.detail);
      setShowNotificationAlert(true);
      setAlertMessage(`🚨 NOUVELLE TRANSACTION REÇUE 🚨`);
      
      // Flash screen red - more visible
      document.body.style.transition = 'background-color 0.5s';
      document.body.style.backgroundColor = '#dc2626';
      setTimeout(() => {
        document.body.style.backgroundColor = '';
      }, 1500);
      
      // Create a more visible alert banner
      const alertDiv = document.createElement('div');
      alertDiv.id = 'transaction-alert-banner';
      alertDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(45deg, #dc2626, #ef4444);
        color: white;
        padding: 20px;
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        z-index: 9999;
        animation: pulse 1s infinite;
        box-shadow: 0 4px 20px rgba(220, 38, 38, 0.5);
      `;
      alertDiv.textContent = '🚨 NOUVELLE TRANSACTION REÇUE - VÉRIFIEZ L\'ONGLET TRANSACTIONS 🚨';
      
      // Remove existing banner if any
      const existing = document.getElementById('transaction-alert-banner');
      if (existing) existing.remove();
      
      document.body.appendChild(alertDiv);
      
      // Auto-hide alert after 8 seconds
      setTimeout(() => {
        setShowNotificationAlert(false);
        setAlertMessage("");
        const banner = document.getElementById('transaction-alert-banner');
        if (banner) banner.remove();
      }, 8000);
    };

    window.addEventListener('transaction-alert', handleTransactionNotification as EventListener);
    
    return () => {
      window.removeEventListener('transaction-alert', handleTransactionNotification as EventListener);
    };
  }, []);

  // Sync pending count with service worker
  useEffect(() => {
    const pendingData = queryClient.getQueryData(['/api/stats/pending-count']);
    if (pendingData && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_PENDING_COUNT',
        count: (pendingData as any).count
      });
    }
  }, [queryClient.getQueryData(['/api/stats/pending-count'])]);

  useEffect(() => {
    if (!audioAlertsEnabled) return;
    
    const playNotificationSound = () => {
      try {
        // Prevent multiple sounds within 5 seconds
        const now = Date.now();
        if (now - lastNotificationTime < 5000) {
          console.log('🔔 [AUDIO] Cooldown active, skipping sound');
          return;
        }
        setLastNotificationTime(now);
        
        console.log('🔔 [AUDIO] Playing notification beep...');
        
        // Create a short beep sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        console.log('🔔 [AUDIO] Beep played successfully');
      } catch (error) {
        console.log('🔔 [AUDIO] Error playing sound:', error);
      }
    };
    
    // Listen for WebSocket events for immediate notifications
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log('🔔 [WEBSOCKET] Message reçu:', data.type);
        
        if (data.type === 'TRANSACTION_CREATED' || data.type === 'PROOF_SUBMITTED') {
          console.log('🔔 [WEBSOCKET] Nouvelle transaction/preuve détectée:', data.type);
          playNotificationSound();
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('GesFinance - Nouvelle transaction', {
              body: data.type === 'TRANSACTION_CREATED' 
                ? 'Une nouvelle transaction a été créée'
                : 'Une preuve a été soumise',
              icon: '/icon-192x192.png',
              tag: 'gesfinance-alert'
            });
          }
        }
      } catch (error) {
        console.error('🔔 [WEBSOCKET] Erreur parsing message:', error);
      }
    };
    
    // Listen for service worker messages
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
        console.log('🔔 [SW] Notification clicked, focusing transactions tab');
        setActiveTab('transactions');
      }
    };
    
    // Check if WebSocket is available globally
    if (typeof window !== 'undefined' && (window as any).ws) {
      (window as any).ws.addEventListener('message', handleWebSocketMessage);
    }
    
    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }
    
    return () => {
      if (typeof window !== 'undefined' && (window as any).ws) {
        (window as any).ws.removeEventListener('message', handleWebSocketMessage);
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [audioAlertsEnabled, lastNotificationTime]);
  const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
  const { forceRefresh } = useAutoRefresh();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { isOnline, isSlowConnection } = useNetworkOptimization();

  // Récupérer le nombre de transactions à annuler
  const { data: cancellationData } = useQuery({
    queryKey: ['/api/stats/cancellation-count'],
    queryFn: () => fetch('/api/stats/cancellation-count', { credentials: 'include' }).then(res => res.json()),
    refetchInterval: 120000, // Actualiser toutes les 2 minutes au lieu de 30 secondes
    staleTime: 90000, // Cache 1.5 minutes
  });

  const cancellationCount = cancellationData?.count || 0;

  // Show push notification status to admin
  useEffect(() => {
    if (isSupported && !isSubscribed) {
      toast({
        title: "Notifications Push",
        description: "Activez les notifications push pour recevoir les alertes même quand l'app est fermée",
        duration: 10000,
      });
    }
  }, [isSupported, isSubscribed, toast]);

  const handleLogout = () => {
    if (!confirm("Voulez-vous vraiment vous déconnecter ?")) {
      return;
    }
    logout();
  };

  const handleNotificationClick = () => {
    setActiveTab("transactions");
    markPendingTransactionsAsRead();
  };

  // Écouter les événements de mise à jour des statistiques
  useEffect(() => {
    const handleStatsUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stats/daily'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/users'] });
      // Rafraîchir le solde principal admin
      queryClient.invalidateQueries({ queryKey: ['/api/system/settings'] });
    };

    window.addEventListener('stats-update', handleStatsUpdate);
    return () => {
      window.removeEventListener('stats-update', handleStatsUpdate);
    };
  }, [queryClient]);

  const openProofModal = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setIsProofModalOpen(true);
  };

  const handlePushToggle = async () => {
    try {
      if (isSubscribed) {
        const success = await unsubscribeFromPush();
        toast({
          title: success ? "Notifications désactivées" : "Erreur",
          description: success ? "Les notifications push ont été désactivées" : "Impossible de désactiver les notifications",
          variant: success ? "default" : "destructive",
        });
      } else {
        const result = await subscribeToPush();
        toast({
          title: result.success ? "Notifications activées" : "Erreur",
          description: result.message,
          variant: result.success ? "default" : "destructive",
          duration: result.success ? 5000 : 10000,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    }
  };

  const allTabs = [
    { id: "dashboard", label: "Tableau de Bord", icon: ChartPie },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "balance", label: "Solde Principal", icon: Wallet },
    { id: "balance-history", label: "Historique Solde", icon: History, desktopOnly: true },
    { id: "debt-management", label: "Seuils de Dette", icon: Settings, desktopOnly: true },
    { id: "fee-management", label: "Frais Personnalisés", icon: Percent, desktopOnly: true },
    { id: "exchange", label: "Taux de Change", icon: RefreshCw },
    { id: "payments", label: "Paiements", icon: CreditCard },
    { id: "payments-mgmt", label: "Annuler Paiements", icon: Trash2 },
    { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
    { id: "validated", label: "Validées", icon: CheckCircle },
    { id: "cancelled", label: "Annulées", icon: X },
    { id: "responsive-test", label: "Test Responsive", icon: Smartphone, desktopOnly: true },
  ];

  // Filtrer les onglets selon la version (mobile/desktop)
  const tabs = isMobile 
    ? allTabs.filter(tab => !tab.desktopOnly)
    : allTabs;

  const getTabTitle = () => {
    const currentTab = tabs.find(tab => tab.id === activeTab);
    return currentTab ? currentTab.label : "Administration";
  };

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Alert Banner - Always visible when active */}
      {showNotificationAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 text-center font-bold text-lg shadow-lg animate-pulse">
          {alertMessage}
          <button 
            onClick={() => setShowNotificationAlert(false)}
            className="ml-4 bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-sm"
          >
            ✕ Fermer
          </button>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader 
          title={getTabTitle()} 
          showRefreshButton={true}
          onRefresh={() => {
            // Rafraîchir toutes les données critiques
            queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
            queryClient.invalidateQueries({ queryKey: ["/api/transactions/pending"] });
            queryClient.invalidateQueries({ queryKey: ["/api/stats/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/stats/daily"] });
            queryClient.invalidateQueries({ queryKey: ["/api/system/settings"] });
            queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
            queryClient.invalidateQueries({ queryKey: ["/api/balance/history"] });
          }}
        />
      </div>
      
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex md:flex-col w-64 bg-white shadow-lg h-screen">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-primary p-2 rounded-lg">
              <Coins className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 font-heading tracking-tight">GesFinance</h1>
              <p className="text-sm text-gray-500 font-medium">Administration</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 mt-6 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  // Déclencher le rafraîchissement des transactions en attente lors du changement d'onglet
                  if (tab.id === 'transactions') {
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('tab-switched-to-pending'));
                      console.log('🔄 [TAB] Switched to pending transactions, triggering refresh');
                    }, 100);
                  }
                }}
                className={`w-full flex items-center px-6 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white border-r-2 border-primary"
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
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                  onClick={handleNotificationClick}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Transactions
                  {pendingTransactions > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                      {pendingTransactions}
                    </span>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Alertes Sonores + Background */}
            <Button 
              variant="default"
              size="sm" 
              className="w-full justify-start bg-green-500 text-white hover:bg-green-600"
              onClick={async () => {
                try {
                  console.log('🔔 [AUDIO] Testing notification sound...');
                  
                  // Create a simple beep sound using Web Audio API
                  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const oscillator = audioContext.createOscillator();
                  const gainNode = audioContext.createGain();
                  
                  oscillator.connect(gainNode);
                  gainNode.connect(audioContext.destination);
                  
                  oscillator.frequency.value = 800;
                  oscillator.type = 'sine';
                  
                  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                  gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
                  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                  
                  oscillator.start(audioContext.currentTime);
                  oscillator.stop(audioContext.currentTime + 0.5);
                  
                  console.log('🔔 [AUDIO] Beep sound played successfully');
                  
                  // Test background notification via service worker
                  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({
                      type: 'START_MONITORING'
                    });
                    console.log('🔔 [SW] Background monitoring activated');
                  }
                  
                  toast({
                    title: "Alertes activées",
                    description: "Son + notifications arrière-plan actifs! Vous serez alerté même déconnecté.",
                  });
                  
                } catch (error) {
                  console.error('Audio test error:', error);
                  toast({
                    title: "Erreur audio",
                    description: "Impossible de jouer le son. Vérifiez les paramètres audio du navigateur.",
                  });
                }
              }}
            >
              <Bell className="w-4 h-4 mr-3" />
              Alertes ON ✓
            </Button>
            
            {!isSupported && (
              <div className="text-xs text-gray-500 text-center py-2">
                Notifications push non supportées sur ce navigateur
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="w-full justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Notification Alert Banner */}
      {showNotificationAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-4 px-6 animate-pulse">
          <div className="flex items-center justify-center gap-3">
            <Bell className="w-6 h-6" />
            <span className="text-lg font-bold">🚨 NOUVELLE TRANSACTION REÇUE 🚨</span>
            <Bell className="w-6 h-6" />
          </div>
          <button 
            onClick={() => setShowNotificationAlert(false)}
            className="absolute top-2 right-4 text-white hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 pt-16 pb-24 md:p-8 md:pt-8 md:pb-8">
        <div className="bg-white rounded-lg shadow-sm md:rounded-xl">
          <div className="p-4 md:p-6">
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "users" && <UsersTab onOpenUserModal={() => setIsUserModalOpen(true)} />}
            {activeTab === "balance" && <BalanceTab />}
            {activeTab === "balance-history" && <BalanceHistoryTab />}
            {activeTab === "debt-management" && <UserDebtManagementTab />}
            {activeTab === "fee-management" && <FeeManagementTab />}
            {activeTab === "exchange" && <ExchangeTab />}
            {activeTab === "payments" && <PaymentsTab />}
            {activeTab === "payments-mgmt" && <PaymentsManagementTab />}
            {activeTab === "transactions" && <TransactionsTab onOpenProofModal={openProofModal} />}
            {activeTab === "validated" && <ValidatedTab />}
            {activeTab === "cancelled" && <CancelledTab />}
            {activeTab === "responsive-test" && <ResponsiveTest />}

          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <MobileNavigation 
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as AdminTab)}
          userRole="admin"
          pendingCount={pendingTransactions}
          cancellationCount={cancellationCount}
        />
      </div>

      {/* Modals */}
      <UserModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
      />
      <SimpleEnhancedProofModal 
        isOpen={isProofModalOpen} 
        onClose={() => setIsProofModalOpen(false)}
        transactionId={selectedTransactionId}
      />

      {/* Notifications handled by useNotifications hook in App.tsx */}
    </div>
  );
}
