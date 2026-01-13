import React, { useEffect, useState, useMemo, memo } from "react";
import { View, FlatList, Alert, StyleSheet, RefreshControl } from "react-native";
import { Card, Text, Button, IconButton, TextInput, ActivityIndicator } from "react-native-paper";
import supabase from "../supabaseClient";

/* ================= CARD ================= */
const CashCard = memo(({ item, profile, navigation, onDelete, onClose }) => {
  const isNegative = item.balance < 0;

  return (
    <Card style={[styles.card, { backgroundColor: "#F3F4F6" }]}>
      <Card.Title
        title={item.name}
        titleStyle={{ color: "#111827", fontWeight: "bold" }}
        subtitle={`Client : ${item.kiosk_name || "—"}`}
        subtitleStyle={{ color: "#374151" }}
        right={() => (
          <View style={{ flexDirection: "row" }}>
            {profile?.role === "admin" && !item.closed && (
              <IconButton
                icon="pencil"
                iconColor="#2563EB"
                onPress={() => navigation.navigate("EditCash", { cash: item })}
              />
            )}
            {profile?.role === "admin" && (
              <IconButton
                icon="delete"
                iconColor="#B91C1C"
                onPress={() => onDelete(item.id)}
              />
            )}
            {profile?.role === "admin" && !item.closed && (
              <IconButton
                icon="lock"
                iconColor="#065F46"
                onPress={() => onClose(item)}
              />
            )}
          </View>
        )}
      />

      <Card.Content>
        <Text style={[styles.balance, { color: isNegative ? "#B91C1C" : "#166534" }]}>
          {isNegative
            ? `⚠️ Il nous doit : ${Math.abs(item.balance).toLocaleString("fr-FR")} FCFA`
            : `💰 Avance : ${item.balance.toLocaleString("fr-FR")} FCFA`}
        </Text>

        <Text style={[styles.text, { color: "#374151" }]}>
          👤 Coursier : {item.cashier_name || item.cashier_email || "—"}
        </Text>

        <Text style={[styles.text, { color: item.closed ? "#B91C1C" : "#065F46" }]}>
          📦 État : {item.closed ? "Clôturée" : "Ouverte"}
        </Text>

        <Button
          mode="outlined"
          icon="eye"
          textColor="#2563EB"
          style={{ marginTop: 8 }}
          onPress={() => navigation.navigate("TransactionsListCaisse", { cashId: item.id })}
        >
          Voir les transactions
        </Button>
      </Card.Content>
    </Card>
  );
});

/* ================= MAIN ================= */
export default function CashesList({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [cashes, setCashes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /* ===== INIT ET FOCUS ===== */
  useEffect(() => {
    const unsub = navigation.addListener("focus", init);
    return unsub;
  }, [navigation]);

  const init = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profileData, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Erreur", error.message);
      setLoading(false);
      return;
    }

    setProfile(profileData);
    await fetchCashes(profileData);
    setLoading(false);
  };

  /* ===== FETCH CAISHES ===== */
  const fetchCashes = async (profileData) => {
    let query = supabase.from("cashes_view").select("*");

    if (profileData.role === "kiosque") query = query.eq("cashier_id", profileData.id);
    if (profileData.role === "grossiste") query = query.eq("seller_id", profileData.id);
    if (profileData.role === "admin") query = query.eq("owner_id", profileData.id);

    const { data, error } = await query;
    if (error) Alert.alert("Erreur", error.message);
    else setCashes(data || []);
  };

  /* ===== SEARCH MEMO ===== */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cashes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.kiosk_name?.toLowerCase().includes(q) ||
        c.cashier_name?.toLowerCase().includes(q) ||
        c.cashier_email?.toLowerCase().includes(q)
    );
  }, [cashes, search]);

  /* ===== DELETE ===== */
  const deleteCash = async (id) => {
    Alert.alert("Supprimer", "Confirmer ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await supabase.from("cashes").delete().eq("id", id);
          setCashes((prev) => prev.filter((c) => c.id !== id));
        },
      },
    ]);
  };

  /* ===== CLOSE ===== */
  const closeCash = async (cash) => {
    Alert.alert("Clôturer", `Clôturer "${cash.name}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Clôturer",
        style: "destructive",
        onPress: async () => {
          await supabase.from("cashes").update({ closed: true }).eq("id", cash.id);
          setCashes((prev) =>
            prev.map((c) => (c.id === cash.id ? { ...c, closed: true } : c))
          );
        },
      },
    ]);
  };

  /* ===== PULL-TO-REFRESH ===== */
  const refreshCashes = async () => {
    if (!profile) return;
    setRefreshing(true);
    await fetchCashes(profile);
    setRefreshing(false);
  };

  /* ===== AUTO-REFRESH ===== */
  useEffect(() => {
    if (!profile) return;
    const interval = setInterval(() => {
      fetchCashes(profile);
    }, 30000); // toutes les 10 secondes
    return () => clearInterval(interval);
  }, [profile]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Rechercher boutique, client ou coursier..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {profile?.role === "admin" && (
        <Button
          mode="contained"
          icon="plus"
          style={styles.add}
          onPress={() => navigation.navigate("AddCash")}
        >
          Ajouter une BOUTIQUE
        </Button>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CashCard
            item={item}
            profile={profile}
            navigation={navigation}
            onDelete={deleteCash}
            onClose={closeCash}
          />
        )}
        initialNumToRender={8}
        windowSize={5}
        removeClippedSubviews
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshCashes} />
        }
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  search: { margin: 16 },
  add: { marginBottom: 8, marginHorizontal: 16 },
  card: {
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  balance: { fontWeight: "bold", marginBottom: 4 },
  text: { fontSize: 15 },
});
