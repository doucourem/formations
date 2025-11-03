import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
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

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();
const roleColors = {
  admin: "#EF4444",   // rouge pour admin
  kiosque: "#2563EB", // bleu pour kiosque
};

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4F46E5",      // violet profond pour boutons principaux
    secondary: "#10B981",    // vert pour accents
    accent: "#FBBF24",       // jaune pour alertes ou highlights
    error: "#EF4444",        // rouge pour erreurs
    success: "#22C55E",      // vert pour succès
    background: "#111827",   // gris très foncé pour fond
    surface: "#1F2937",      // gris foncé pour cartes ou drawer
    onSurface: "#fcfbf8ff",    // texte clair sur surfaces sombres
    onBackground: "#0b77e4ff", // texte clair sur le fond
    disabled: "#6B7280",     // gris désactivé
    placeholder: "#9CA3AF",  // gris clair pour placeholders
  },
};



// === STYLES GLOBAUX ===
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0F1A",
  },
  drawerContainer: { flex: 1 },
  drawerHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: "#334155" },
  drawerFooter: { marginTop: "auto", padding: 16, borderTopWidth: 1, borderTopColor: "#334155" },
});

// === DRAWER CUSTOM ===
const CustomDrawerContent = ({ user, screens, ...props }) => (
  <View style={styles.drawerContainer}>
    <View style={styles.drawerHeader}>
      <Text variant="headlineSmall" style={{ color: theme.colors.onSurface }}>
        Tableau de bord
      </Text>
      <Text style={{ color: "#CBD5E1" }}>{user?.email}</Text>
      <Button
        mode="outlined"
        onPress={async () => {
          await supabase.auth.signOut();
        }}
        style={{ marginTop: 10 }}
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
          style={{ justifyContent: "flex-start" }}
        >
          {screen.name}
        </Button>
      ))}
      <View style={styles.drawerFooter}>
        <Text style={{ color: "#94A3B8", fontSize: 12, textAlign: "center" }}>
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
      <Stack.Screen name="CashesList" component={CashesList} options={{ title: "Caisse" }} />
      <Stack.Screen name="AddCash" component={AddCashScreen} options={{ title: "Ajouter Caisse" }} />
      <Stack.Screen name="EditCash" component={EditCashScreen} options={{ title: "Modifier Caisse" }} />
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

  // Définition des couleurs de fond selon rôle
  const drawerBackground = role === "admin" ? "#111827" : "#1E3A8A"; // rouge foncé admin, bleu kiosque

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent {...props} user={user} screens={screens} />
      )}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        drawerStyle: { backgroundColor: drawerBackground }, // <- fond dynamique
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: "#CBD5E1",
      }}
    >
      {screens.map((screen) => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </Drawer.Navigator>
  );
}


// === APP CONTENT ===
function AppContent({ user }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainDrawer">
        {() => <DrawerNavigator user={user} />}
      </Stack.Screen>
      <Stack.Screen
        name="WholesalerTransactions"
        component={WholesalerTransactionsList}
        options={({ route }) => ({
          title: `Transactions - ${route.params.wholesalerName}`,
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
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;

      if (authUser) {
        // 🔹 On va chercher le rôle depuis la table users (public)
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("id, email, role, full_name")
          .eq("id", authUser.id)
          .maybeSingle();

        if (profileError) {
          Alert.alert("Erreur", profileError.message);
        } else {
          setUser(profile);
        }
      }

      setLoading(false);
    };

    fetchUserAndProfile();

    // 🔄 Écoute du changement d'état
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
      } else {
        fetchUserAndProfile();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: theme.colors.onSurface }}>Chargement...</Text>
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
