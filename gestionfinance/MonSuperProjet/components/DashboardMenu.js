export default function DashboardMenu({ navigation, user }) {
  const buttonWidth = Math.min(Math.max(width * 0.45, 120), 160);
  const topPadding = height * 0.1;

  const menuItems = [
    { label: "Caisse", route: "Caisse" },
    { label: "Transactions", route: "Transactions" },
    { label: "Fournisseur", route: "Fournisseur" },
    { label: "Vendeur", route: "Vendeur" },
    { label: "Agent", route: "Agent" },
    { label: "Utilisateurs", route: "Utilisateurs" },
  ];

  // Filtrer le menu selon le rôle
  const filteredMenu = user?.role === "kiosque"
    ? menuItems.filter(item => ["Caisse", "Transactions"].includes(item.label))
    : menuItems;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <Text variant="headlineMedium" style={styles.title}>
        📌 Menu principal
      </Text>

      {!user ? (
        <Button
          mode="outlined"
          style={[styles.menuButton, { width: buttonWidth }]}
          onPress={() => navigation.navigate("Auth")}
        >
          Se connecter
        </Button>
      ) : (
        filteredMenu.map(item => (
          <Button
            key={item.route}
            mode="contained"
            style={[styles.menuButton, { width: buttonWidth }]}
            onPress={() => navigation.navigate(item.route)}
          >
            {item.label}
          </Button>
        ))
      )}
    </View>
  );
}
