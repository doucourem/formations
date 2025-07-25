import { useState, useEffect } from "react";
import { getCurrentUser, setCurrentUser, type User } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const localUser = getCurrentUser();
      console.log('🔧 [AUTH] checkAuthStatus - localUser:', localUser);
      
      if (localUser) {
        setUser(localUser);
        setIsLoading(false);
        // Pas de vérification de session pour éviter les problèmes sur mobile
      } else {
        setUser(null);
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [forceUpdate]);

  const updateUser = (newUser: User | null) => {
    console.log('🔧 [AUTH] updateUser called with:', newUser);
    setUser(newUser);
    setCurrentUser(newUser);
    setForceUpdate(prev => prev + 1); // Force re-render
    console.log('🔧 [AUTH] State updated, new user:', newUser);
  };

  return {
    user,
    isLoading,
    updateUser,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
  };
}
