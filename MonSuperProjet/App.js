import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from "react-native";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  Button,
  Text,
  Card,
  List,
  Dialog,
  Portal,
  TextInput,
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import supabase from "./supabaseClient";

// Composants internes
import Auth from "./components/Auth";
import Register from "./components/Register";
import CashesList from "./components/CashesList";
import TransactionsList from "./components/TransactionsList";
import OperatorsList from "./components/OperatorsList";
import WholesalersList from "./components/WholesalersList";
import WholesalerTransactionsList from "./components/WholesalerTransactionsList";
import KiosksList from "./components/KiosksList";
import UsersList from "./components/UsersList";
import DashboardMenu from "./components/DashboardMenu";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// === THÈME GLOBAL ===
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#2563EB",
    secondary: "#10B981",
    accent: "#FACC15",
    error: "#EF4444",
    success: "#22C55E",
    background: "#0A0F1A",
    surface: "#1E293B",
    onSurface: "#F8FAFC",
    onBackground: "#F8FAFC",
    disabled: "#64748B",
    placeholder: "#94A3B8",
  },
};

// === STYLES GLOBAUX ===
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  drawerContainer: { flex: 1 },
  drawerHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#334155" },
  drawerFooter: { marginTop: "auto", padding: 16, borderTopWidth: 1, borderTopColor: "#334155" },
  logoutButton: { marginTop: 10, borderColor: theme.colors.onSurface },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  card: { marginBottom: 12, backgroundColor: theme.colors.surface, elevation: 4 },
  actions: { flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' },
  actionButton: { padding: 8, borderRadius: 5, marginBottom: 4, backgroundColor: theme.colors.primary },
  transactionsButton: { backgroundColor: theme.colors.accent },
  deleteButton: { backgroundColor: theme.colors.error },
  actionText: { color: 'white', fontSize: 12 },
  errorText: { color: theme.colors.error, textAlign: 'center', marginVertical: 8 },
  successText: { color: theme.colors.success, textAlign: 'center', marginVertical: 8 },
  input: { marginBottom: 16, backgroundColor: theme.colors.surface, color: theme.colors.onSurface },
  title: { textAlign: "center", marginBottom: 20, fontWeight: "bold", color: theme.colors.onBackground },
  addButton: { marginBottom: 20 },
  label: { color: theme.colors.onSurface, marginBottom: 8, fontSize: 16 },
  typeButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 8 },
  typeButton: { flex: 1, marginHorizontal: 4 },
  noDataText: { textAlign: "center", color: "#CBD5E1", marginTop: 40, fontSize: 16 },
});

// === DRAWER CUSTOM ===
const CustomDrawerContent = ({ user, ...props }) => (
  <View style={styles.drawerContainer}>
    <View style={styles.drawerHeader}>
      <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
        Dashboard
      </Text>
      <Text style={{ color: "#CBD5E1" }}>{user?.email}</Text>
      <Button
        mode="outlined"
        style={styles.logoutButton}
        onPress={async () => await supabase.auth.signOut()}
      >
        Se déconnecter
      </Button>
    </View>
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <DrawerItemList {...props} />
      <View style={styles.drawerFooter}>
        <Text style={{ color: "#94A3B8", fontSize: 12, textAlign: "center" }}>
          © 2025 Ma Société - Version 1.0
        </Text>
      </View>
    </DrawerContentScrollView>
  </View>
);

// === NAVIGATIONS ===
function DrawerNavigator({ user }) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} user={user} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: "#CBD5E1",
        drawerStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      <Drawer.Screen name="Dashboard">
        {(props) => <DashboardMenu {...props} user={user} />}
      </Drawer.Screen>
      <Drawer.Screen name="Caisse" component={CashesList} />
      <Drawer.Screen name="Transactions" component={TransactionsList} />
      <Drawer.Screen name="Fournisseur" component={OperatorsList} />
      <Drawer.Screen name="Vendeur" component={WholesalersList} />
      <Drawer.Screen name="Agent" component={KiosksList} />
      <Drawer.Screen name="Utilisateurs" component={UsersList} />
    </Drawer.Navigator>
  );
}

function AppContent({ user }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen name="DrawerStack" options={{ headerShown: false }}>
        {() => <DrawerNavigator user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="WholesalerTransactions"
        component={WholesalerTransactionsList}
        options={({ route }) => ({ title: `Transactions - ${route.params.wholesalerName}` })}
      />
    </Stack.Navigator>
  );
}

// === APP PRINCIPALE ===
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: theme.colors.onBackground }}>Chargement...</Text>
      </View>
    );

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        {user ? (
          <AppContent user={user} />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={Auth} />
            <Stack.Screen name="Register" component={Register} />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}
