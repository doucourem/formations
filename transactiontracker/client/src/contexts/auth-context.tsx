import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, setCurrentUser, type User } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
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

  useEffect(() => {
    const initializeAuth = async () => {
      const localUser = getCurrentUser();
      
      if (localUser) {
        // Afficher immédiatement l'utilisateur pour éviter la page blanche
        setUser(localUser);
        setCurrentUser(localUser);
        setIsLoading(false); // Arrêter le chargement immédiatement
        
        // Vérification de session en arrière-plan
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
          } else {
            // Session expirée - déconnecter proprement
            localStorage.removeItem("currentUser");
            setUser(null);
            setCurrentUser(null);
          }
        } catch (error) {
          // Erreur réseau - laisser l'utilisateur connecté localement
          console.warn('🔶 [AUTH] Network error, keeping local user');
        }
      } else {
        setUser(null);
        setIsLoading(false);
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
    
    // Nettoyer immédiatement l'état local
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
  };

  const value = {
    user,
    isLoading,
    isLoggingOut,
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