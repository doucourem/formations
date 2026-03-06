import React, { useState, useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme, // <--- AJOUTEZ CECI
  IconButton,
  ActivityIndicator,
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import supabase from "./supabaseClient";

// === IMPORTS COMPOSANTS ===
import Auth from "./components/Auth";
import Register from "./components/Register";
import HomeScreen from "./components/HomeScreen";
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

const Stack = createNativeStackNavigator();

// === CONFIGURATION DU THÈME ===
const theme = {
  ...MD3LightTheme, // On passe sur une base claire
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4F46E5",       // Indigo pour les boutons
    secondary: "#10B981",     // Vert pour les succès
    background: "#F2F2F7",    // LE "BLANC SALE" (Gris très clair type iOS)
    surface: "#FFFFFF",       // Blanc pur pour les cartes (pour qu'elles ressortent)
    onSurface: "#1C1C1E",     // Texte presque noir
    onSurfaceVariant: "#636366", // Texte gris secondaire
    outline: "#D1D1D6",       // Bordures fines
  },
};

// === CONFIGURATION DES MENUS PAR RÔLE ===
const GET_MENU_BY_ROLE = (role) => {
  const common = [
    { name: "TRANSACTIONS", route: "Transactions", icon: "swap-horizontal" },
    { name: "BOUTIQUE", route: "CashesList", icon: "storefront" },
    { name: "RAPPORT", route: "Rapport", icon: "file-document" },
    { name: "SÉCURITÉ", route: "Password", icon: "lock" },
  ];

  if (role === "admin") {
    return [
      ...common.slice(0, 2),
      { name: "CLIENTS", route: "Kiosks", icon: "account-group" },
      { name: "FOURNISSEURS", route: "Wholesalers", icon: "truck-delivery" },
      ...common.slice(2),
      { name: "OPÉRATEURS", route: "Operators", icon: "cellphone-tower" },
      { name: "UTILISATEURS", route: "Users", icon: "shield-account" },
    ];
  }
  return common;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Vérification initiale de la session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) await fetchUserProfile(session.user.id);
      setLoading(false);
    };

    initializeAuth();

    // 2. Écouteur de changement d'état
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (data) setUser(data);
    } catch (err) {
      console.error("Erreur profile:", err);
    }
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.surface} />
      <NavigationContainer>
      <Stack.Navigator
  screenOptions={{
    headerStyle: { backgroundColor: theme.colors.surface }, // fond clair
    headerTintColor: theme.colors.onSurface,              // ✅ couleur du texte et des icônes
    headerTitleStyle: { fontWeight: 'bold' },
    animation: 'slide_from_right',
    headerBackVisible: true,
  }}
>
  {user ? (
    <>
      {/* ACCUEIL DYNAMIQUE */}
      <Stack.Screen 
        name="ACCUEIL" 
        options={{ 
          title: "Ma Gestion",
          headerRight: () => (
            <IconButton 
              icon="logout" 
              onPress={() => supabase.auth.signOut()} 
              iconColor={theme.colors.error} 
            />
          ),
          // Pas de back ici car c'est le premier écran
        }}
      >
        {(props) => (
          <HomeScreen 
            {...props} 
            user={user} 
            screens={GET_MENU_BY_ROLE(user.role)} 
          />
        )}
      </Stack.Screen>

      {/* GROUPE : GESTION DES FLUX */}
      <Stack.Group>
        <Stack.Screen 
          name="Transactions" 
          component={TransactionsList} 
          options={{ title: "Transactions" }} 
        />
        <Stack.Screen 
          name="Rapport" 
          component={CourierPaymentsScreen} 
          options={{ title: "Rapports d'activité" }} 
        />
      </Stack.Group>

      {/* GROUPE : BOUTIQUES */}
      <Stack.Group>
        <Stack.Screen 
          name="CashesList" 
          component={CashesList} 
          options={{ title: "Mes Boutiques", headerTintColor: "#1C1C1E" }} 
        />
        <Stack.Screen 
          name="AddCash" 
          component={AddCashScreen} 
          options={{ title: "Nouvelle Boutique", headerTintColor: "#1C1C1E" }} 
        />
        <Stack.Screen 
          name="EditCash" 
          component={EditCashScreen} 
          options={{ title: "Paramètres Boutique", headerTintColor: "#1C1C1E" }} 
        />
        <Stack.Screen 
          name="TransactionsListCaisse" 
          component={TransactionsListCaisse} 
          options={{ title: "Historique Caisse", headerTintColor: "#1C1C1E" }} 
        />
      </Stack.Group>

      {/* GROUPE : ADMIN & TIERS */}
      <Stack.Group screenOptions={{ headerStyle: { backgroundColor: '#ffffff' } }}>
        <Stack.Screen 
          name="Kiosks" 
          component={KiosksList} 
          options={{ title: "Gestion Clients", headerTintColor: "#1C1C1E" }} 
        />
        <Stack.Screen 
          name="Wholesalers" 
          component={WholesalersList} 
          options={{ title: "Liste Fournisseurs"  , headerTintColor: "#1C1C1E" }} 
        />
        <Stack.Screen 
          name="WholesalerTransactions" 
          component={WholesalerTransactionsList} 
          options={{ title: "Détails Fournisseur"  , headerTintColor: "#1C1C1E" }} 
        />
        <Stack.Screen 
          name="Operators" 
          component={OperatorsList} 
          options={{ title: "Opérateurs Télécom", headerTintColor: "#1C1C1E" }} 
        />
        <Stack.Screen 
          name="Users" 
          component={UsersList} 
          options={{ title: "Droits d'accès", headerTintColor: "#1C1C1E" }} 
        />
      </Stack.Group>

      {/* SÉCURITÉ */}
      <Stack.Screen 
        name="Password" 
        component={ChangePasswordScreen} 
        options={{ title: "Mot de passe", headerTintColor: "#1C1C1E" }} 
      />
    </>
  ) : (
    <>
      <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
    </>
  )}
</Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#0F172A" 
    
  },
});