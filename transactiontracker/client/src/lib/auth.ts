import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
  walletGNF: string;
}

export async function login(username: string, password: string): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", { username, password });
  const data = await response.json();
  
  // Double sauvegarde pour les mobiles
  setCurrentUser(data);
  
  // Vérification immédiate de la session
  try {
    await fetch("/api/auth/me", { 
      credentials: "include",
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.warn('Session verification failed, but user data saved locally');
  }
  
  return data;
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("currentUser");
  }
}

export async function logout(): Promise<void> {
  // Nettoyer immédiatement le localStorage pour éviter la page blanche
  localStorage.removeItem("currentUser");
  
  // Détecter si on est sur mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  try {
    // Pour les mobiles, utiliser fetch avec des options spécifiques
    if (isMobile) {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({})
      });
    } else {
      await apiRequest("POST", "/api/auth/logout", {});
    }
  } catch (error) {
    console.log("Logout server request failed, but local cleanup completed");
  }
  
  // Pas de rechargement forcé pour éviter la page blanche
  // La redirection est gérée par le composant mobile navigation avec wouter
}
