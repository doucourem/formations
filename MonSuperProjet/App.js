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

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#2563eb",
    secondary: "#10b981",
    background: "#0A0F1A",
    surface: "#1E293B",
    onSurface: "#F8FAFC",
    onBackground: "#F8FAFC",
  },
};

const CustomDrawerContent = ({ user, ...props }) => (
  <View style={styles.drawerContainer}>
    <View style={styles.drawerHeader}>
      <Text variant="headlineSmall" style={{ color: "#F8FAFC" }}>
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

// Drawer principal
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

// Stack principal avec Drawer + écrans détails
function AppContent({ user }) {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.colors.surface }, headerTintColor: theme.colors.onSurface }}>
      <Stack.Screen
        name="DrawerStack"
        options={{ headerShown: false }}
      >
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

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <View style={styles.loadingContainer}><Text>Chargement...</Text></View>;

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

const styles = StyleSheet.create({
  drawerContainer: { flex: 1 },
  drawerHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#334155" },
  logoutButton: { marginTop: 10, borderColor: "#F8FAFC" },
  drawerFooter: { marginTop: "auto", padding: 16, borderTopWidth: 1, borderTopColor: "#334155" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background },
});
