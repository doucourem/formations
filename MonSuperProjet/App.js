import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, useWindowDimensions } from "react-native";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  Button,
  Text,
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import supabase from "./supabaseClient";

// === IMPORTS INTERNES ===
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
import TransactionsListCaisse from "./components/TransactionsListCaisse";
import ChangePasswordScreen from "./components/ChangePasswordScreen";
import CourierPaymentsScreen from "./components/CourierPaymentsScreen";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// === THÈME PERSONNALISÉ ===
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4F46E5",
    secondary: "#10B981",
    accent: "#FBBF24",
    error: "#EF4444",
    background: "#111827",
    surface: "#1F2937",
    onSurface: "#FCFBF8",
    elevation: {
      level3: "#374151",
    },
  },
};

// === DRAWER CONTENU PERSONNALISÉ ===
const CustomDrawerContent = ({ user, screens, ...props }) => {
  const activeRouteName = props.state.routes[props.state.index].name;

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Tableau de bord
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Button
          mode="contained-tonal"
          icon="logout"
          onPress={async () => await supabase.auth.signOut()}
          style={styles.logoutBtn}
        >
          Déconnexion
        </Button>
      </View>

      <DrawerContentScrollView {...props}>
        {screens.map((screen) => {
          const isActive = activeRouteName === screen.name;
          return (
            <Button
              key={screen.name}
              mode={isActive ? "contained" : "text"}
              onPress={() => props.navigation.navigate(screen.name)}
              textColor={isActive ? "#FFF" : "#CBD5E1"}
              style={[styles.drawerItem, isActive && styles.activeDrawerItem]}
              contentStyle={styles.drawerItemContent}
              labelStyle={styles.drawerItemLabel}
            >
              {screen.name}
            </Button>
          );
        })}
      </DrawerContentScrollView>

      <View style={styles.drawerFooter}>
        <Text style={styles.footerText}>© 2025 Ma Société - v1.0</Text>
      </View>
    </View>
  );
};

// === STACK POUR LA GESTION DES BOUTIQUES ===
function CashStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen name="CashesList" component={CashesList} options={{ title: "BOUTIQUE" }} />
      <Stack.Screen name="AddCash" component={AddCashScreen} options={{ title: "Ajouter BOUTIQUE" }} />
      <Stack.Screen name="EditCash" component={EditCashScreen} options={{ title: "Modifier BOUTIQUE" }} />
      <Stack.Screen name="TransactionsListCaisse" component={TransactionsListCaisse} options={{ title: "Transactions" }} />
    </Stack.Navigator>
  );
}

// === NAVIGATEUR DRAWER PRINCIPAL (RESPONSIVE) ===
function DrawerNavigator({ user }) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768; // Mode Tablette/PC

 const screensByRole = {
  kiosque: [
    { name: "TRANSACTIONS", component: TransactionsList },
    { name: "BOUTIQUE", component: CashStack },
    { name: "RAPPORT", component: CourierPaymentsScreen },
    { name: "CHANGER MOT DE PASSE", component: ChangePasswordScreen },
  ],
  admin: [
    { name: "TRANSACTIONS", component: TransactionsList },
    { name: "BOUTIQUE", component: CashStack },
    { name: "CLIENTS", component: KiosksList },
    { name: "FOURNISSEURS", component: WholesalersList },
    { name: "RAPPORT", component: CourierPaymentsScreen },
    { name: "OPÉRATEURS", component: OperatorsList },
    { name: "UTILISATEURS", component: UsersList },
    { name: "CHANGER MOT DE PASSE", component: ChangePasswordScreen },
  ],
};


  const role = user?.role || "kiosque";
  const screens = screensByRole[role] || screensByRole.kiosque;

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} user={user} screens={screens} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        drawerType: isLargeScreen ? "permanent" : "front",
        drawerStyle: {
          width: 280,
          backgroundColor: theme.colors.background,
        },
      }}
    >
      {screens.map((screen) => (
        <Drawer.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Drawer.Navigator>
  );
}

// === CONTENU APP (STACK GLOBAL) ===
function AppContent({ user }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainDrawer">
        {() => <DrawerNavigator user={user} />}
      </Stack.Screen>

      <Stack.Screen
        name="WholesalerTransactions"
        component={WholesalerTransactionsList}
        options={({ navigation, route }) => ({
          headerShown: true,
          title: `Transactions - ${route.params?.wholesalerName || "Fournisseur"}`,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              onPress={() => navigation.goBack()}
              iconColor={theme.colors.primary}
            />
          ),
        })}
      />
    </Stack.Navigator>
  );
}

// === APP PRINCIPALE ===
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const authUser = data.session?.user;

        if (authUser) {
          const { data: profile, error } = await supabase
            .from("users")
            .select("id, email, role, full_name")
            .eq("id", authUser.id)
            .maybeSingle();

          if (error) throw error;
          setUser(profile);
        }
      } catch (err) {
        console.error("Erreur Profil:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null);
      else fetchUserAndProfile();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
      </View>
    );
  }

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

// === STYLES GLOBAUX ===
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
  },
  drawerContainer: { flex: 1 },
  drawerHeader: {
    padding: 24,
    backgroundColor: "#1F2937",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  headerTitle: { color: "#FFF", fontWeight: "bold" },
  userEmail: { color: "#94A3B8", marginTop: 4, fontSize: 13 },
  logoutBtn: { marginTop: 16 },
  drawerItem: {
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  activeDrawerItem: {
    backgroundColor: "#4F46E5",
  },
  drawerItemContent: {
    justifyContent: "flex-start",
    height: 48,
  },
  drawerItemLabel: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "left",
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  footerText: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
  },
});