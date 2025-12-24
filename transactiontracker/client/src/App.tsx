import { Suspense, lazy, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/hooks/use-notifications";
import { useWebSocket } from "@/hooks/use-websocket";
import { useSmartRefresh } from "@/hooks/use-smart-refresh";
import { pushNotificationManager } from "@/lib/push-notifications";
import "@/styles/responsive-fix.css";

// Lazy-loaded pages
const LoginPage = lazy(() => import("@/pages/login"));
const AdminDashboard = lazy(() => import("@/pages/admin-dashboard"));
const UserDashboard = lazy(() => import("@/pages/user-dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Centralized loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
);

// PrivateRoute component for role-based access
const PrivateRoute = ({ role, children }: { role: string; children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user || user.role !== role) return <NotFound />;
  return children;
};

function Router() {
  const { user, isLoading, isLoggingOut } = useAuth();

  // Initialize global hooks
  useNotifications();
  useWebSocket();
  useSmartRefresh();

  // Initialize push notifications
  useEffect(() => {
    if (user) {
      pushNotificationManager.init();
      return () => pushNotificationManager.cleanup?.(); // cleanup if defined
    }
  }, [user]);

  // Show login page during logout or if no user
  if (isLoggingOut || !user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  // Show loading screen while fetching user info
  if (isLoading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/">
          {user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
        </Route>

        <Route path="/admin">
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        </Route>

        <Route path="/user">
          <PrivateRoute role="user">
            <UserDashboard />
          </PrivateRoute>
        </Route>

        {/* Fallback for all other routes */}
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
