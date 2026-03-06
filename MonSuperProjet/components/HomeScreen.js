import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Text, Avatar, useTheme, Surface } from "react-native-paper";

const ICONS = {
  TRANSACTIONS: "swap-horizontal",
  BOUTIQUE: "storefront",
  CLIENTS: "account-group",
  FOURNISSEURS: "bank",
  RAPPORT: "file-chart",
  OPÉRATEURS: "cellphone-tower",
  UTILISATEURS: "shield-account",
  SÉCURITÉ: "lock-reset",
};

export default function HomeScreen({ navigation, user, screens }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcome}>Bienvenue</Text>
            <Text style={styles.username}>{user?.full_name || "Utilisateur"}</Text>
          </View>
        </View>

        {/* CARD DASHBOARD */}
    
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>OPÉRATIONS</Text>

        <View style={styles.grid}>
          {screens.map((item) => (
            <TouchableOpacity
              key={item.route}
              activeOpacity={0.9}
              style={[styles.card, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate(item.route)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Avatar.Icon
                  icon={ICONS[item.name] || "dots-grid"}
                  size={40}
                  style={{ backgroundColor: "transparent" }}
                  color={colors.primary}
                />
              </View>

              <Text style={[styles.cardLabel, { color: colors.onSurface }]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 50,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcome: {
    color: "#ffffffaa",
    fontSize: 14,
  },

  username: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  balanceCard: {
    marginTop: 25,
    borderRadius: 18,
    padding: 20,
    backgroundColor: "#fff",
  },

  balanceLabel: {
    fontSize: 12,
    color: "#888",
  },

  balance: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },

  content: {
    padding: 20,
    paddingTop: 30,
  },

  sectionTitle: {
    color: "#8E8E93",
    fontWeight: "700",
    marginBottom: 18,
    letterSpacing: 1,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    height: 120,
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  iconContainer: {
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },

  cardLabel: {
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
});
