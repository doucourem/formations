import { ChartPie, Users, CreditCard, ArrowLeftRight, CheckCircle, Bell, PlusCircle, History, UserCheck, LogOut, FileText, Archive, X, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
  pendingCount?: number;
  cancellationCount?: number;
}

interface TabItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

export default function MobileNavigation({ activeTab, onTabChange, userRole, pendingCount = 0, cancellationCount = 0 }: MobileNavigationProps) {
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  // Debug logs pour vérifier les valeurs reçues
  console.log('🚨 [MOBILE NAV] cancellationCount:', cancellationCount);
  console.log('🚨 [MOBILE NAV] pendingCount:', pendingCount);

  if (!isMobile) return null;

  const handleLogout = () => {
    if (!confirm("Voulez-vous vraiment vous déconnecter ?")) {
      return;
    }
    logout();
  };

  const adminTabs: TabItem[] = [
    { id: "dashboard", label: "Tableau", icon: ChartPie },
    { id: "transactions", label: "À Valider", icon: Bell, badge: pendingCount },
    { id: "validated", label: "Validées", icon: CheckCircle },
    { id: "cancelled", label: "Annulées", icon: X, badge: cancellationCount },
    { id: "payments", label: "Paiements", icon: CreditCard },
    { id: "payments-mgmt", label: "Annuler", icon: Trash2 }
  ];

  const userTabs: TabItem[] = [
    { id: "dashboard", label: "Tableau", icon: ChartPie },
    { id: "transaction", label: "Nouvelle", icon: PlusCircle },
    { id: "history", label: "Historiques", icon: History },
    { id: "validated", label: "Validées", icon: CheckCircle },
    { id: "reports", label: "Rapports", icon: FileText },
    { id: "clients", label: "Mes clients", icon: UserCheck }
  ];

  const tabs = userRole === "admin" ? adminTabs : userTabs;

  return (
    <nav className="mobile-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              // Déclencher le rafraîchissement des transactions en attente lors du changement d'onglet mobile
              if (tab.id === 'transactions') {
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('tab-switched-to-pending'));
                  console.log('🔄 [MOBILE TAB] Switched to pending transactions, triggering refresh');
                }, 100);
              }
            }}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {tab.badge && tab.badge > 0 && (
                <span className={`absolute -top-2 -right-2 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse ${
                  tab.id === 'cancelled' ? 'bg-orange-500' : 'bg-red-500'
                }`}>
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">{tab.label}</span>
          </button>
        );
      })}
      
      {/* Bouton de déconnexion */}
      <button
        onClick={handleLogout}
        className="mobile-nav-item logout-btn"
      >
        <div className="relative">
          <LogOut className="w-6 h-6" />
        </div>
        <span className="text-xs mt-1 font-medium">Déconnexion</span>
      </button>
    </nav>
  );
}