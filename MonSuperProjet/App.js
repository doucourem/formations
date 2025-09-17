import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { User } from "@supabase/supabase-js";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  Button,
  Text,
} from "react-native-paper";

import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import supabase from "./supabaseClient";
import Auth from "./components/Auth";
import Register from "./components/Register";
import CashesList from "./components/CashesList";
import TransactionsList from "./components/TransactionsList";
import OperatorsList from "./components/OperatorsList";
import WholesalersList from "./components/WholesalersList";
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

const CustomDrawerContent = (props) => {
  const { user } = props;
  return (
    <View style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text variant="headlineSmall" style={{ color: "#F8FAFC" }}>
          Dashboard
        </Text>
        <Text style={{ color: "#CBD5E1" }}>{user?.email}</Text>
        <Button
          mode="outlined"
          style={styles.logoutButton}
          onPress={async () => {
            await supabase.auth.signOut();
          }}
        >
          Se déconnecter
        </Button>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
};


function AppContent({ user }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={DashboardMenu}
        options={{ title: "Menu principal" }}
      />
      <Stack.Screen name="Caisse" component={CashesList} />
      <Stack.Screen name="Transactions" component={TransactionsList} />
      <Stack.Screen name="Fournisseur" component={OperatorsList} />
      <Stack.Screen name="Vendeur" component={WholesalersList} />
      <Stack.Screen name="Agent" component={KiosksList} />
      <Stack.Screen name="Utilisateurs" component={UsersList} />
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <View style={styles.loadingContainer}><Text>Chargement...</Text></View>;
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

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.onSurfaceVariant,
  },
  logoutButton: {
    marginTop: 10,
    borderColor: theme.colors.onSurface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});