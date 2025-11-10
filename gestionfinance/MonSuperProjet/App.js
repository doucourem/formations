import React, { useContext } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Provider as PaperProvider, MD3DarkTheme, Button, Text } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, AuthContext } from "./api/context/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./api/queryClient"; // chemin correct

// === IMPORTS ÉCRANS ===
import LoginScreen from "./screens/Auth/LoginScreen";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import BalanceHistory from "./screens/Balance/BalanceHistory";
import TransactionsList from "./screens/Transactions/TransactionList";
import ClientList from "./screens/Clients/ClientList";
import ClientForm from "./screens/Clients/ClientForm";
import HistoryTab from "./screens/Transactions/HistoryTab";
import ValidatedTab from "./screens/Transactions/ValidatedTab";

// === NAVIGATEURS ===
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// === THÈME ===
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4F46E5",
    secondary: "#10B981",
    accent: "#FBBF24",
    error: "#EF4444",
    success: "#22C55E",
    background: "#111827",
    surface: "#1F2937",
    onSurface: "#FFFFFF",
    placeholder: "#9CA3AF",
  },
};

// === STYLES ===
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
});

// === DRAWER CONTENT ===
const CustomDrawerContent = ({ user, screens, navigation, logout }) => (
  <View style={{ flex: 1 }}>
    <View style={styles.drawerHeader}>
      <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
        Tableau de bord
      </Text>
      <Text style={{ color: "#CBD5E1" }}>{user?.email}</Text>
      <Button mode="outlined" onPress={logout} style={{ marginTop: 10 }}>
        Déconnexion
      </Button>
    </View>
    <DrawerContentScrollView>
      {screens.map((screen) => (
        <Button
          key={screen.name}
          mode="text"
          onPress={() => navigation.navigate(screen.name)}
          textColor="#CBD5E1"
        >
          {screen.name}
        </Button>
      ))}
    </DrawerContentScrollView>
  </View>
);

// === DRAWER NAVIGATOR ===
function DrawerNavigator({ user, logout }) {
  const screens = [
    { name: "Caisse", component: ValidatedTab },
    { name: "Transactions", component: TransactionsList },
    { name: "Opérateurs", component: ClientList },
    { name: "Fournisseurs", component: HistoryTab },
    // ajouter d'autres écrans si nécessaire
  ];

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent {...props} user={user} screens={screens} logout={logout} />
      )}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        drawerStyle: { backgroundColor: "#0F172A" },
      }}
    >
      {screens.map((screen) => (
        <Drawer.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Drawer.Navigator>
  );
}

// === ROOT NAVIGATOR ===
function RootNavigator() {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: "#CBD5E1", marginTop: 10 }}>Chargement en cours...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              headerStyle: { backgroundColor: theme.colors.surface },
              headerTintColor: theme.colors.onSurface,
              title: "Créer un compte",
            }}
          />
        </>
      ) : (
        <Stack.Screen name="MainDrawer" options={{ headerShown: false }}>
          {() => <DrawerNavigator user={user} logout={logout} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

// === APP PRINCIPALE ===
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </PaperProvider>
  );
}
