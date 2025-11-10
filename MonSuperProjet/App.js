import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Dimensions } from "react-native";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  Button,
  Text,
  IconButton,
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
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

// === DIMENSIONS & FONTS RESPONSIVE ===
const { width, height } = Dimensions.get("window");
const responsiveFont = (f) => Math.round(f * (width / 375));

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// === THÈME SOMBRE PERSONNALISÉ ===
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
    onSurface: "#FCFBF8",
    onBackground: "#0B77E4",
    disabled: "#6B7280",
    placeholder: "#9CA3AF",
  },
};

// === STYLES GLOBAUX ===
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  drawerContainer: { flex: 1 },
  drawerHeader: {
    padding: width * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  drawerFooter: {
    marginTop: "auto",
    padding: width * 0.04,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
});

// === DRAWER CUSTOM ===
const CustomDrawerContent = ({ user, screens, ...props }) => (
  <View style={styles.drawerContainer}>
    <View style={styles.drawerHeader}>
      <Text variant="headlineSmall" style={{ color: theme.colors.onSurface, fontSize: responsiveFont(18) }}>
        Tableau de bord
      </Text>
      <Text style={{ color: "#CBD5E1", fontSize: responsiveFont(14), marginTop: height * 0.005 }}>
        {user?.email}
      </Text>
      <Button
        mode="outlined"
        onPress={async () => await supabase.auth.signOut()}
        style={{ marginTop: height * 0.015 }}
      >
        Déconnexion
      </Button>
    </View>

    <DrawerContentScrollView {...props}>
      {screens.map((screen) => (
        <Button
          key={screen.name}
          mode="text"
          onPress={() => props.navigation.navigate(screen.name)}
          textColor="#CBD5E1"
          style={{ justifyContent: "flex-start", paddingVertical: height * 0.012 }}
        >
          {screen.name}
        </Button>
      ))}
      <View style={styles.drawerFooter}>
        <Text style={{ color: "#94A3B8", fontSize: responsiveFont(12), textAlign: "center" }}>
          © 2025 Ma Société - Version 1.0
        </Text>
      </View>
    </DrawerContentScrollView>
  </View>
);

// === STACK POUR CAISSES ===
function CashStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CashesList"
        component={CashesList}
        options={{ title: "Caisse" }}
      />
      <Stack.Screen
        name="AddCash"
        component={AddCashScreen}
        options={{ title: "Ajouter Caisse" }}
      />
      <Stack.Screen
        name="EditCash"
        component={EditCashScreen}
        options={{ title: "Modifier Caisse" }}
      />
      <Stack.Screen
        name="TransactionsListCaisse"
        component={TransactionsListCaisse}
        options={{ title: "Transactions" }}
      />
    </Stack.Navigator>
  );
}

// === DRAWER NAVIGATOR ===
function DrawerNavigator({ user }) {
  const screensByRole = {
    kiosque: [
      { name: "Caisse", component: CashStack },
      { name: "Transactions", component: TransactionsList },
    ],
    admin: [
      { name: "Caisse", component: CashStack },
      { name: "Transactions", component: TransactionsList },
      { name: "Opérateurs", component: OperatorsList },
      { name: "Fournisseurs", component: WholesalersList },
      { name: "Clients", component: KiosksList },
      { name: "Utilisateurs", component: UsersList },
    ],
  };

  const role = user?.role || "kiosque";
  const screens = screensByRole[role] || screensByRole.kiosque;
  const drawerBackground = role === "admin" ? "#111827" : "#1E3A8A";

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} user={user} screens={screens} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        drawerStyle: { backgroundColor: drawerBackground },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: "#CBD5E1",
      }}
    >
      {screens.map((screen) => (
        <Drawer.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Drawer.Navigator>
  );
}

// === APP CONTENT ===
function AppContent({ user }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MainDrawer" options={{ headerShown: false }}>
        {() => <DrawerNavigator user={user} />}
      </Stack.Screen>

      <Stack.Screen
        name="WholesalerTransactions"
        component={WholesalerTransactionsList}
        options={({ navigation, route }) => ({
          title: `Transactions - ${route.params.wholesalerName}`,
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
          headerLeft: () => (
            <IconButton
              icon="arrow-left"
              size={width * 0.06} // responsive
              onPress={() => navigation.goBack()}
              color={theme.colors.primary}
              style={{ marginLeft: width * 0.01 }}
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

          if (error) Alert.alert("Erreur", error.message);
          else setUser(profile);
        }
      } catch (err) {
        Alert.alert("Erreur", err.message);
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
        <Text style={{ color: theme.colors.onSurface, fontSize: responsiveFont(16) }}>
          Chargement...
        </Text>
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
