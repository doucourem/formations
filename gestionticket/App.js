import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
  useTheme,
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./components/Auth";
import Register from "./components/Register";
import TicketListScreen from "./screens/TicketListScreen";
import CreateTicketScreen from "./screens/CreateTicketScreen";
import TripListScreen from "./screens/TripListScreen";
import TripTicketsScreen from "./screens/TripTicketsScreen";
import ChangePasswordScreen from "./components/ChangePasswordScreen";
import { logout } from "./services/authApi";

/* ================= NAVIGATORS ================= */
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ================= TICKETS STACK ================= */
function TicketsStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen
        name="Tickets"
        component={TicketListScreen}
        options={{ title: "Tickets" }}
      />
    </Stack.Navigator>
  );
}

/* ================= VOYAGES STACK ================= */
function VoyagesStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen
        name="TripListScreen"
        component={TripListScreen}
        options={{ title: "Voyages" }}
      />
      <Stack.Screen
        name="AddTicket"
        component={CreateTicketScreen}
        options={{ title: "Créer Ticket" }}
      />
      <Stack.Screen
        name="TripTicketsScreen"
        component={TripTicketsScreen}
        options={{ title: "Tickets du voyage" }}
      />
    </Stack.Navigator>
  );
}

/* ================= PASSWORD STACK ================= */
function PasswordStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen
        name="Changer mot de passe"
        component={ChangePasswordScreen}
        options={{ title: "Changer mot de passe" }}
      />
    </Stack.Navigator>
  );
}

/* ================= LOGOUT TAB ================= */
function LogoutTab() {
  const { token, setUser, setToken } = useAuth();

  React.useEffect(() => {
    const doLogout = async () => {
      try {
        await logout(token);
      } catch (e) {
        console.log("Erreur logout", e);
      } finally {
        setUser(null);
        setToken(null);
      }
    };
    doLogout();
  }, []);

  return null;
}

/* ================= BOTTOM TABS ================= */
function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // 👈 header géré par les stacks
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: theme.colors.background },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Tickets: "ticket-outline",
            Voyages: "bus",
            "Changer mot de passe": "lock-outline",
            Déconnexion: "logout",
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tickets" component={TicketsStack} />
      <Tab.Screen name="Voyages" component={VoyagesStack} />
      <Tab.Screen
        name="Changer mot de passe"
        component={PasswordStack}
      />
      <Tab.Screen name="Déconnexion" component={LogoutTab} />
    </Tab.Navigator>
  );
}

/* ================= AUTH STACK ================= */
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={Auth} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

/* ================= APP CONTENT ================= */
function AppContent() {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={{ color: theme.colors.onSurface }}>Chargement...</Text>
      </View>
    );
  }

  return user ? <TabNavigator /> : <AuthStack />;
}

/* ================= APP ROOT ================= */
export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? MD3DarkTheme : MD3LightTheme;

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

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
