import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Provider as PaperProvider, MD3DarkTheme, Button } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./components/Auth";
import Register from "./components/Register";
import TicketListScreen from "./screens/TicketListScreen";
import TicketDetailScreen from "./screens/TicketDetailScreen";
import CreateTicketScreen from "./screens/CreateTicketScreen";
import TripListScreen from "./screens/TripListScreen";
import TripTicketsScreen from "./screens/TripTicketsScreen";
import ChangePasswordScreen from "./components/ChangePasswordScreen";
import { logout } from "./services/authApi";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const theme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, primary: "#4F46E5", background: "#111827", surface: "#1F2937", onSurface: "#FCFBF8" },
};

// --- Custom Drawer ---
const CustomDrawerContent = ({ user, screens, navigation }) => {
  const { token, setUser, setToken } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "#334155" }}>
        <Text style={{ color: theme.colors.onSurface, fontSize: 20, fontWeight: "bold" }}>Tableau de bord</Text>
        <Text style={{ color: "#CBD5E1" }}>{user?.email}</Text>
        <Button
          mode="outlined"
          onPress={async () => {
            await logout(token);
            setUser(null);
            setToken(null);
          }}
          style={{ marginTop: 10 }}
        >
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
            style={{ alignSelf: "stretch", borderRadius: 0, paddingVertical: 6 }}
            contentStyle={{ justifyContent: "flex-start", paddingLeft: 16 }}
          >
            {screen.name}
          </Button>
        ))}
      </DrawerContentScrollView>
    </View>
  );
};

// --- Drawer Navigator ---
const DrawerNavigator = ({ user }) => {
  const screens = [
    { name: "Tickets", component: TicketListScreen },
    { name: "Détails Ticket", component: TicketDetailScreen },
{ name: "Voyage", component: TripListScreen },
    
    { name: "Créer Ticket", component: CreateTicketScreen },
    { name: "Tickets du voyage", component: TripTicketsScreen },
    
    { name: "Changer mot de passe", component: ChangePasswordScreen },
  ];

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} user={user} screens={screens} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        drawerStyle: { backgroundColor: "#111827" },
      }}
    >
      {screens.map((screen) => (
        <Drawer.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Drawer.Navigator>
  );
};

// --- Main App ---
const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onSurface }}>Chargement...</Text>
      </View>
    );
  }

  return user ? <DrawerNavigator user={user} /> : <AuthStack />;
};

// --- Auth Stack ---
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth" component={Auth} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
);

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
