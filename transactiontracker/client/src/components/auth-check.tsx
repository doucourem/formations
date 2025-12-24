import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function AuthCheck() {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    let hasShownWarning = false;

    const checkAuth = async () => {
      if (!user || hasShownWarning) return;

      try {
        const response = await fetch("/api/auth/me", { 
          credentials: "include",
          cache: "no-cache"
        });
        
        if (!response.ok) {
          hasShownWarning = true;
          toast({
            title: "Session expirée",
            description: "Veuillez vous reconnecter pour continuer",
            variant: "destructive",
          });
          
          // Rediriger vers la page de connexion après 2 secondes
          setTimeout(() => {
            localStorage.removeItem("currentUser");
            window.location.href = "/";
          }, 2000);
        }
      } catch (error) {
        // Ignorer les erreurs réseau
      }
    };

    // Vérification initiale seulement - pas d'intervalle pour éviter les boucles
    checkAuth();

    return () => {};
  }, [user, toast]);

  return null;
}