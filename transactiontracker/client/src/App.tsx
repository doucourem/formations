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
const ManagerDashboard = lazy(() => import("@/pages/manager-dashboard"));
const UserDashboard = lazy(() => import("@/pages/user-dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Chargement...</p>
    </div>
  </div>
);

// PrivateRoute supports multiple roles
const PrivateRoute = ({
  roles,
  children,
}: {
  roles: string[];
  children: JSX.Element;
}) => {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role.toLowerCase())) return <NotFound />;
  return children;
};

// Helper for role badge colors
export const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return "bg-red-100 text-red-800";
    case "manager":
      return "bg-yellow-100 text-yellow-800";
    case "user":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

function Router() {
  const { user, isLoading, isLoggingOut } = useAuth();

  // Global hooks
  useNotifications();
  useWebSocket();
  useSmartRefresh();

  // Push notifications
  useEffect(() => {
    if (user) {
      pushNotificationManager.init();
      return () => pushNotificationManager.cleanup?.();
    }
  }, [user]);

  // Show login if not logged in
  if (isLoggingOut || !user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    );
  }

  // Loading state
  if (isLoading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Default route */}
        <Route path="/">
          {user.role.toLowerCase() === "admin" ? (
            <AdminDashboard />
          ) : user.role.toLowerCase() === "manager" ? (
            <ManagerDashboard />
          ) : (
            <UserDashboard />
          )}
        </Route>

        {/* Admin */}
        <Route path="/admin">
          <PrivateRoute roles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        </Route>

        {/* Manager */}
        <Route path="/manager">
          <PrivateRoute roles={["manager"]}>
            <ManagerDashboard />
          </PrivateRoute>
        </Route>

        {/* User */}
        <Route path="/user">
          <PrivateRoute roles={["user"]}>
            <UserDashboard />
          </PrivateRoute>
        </Route>

        {/* Fallback */}
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </Suspense>
  );
}

// Example role badge component
export const RoleBadge = ({ role }: { role: string }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
      role
    )}`}
  >
    {role.toLowerCase() === "admin"
      ? "Admin"
      : role.toLowerCase() === "manager"
      ? "Manager"
      : "Utilisateur"}
  </span>
);

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
