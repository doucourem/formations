import React from "react";
import { View, Image, StyleSheet, useColorScheme } from "react-native";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
  useTheme,
  ActivityIndicator,
  Text,
  IconButton // Ajouté par sécurité
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Contextes et API
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { logout } from "./services/authApi";

// Écrans
import Auth from "./components/Auth";
import Register from "./components/Register";
import TicketListScreen from "./screens/TicketListScreen";
import CreateTicketScreen from "./screens/CreateTicketScreen";
import TripListScreen from "./screens/TripListScreen";
import TripTicketsScreen from "./screens/TripTicketsScreen";
import ChangePasswordScreen from "./components/ChangePasswordScreen";

// Assets
import logo from "./assets/logo.png";

/* ================= THÈMES PERSONNALISÉS ================= */
const commonTheme = { roundness: 10 };

const LightThemeCustom = {
  ...MD3LightTheme,
  ...commonTheme,
  colors: { 
    ...MD3LightTheme.colors, 
    primary: "#4CAF50", 
    secondary: "#FF9800", 
    background: "#F8F9FA", 
    surface: "#FFFFFF",
    outline: "#E0E0E0"
  },
};

const DarkThemeCustom = {
  ...MD3DarkTheme,
  ...commonTheme,
  colors: { 
    ...MD3DarkTheme.colors, 
    primary: "#4CAF50", 
    secondary: "#FF9800", 
    background: "#121212", 
    surface: "#1E1E1E",
    outline: "#333333"
  },
};

/* ================= COMPOSANTS UI ================= */

const HeaderLogo = () => (
  <Image source={logo} style={styles.logo} />
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ================= CONFIGURATION NAVIGATION ================= */

const getScreenOptions = (theme) => ({
  headerStyle: { backgroundColor: theme.colors.surface },
  headerTintColor: theme.colors.primary,
  headerTitleAlign: "center",
  headerTitleStyle: { fontWeight: "bold", fontSize: 17 },
  headerShadowVisible: false,
});

/* ================= STACKS DE NAVIGATION ================= */

function TicketsStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator screenOptions={getScreenOptions(theme)}>
      <Stack.Screen 
        name="TicketList" 
        component={TicketListScreen} 
        options={{ title: "Mes Tickets", headerLeft: () => <HeaderLogo /> }} 
      />
    </Stack.Navigator>
  );
}

function VoyagesStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator screenOptions={({ navigation }) => ({
      ...getScreenOptions(theme),
      headerLeft: () => (
        navigation.canGoBack() ? (
          <IconButton 
            icon="arrow-left" 
            onPress={() => navigation.goBack()} 
            iconColor={theme.colors.primary}
          />
        ) : <HeaderLogo />
      )
    })}>
      <Stack.Screen 
        name="TripListScreen" 
        component={TripListScreen} 
        options={{ title: "Voyages Disponibles" }} 
      />
      <Stack.Screen 
        name="AddTicket" 
        component={CreateTicketScreen} 
        options={{ title: "Vendre un Billet" }} 
      />
      <Stack.Screen 
        name="TripTicketsScreen" 
        component={TripTicketsScreen} 
        options={{ title: "Liste des Passagers" }} 
      />
    </Stack.Navigator>
  );
}

function PasswordStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator screenOptions={getScreenOptions(theme)}>
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ title: "Sécurité", headerLeft: () => <HeaderLogo /> }} 
      />
    </Stack.Navigator>
  );
}

/* ================= GESTION DÉCONNEXION ================= */

function LogoutTab() {
  const { token, setUser, setToken } = useAuth();
  const theme = useTheme();

  React.useEffect(() => {
    const doLogout = async () => {
      try { await logout(token); } catch (e) { console.error("Logout error", e); }
      finally { setUser(null); setToken(null); }
    };
    doLogout();
  }, []);

  return (
    <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ marginTop: 15 }}>Fermeture de session...</Text>
    </View>
  );
}

/* ================= NAVIGATEURS PRINCIPAUX ================= */

function TabNavigator() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: { 
          backgroundColor: theme.colors.surface, 
          height: 65, 
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "Tickets") iconName = focused ? "ticket" : "ticket-outline";
          else if (route.name === "Voyages") iconName = focused ? "bus-clock" : "bus";
          else if (route.name === "Profil") iconName = focused ? "shield-check" : "shield-check-outline";
          else if (route.name === "Quitter") iconName = "logout";

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Voyages" component={VoyagesStack} />
      <Tab.Screen name="Tickets" component={TicketsStack} />
      <Tab.Screen name="Profil" component={PasswordStack} />
      <Tab.Screen name="Quitter" component={LogoutTab} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={Auth} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

/* ================= LOGIQUE ROOT ================= */

function AppContent() {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return user ? <TabNavigator /> : <AuthStack />;
}

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? DarkThemeCustom : LightThemeCustom;

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer theme={theme}>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 32, height: 32, resizeMode: "contain", marginLeft: 15 },
});