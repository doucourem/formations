import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  Button,
  Text,
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
import AddCashScreen from "./components/AddCashScreen";
import EditCashScreen from "./components/EditCashScreen";

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
  drawerContainer: { flex: 1 },
  drawerHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#334155" },
  drawerFooter: { marginTop: "auto", padding: 16, borderTopWidth: 1, borderTopColor: "#334155" },
  logoutButton: { marginTop: 10, borderColor: theme.colors.onSurface },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background },
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

// === STACKS POUR CHAQUE MODULE ===
function CashStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen name="CashesList" component={CashesList} options={{ title: "Caisse" }} />
      <Stack.Screen name="AddCash" component={AddCashScreen} options={{ title: "Ajouter Caisse" }} />
      <Stack.Screen name="EditCash" component={EditCashScreen} options={{ title: "Modifier Caisse" }} />
    </Stack.Navigator>
  );
}

// === DRAWER NAVIGATOR ===
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
      <Drawer.Screen name="Caisse" component={CashStack} />
      <Drawer.Screen name="Transactions" component={TransactionsList} />
      <Drawer.Screen name="Opérateurs" component={OperatorsList} />
      <Drawer.Screen name="Fournisseurs" component={WholesalersList} />
      <Drawer.Screen name="Clients" component={KiosksList} />
      <Drawer.Screen name="Utilisateurs" component={UsersList} />
    </Drawer.Navigator>
  );
}

// === APP CONTENT AVEC STACK GLOBAL ===
function AppContent({ user }) {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.surface }, headerTintColor: theme.colors.onSurface }}>
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
