import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, setCurrentUser, type User } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  isDataLoading: boolean;
  updateUser: (user: User | null) => void;
  logout: () => void;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const localUser = getCurrentUser();
      
      if (localUser) {
        console.log('🔧 [AUTH] Initializing with local user:', localUser.username);
        
        // Afficher immédiatement l'utilisateur pour éviter la page blanche
        setUser(localUser);
        setCurrentUser(localUser);
        setIsLoading(false); // Arrêter le chargement de l'auth
        setIsDataLoading(true); // Commencer le chargement des données
        
        // Vérification de session en arrière-plan avec forçage des données
        try {
          const response = await fetch("/api/auth/me", { 
            credentials: "include",
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
          
          if (response.ok) {
            const serverUser = await response.json();
            console.log('✅ [AUTH] Server auth confirmed:', serverUser.username);
            setUser(serverUser);
            setCurrentUser(serverUser);
            
            // Forcer le chargement initial des données critiques avec délai plus long
            await new Promise(resolve => setTimeout(resolve, 800)); // Délai pour que l'UI soit prête
            
            // Déclencher événement pour forcer le chargement des données multiples fois pour garantir
            for (let i = 0; i < 3; i++) {
              window.dispatchEvent(new CustomEvent('auth-data-sync-required', { 
                detail: { userId: serverUser.id, force: true, attempt: i + 1 } 
              }));
              await new Promise(resolve => setTimeout(resolve, 200)); // Délai entre chaque tentative
            }
            
            // Délai supplémentaire pour laisser les données se charger
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsDataLoading(false);
          } else {
            // Session expirée - tenter une reconnexion automatique au lieu de déconnecter
            console.warn('🔶 [AUTH] Session expired, attempting auto-reconnect...');
            
            try {
              // Tenter une reconnexion automatique avec les identifiants stockés localement
              const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  username: localUser.username,
                  password: "auto-reconnect" // Signal pour le serveur qu'il s'agit d'une reconnexion
                })
              });
              
              if (response.ok) {
                const reconnectedUser = await response.json();
                console.log('✅ [AUTH] Auto-reconnect successful:', reconnectedUser.username);
                setUser(reconnectedUser);
                setCurrentUser(reconnectedUser);
                
                // Forcer le rechargement des données après reconnexion
                for (let i = 0; i < 3; i++) {
                  window.dispatchEvent(new CustomEvent('auth-data-sync-required', { 
                    detail: { userId: reconnectedUser.id, force: true, attempt: i + 1, reconnected: true } 
                  }));
                  await new Promise(resolve => setTimeout(resolve, 300));
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                setIsDataLoading(false);
              } else {
                // Échec de reconnexion - déconnecter
                console.warn('🔶 [AUTH] Auto-reconnect failed, logging out');
                localStorage.removeItem("currentUser");
                setUser(null);
                setCurrentUser(null);
                setIsDataLoading(false);
              }
            } catch (error) {
              // Erreur de reconnexion - déconnecter
              console.warn('🔶 [AUTH] Auto-reconnect error, logging out');
              localStorage.removeItem("currentUser");
              setUser(null);
              setCurrentUser(null);
              setIsDataLoading(false);
            }
          }
        } catch (error) {
          // Erreur réseau - laisser l'utilisateur connecté localement mais forcer les données
          console.warn('🔶 [AUTH] Network error, keeping local user and forcing data load');
          
          // Même en cas d'erreur réseau, déclencher le chargement des données avec retry
          for (let i = 0; i < 3; i++) {
            window.dispatchEvent(new CustomEvent('auth-data-sync-required', { 
              detail: { userId: localUser.id, force: true, attempt: i + 1 } 
            }));
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          await new Promise(resolve => setTimeout(resolve, 1200));
          setIsDataLoading(false);
        }
      } else {
        setUser(null);
        setIsLoading(false);
        setIsDataLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const updateUser = (newUser: User | null) => {
    setUser(newUser);
    setCurrentUser(newUser);
    // Si déconnexion (newUser = null), passer immédiatement à la page de connexion
    if (newUser === null) {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsLoggingOut(true);
    
    // Toast professionnel pour la déconnexion
    const showLogoutToast = () => {
      try {
        // Importer le toast dynamiquement pour éviter les erreurs
        import("@/hooks/use-toast").then(({ toast }) => {
          toast({
            title: "✓ Déconnexion réussie",
            description: "Merci et à bientôt sur GesFinance",
            variant: "default",
            duration: 2500,
            className: "border-l-4 border-l-blue-500 bg-white shadow-lg",
          });
        }).catch(() => {
          // Fallback si toast non disponible
          console.log("✓ Déconnexion réussie");
        });
      } catch (error) {
        // Silencieux si erreur toast
        console.log("✓ Déconnexion réussie");
      }
    };
    
    // Afficher le toast avant la déconnexion
    showLogoutToast();
    
    // Nettoyer l'état local après un court délai pour que le toast s'affiche
    setTimeout(() => {
      localStorage.removeItem("currentUser");
      setUser(null);
      setCurrentUser(null);
      setIsLoading(false);
      
      // Déconnexion serveur en arrière-plan (sans attendre)
      fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      }).catch(() => {});
      
      // Forcer immédiatement l'affichage de la page de connexion
      // sans utiliser window.location qui peut causer une page blanche
      setIsLoggingOut(false);
    }, 500); // Délai court pour afficher le toast
  };

  const value = {
    user,
    isLoading,
    isLoggingOut,
    isDataLoading,
    updateUser,
    logout,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}