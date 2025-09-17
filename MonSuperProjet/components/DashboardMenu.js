import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Button, Text } from "react-native-paper";

const { width, height } = Dimensions.get("window");

export default function DashboardMenu({ navigation }) {
  // largeur responsive avec min/max
  const buttonWidth = Math.min(Math.max(width * 0.45, 120), 160);
  const topPadding = height * 0.1; // 10% de la hauteur de l'écran

  const menuItems = [
    { label: "Caisse", route: "Caisse" },
    { label: "Transactions", route: "Transactions" },
    { label: "Fournisseur", route: "Fournisseur" },
    { label: "Vendeur", route: "Vendeur" },
    { label: "Agent", route: "Agent" },
    { label: "Utilisateurs", route: "Utilisateurs" },
  ];

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <Text variant="headlineMedium" style={styles.title}>
        📌 Menu principal
      </Text>

      {menuItems.map((item) => (
        <Button
          key={item.route}
          mode="contained"
          style={[styles.menuButton, { width: buttonWidth }]}
          onPress={() => navigation.navigate(item.route)}
        >
          {item.label}
        </Button>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // menu en haut
    alignItems: "center",
    paddingHorizontal: 10,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  menuButton: {
    marginVertical: 8,
  },
});
