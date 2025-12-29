import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
  useTheme,
  Button,
} from "react-native-paper";
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

/* ================= Custom Drawer ================= */
const CustomDrawerContent = ({ user, screens, navigation }) => {
  const { token, setUser, setToken } = useAuth();
  const theme = useTheme(); // ← récupère le thème courant

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        }}
      >
        <Text
          style={{
            color: theme.colors.onSurface,
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          Tableau de bord
        </Text>
        <Text style={{ color: theme.colors.placeholder }}>{user?.email}</Text>
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
            textColor={theme.colors.primary}
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

function CashStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TripListScreen"
        component={TripListScreen}
        options={{ title: "Voyage" }}
      />
      <Stack.Screen
        name="AddTicket"
        component={CreateTicketScreen}
        options={{ title: "Créer Ticket" }}
      />
      {/* Nouvelle page pour voir les transactions d’une BOUTIQUE */}
      <Stack.Screen
        name="TripTicketsScreen"
        component={TripTicketsScreen}
        options={{ title: "Tickets du voyage" }}
      />
    </Stack.Navigator>
  );
}
/* ================= Drawer Navigator ================= */
const DrawerNavigator = ({ user }) => {
  const theme = useTheme();
  const screens = [
    { name: "Tickets", component: TicketListScreen },
    { name: "Voyage", component: CashStack },
    { name: "Changer mot de passe", component: ChangePasswordScreen },
  ];

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} user={user} screens={screens} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.onSurface,
        drawerStyle: { backgroundColor: theme.dark ? "#111827" : "#fff" },
      }}
    >
      {screens.map((screen) => (
        <Drawer.Screen key={screen.name} name={screen.name} component={screen.component} />
      ))}
    </Drawer.Navigator>
  );
};

/* ================= Auth Stack ================= */
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth" component={Auth} />
    <Stack.Screen name="Register" component={Register} />
  </Stack.Navigator>
);

/* ================= Main App Content ================= */
const AppContent = () => {
  const { user, loading } = useAuth();
  const theme = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.onSurface }}>Chargement...</Text>
      </View>
    );
  }

  return user ? <DrawerNavigator user={user} /> : <AuthStack />;
};

/* ================= Export App ================= */
export default function App() {
  const scheme = useColorScheme(); // "dark" ou "light"
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

/* ================= Styles ================= */
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
