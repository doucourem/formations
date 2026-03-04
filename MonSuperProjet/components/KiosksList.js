import React, { useEffect, useState, useMemo, memo } from "react";
import { View, FlatList, StyleSheet, Alert, StatusBar } from "react-native";
import {
  Provider as PaperProvider,
  Card,
  Text,
  Button,
  IconButton,
  TextInput,
  MD3LightTheme, // Changé en Light pour le "Blanc Sale"
  Portal,
  Dialog,
} from "react-native-paper";
import supabase from "../supabaseClient";

/* ================== THEME BLANC SALE ================== */
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#4F46E5",
    error: "#EF4444",
    success: "#22C55E",
    background: "#F2F2F7", // Votre blanc sale
    surface: "#FFFFFF",
    onSurface: "#1C1C1E",
    placeholder: "#8E8E93",
  },
};

/* ================== CARD ================== */
const KioskCard = memo(({ item, onEdit, onDelete }) => {
  const isNegative = item.balance < 0;

  return (
    <Card style={styles.card} elevation={1}>
      <Card.Content style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>📍 {item.location || "Lieu non défini"}</Text>

          <Text
            style={[
              styles.balance,
              { color: isNegative ? theme.colors.error : theme.colors.success },
            ]}
          >
            {isNegative
              ? `⚠️ Dette : ${Math.abs(item.balance).toLocaleString("fr-FR")} FCFA`
              : `💰 Avance : ${item.balance.toLocaleString("fr-FR")} FCFA`}
          </Text>
        </View>

        <View style={styles.actions}>
          <IconButton icon="pencil-outline" onPress={() => onEdit(item)} />
          <IconButton
            icon="delete-outline"
            iconColor={theme.colors.error}
            onPress={() => onDelete(item.kiosk_id)}
          />
        </View>
      </Card.Content>
    </Card>
  );
});

/* ================== MAIN ================== */
export default function KiosksOptimized() {
  const [kiosks, setKiosks] = useState([]);
  const [search, setSearch] = useState("");
  const [openPopup, setOpenPopup] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentKiosk, setCurrentKiosk] = useState({
    id: null,
    name: "",
    location: "",
  });

  useEffect(() => {
    fetchKiosks();
  }, []);

  // Auto-refresh 30s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => fetchKiosks(), 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchKiosks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    const { data, error } = await supabase
      .from("kiosk_balances")
      .select("*")
      .eq("owner_id", user.id)
      .order("name");

    if (error) console.log("Erreur:", error.message);
    else setKiosks(data || []);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return kiosks.filter(
      (k) =>
        (k.name?.toLowerCase() || "").includes(q) ||
        (k.location?.toLowerCase() || "").includes(q)
    );
  }, [kiosks, search]);

  const total = useMemo(
    () => filtered.reduce((sum, k) => sum + (k.balance || 0), 0),
    [filtered]
  );

  const handleDelete = (id) => {
    Alert.alert("Confirmation", "Supprimer ce client ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await supabase.from("kiosks").delete().eq("id", id);
          fetchKiosks();
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!currentKiosk.name.trim()) {
      return Alert.alert("Erreur", "Le nom est obligatoire");
    }

    setLoading(true);
    if (currentKiosk.id) {
      await supabase
        .from("kiosks")
        .update({ name: currentKiosk.name, location: currentKiosk.location })
        .eq("id", currentKiosk.id);
    } else {
      await supabase.from("kiosks").insert([
        {
          name: currentKiosk.name,
          location: currentKiosk.location,
          owner_id: user.id,
        },
      ]);
    }
    setLoading(false);
    setOpenPopup(false);
    fetchKiosks();
  };

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* TOTAL CARD */}
        <Card style={styles.totalCard} elevation={2}>
          <Card.Content>
            <Text style={styles.totalLabel}>
              {total >= 0 ? "TOTAL AVANCES CLIENTS" : "TOTAL DETTES CLIENTS"}
            </Text>
            <Text style={[styles.totalValue, { color: total >= 0 ? theme.colors.success : theme.colors.error }]}>
              {Math.abs(total).toLocaleString("fr-FR")} FCFA
            </Text>
          </Card.Content>
        </Card>

        {/* SEARCH & ADD */}
        <TextInput
          mode="outlined"
          placeholder="Rechercher un client..."
          value={search}
          onChangeText={setSearch}
          left={<TextInput.Icon icon="magnify" />}
          style={styles.searchInput}
        />

        <Button
          mode="contained"
          icon="plus"
          onPress={() => {
            setCurrentKiosk({ id: null, name: "", location: "" });
            setOpenPopup(true);
          }}
          style={styles.addButton}
        >
          Nouveau Client
        </Button>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.kiosk_id.toString()}
          renderItem={({ item }) => (
            <KioskCard
              item={item}
              onEdit={(k) => {
                setCurrentKiosk({ id: k.kiosk_id, name: k.name, location: k.location });
                setOpenPopup(true);
              }}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          removeClippedSubviews
        />

        {/* POPUP FORM */}
        <Portal>
          <Dialog visible={openPopup} onDismiss={() => setOpenPopup(false)} style={{ borderRadius: 20 }}>
            <Dialog.Title>{currentKiosk.id ? "Modifier Client" : "Nouveau Client"}</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Nom du client"
                value={currentKiosk.name}
                onChangeText={(t) => setCurrentKiosk({ ...currentKiosk, name: t })}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Lieu / Adresse"
                value={currentKiosk.location}
                onChangeText={(t) => setCurrentKiosk({ ...currentKiosk, location: t })}
                mode="outlined"
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setOpenPopup(false)}>Annuler</Button>
              <Button mode="contained" onPress={handleSave} loading={loading}>Enregistrer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  totalCard: { 
    marginBottom: 16, 
    backgroundColor: "#FFFFFF", 
    borderRadius: 15,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary 
  },
  totalLabel: { color: theme.colors.placeholder, textAlign: "center", fontSize: 12, fontWeight: "bold" },
  totalValue: { textAlign: "center", fontSize: 22, fontWeight: "900", marginTop: 4 },
  searchInput: { marginBottom: 10, backgroundColor: "#FFF" },
  addButton: { marginBottom: 15, borderRadius: 10 },
  card: { marginBottom: 10, backgroundColor: "#FFFFFF", borderRadius: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "bold", color: "#1C1C1E" },
  subtitle: { color: "#8E8E93", fontSize: 13, marginTop: 2 },
  balance: { marginTop: 6, fontWeight: "bold", fontSize: 14 },
  actions: { flexDirection: "row" },
  input: { marginBottom: 10 }
});