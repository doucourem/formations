import React, { useEffect, useState, useMemo, memo } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import {
  Provider as PaperProvider,
  Card,
  Text,
  Button,
  IconButton,
  TextInput,
  MD3DarkTheme,
  Portal,
  Dialog,
} from "react-native-paper";
import supabase from "../supabaseClient";

/* ================== THEME ================== */
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#2563EB",
    error: "#EF4444",
    success: "#22C55E",
    background: "#0A0F1A",
    surface: "#1E293B",
    onSurface: "#F8FAFC",
    placeholder: "#94A3B8",
  },
};

/* ================== CARD ================== */
const KioskCard = memo(({ item, onEdit, onDelete }) => {
  const isNegative = item.balance < 0;

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>Lieu : {item.location}</Text>

          <Text
            style={[
              styles.balance,
              {
                color: isNegative
                  ? theme.colors.error
                  : theme.colors.success,
              },
            ]}
          >
            {isNegative
              ? `⚠️ Il nous doit : ${Math.abs(item.balance).toLocaleString(
                  "fr-FR"
                )} FCFA`
              : `💰 Avance : ${item.balance.toLocaleString("fr-FR")} FCFA`}
          </Text>
        </View>

        <View style={styles.actions}>
          <IconButton icon="pencil" onPress={() => onEdit(item)} />
          <IconButton
            icon="delete"
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

  const [currentKiosk, setCurrentKiosk] = useState({
    id: null,
    name: "",
    location: "",
  });

  useEffect(() => {
    fetchKiosks();
  }, []);

  // auto-refresh toutes les 30s
useEffect(() => {
  if (!user) return;
  const interval = setInterval(() => {
    fetchKiosks();
  }, 30000);
  return () => clearInterval(interval);
}, [user]);
  /* ================= FETCH ================= */
  const fetchKiosks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    setUser(user);

    const { data, error } = await supabase
      .from("kiosk_balances")
      .select("*")
      .eq("owner_id", user.id)
      .order("name");

    if (error) Alert.alert("Erreur", error.message);
    else setKiosks(data || []);
  };

  /* ================= SEARCH ================= */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return kiosks.filter(
      (k) =>
        k.name.toLowerCase().includes(q) ||
        k.location.toLowerCase().includes(q)
    );
  }, [kiosks, search]);

  /* ================= TOTAL ================= */
  const total = useMemo(
    () => filtered.reduce((sum, k) => sum + k.balance, 0),
    [filtered]
  );

  /* ================= DELETE ================= */
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

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text style={styles.header}>Clients & Soldes</Text>

        {/* TOTAL */}
       <Card style={styles.totalCard}>
  <Card.Content>
    <Text style={styles.totalLabel}>
      {total >= 0 ? "ON VOUS DOIT" : "VOUS DEVEZ"}
    </Text>

    <Text
      style={[
        styles.totalValue,
        {
          color:
            total >= 0
              ? theme.colors.success
              : theme.colors.error,
        },
      ]}
    >
      {Math.abs(total).toLocaleString("fr-FR")} FCFA
    </Text>
  </Card.Content>
</Card>

        {/* SEARCH */}
        <TextInput
          mode="outlined"
          placeholder="Rechercher un client ou un lieu"
          value={search}
          onChangeText={setSearch}
          style={{ marginBottom: 12 }}
        />

        <Button
          mode="contained"
          onPress={() => {
            setCurrentKiosk({ id: null, name: "", location: "" });
            setOpenPopup(true);
          }}
          style={{ marginBottom: 12 }}
        >
          Ajouter un client
        </Button>

        {/* LIST */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.kiosk_id.toString()}
          renderItem={({ item }) => (
            <KioskCard
              item={item}
              onEdit={(kiosk) => {
                setCurrentKiosk({
                  id: kiosk.kiosk_id,
                  name: kiosk.name,
                  location: kiosk.location,
                });
                setOpenPopup(true);
              }}
              onDelete={handleDelete}
            />
          )}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews
        />

        {/* POPUP */}
        <Portal>
          <Dialog
            visible={openPopup}
            onDismiss={() => setOpenPopup(false)}
          >
            <Dialog.Title>
              {currentKiosk.id
                ? "Modifier client"
                : "Ajouter client"}
            </Dialog.Title>

            <Dialog.Content>
              <TextInput
                label="Nom du client"
                value={currentKiosk.name}
                onChangeText={(text) =>
                  setCurrentKiosk({
                    ...currentKiosk,
                    name: text,
                  })
                }
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Lieu"
                value={currentKiosk.location}
                onChangeText={(text) =>
                  setCurrentKiosk({
                    ...currentKiosk,
                    location: text,
                  })
                }
                style={styles.input}
                mode="outlined"
              />
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={() => setOpenPopup(false)}>
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={async () => {
                  if (
                    !currentKiosk.name 
                  ) {
                    return Alert.alert(
                      "Erreur",
                      "Tous les champs sont obligatoires"
                    );
                  }

                  if (currentKiosk.id) {
                    await supabase
                      .from("kiosks")
                      .update({
                        name: currentKiosk.name,
                        location: currentKiosk.location,
                      })
                      .eq("id", currentKiosk.id);
                  } else {
                    await supabase.from("kiosks").insert([
                      {
                        name: currentKiosk.name,
                        location: currentKiosk.location,
                        user_id: user.id,
                        owner_id: user.id,
                      },
                    ]);
                  }

                  setOpenPopup(false);
                  fetchKiosks();
                }}
              >
                Enregistrer
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
}

/* ================== STYLES ================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  card: {
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
  },
  row: { flexDirection: "row" },
  title: { fontSize: 16, fontWeight: "bold" },
  subtitle: { color: theme.colors.placeholder },
  balance: { marginTop: 4, fontWeight: "bold" },
  actions: { flexDirection: "row" },
  totalCard: {
    marginBottom: 12,
    backgroundColor: theme.colors.primary,
  },
  totalLabel: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  totalValue: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 4,
  },
  input: { marginBottom: 12 },
});
