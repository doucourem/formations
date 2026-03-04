import React, { useEffect, useState, useMemo, memo } from "react";
import { View, FlatList, Alert, StyleSheet, RefreshControl, StatusBar } from "react-native";
import { Card, Text, Button, IconButton, TextInput, ActivityIndicator, useTheme } from "react-native-paper";
import supabase from "../supabaseClient";

/* ================= CARD ================= */
const CashCard = memo(({ item, profile, navigation, onDelete }) => {
  const { colors } = useTheme();
  const isNegative = item.balance < 0;

  return (
    <Card style={styles.card} elevation={1}>
      <Card.Title
        title={item.name}
        titleStyle={styles.cardTitle}
        subtitle={`Client : ${item.kiosk_name || "—"}`}
        right={() => (
          <View style={{ flexDirection: "row" }}>
            {profile?.role === "admin" && !item.closed && (
              <IconButton
                icon="pencil-outline"
                iconColor={colors.primary}
                onPress={() => navigation.navigate("EditCash", { cash: item })}
              />
            )}
            {profile?.role === "admin" && (
              <IconButton
                icon="delete-outline"
                iconColor={colors.error}
                onPress={() => onDelete(item.id)}
              />
            )}
          </View>
        )}
      />

      <Card.Content>
        <Text style={[styles.balance, { color: isNegative ? colors.error : colors.secondary }]}>
          {isNegative
            ? `⚠️ Dette : ${Math.abs(item.balance).toLocaleString("fr-FR")} FCFA`
            : `💰 Avance : ${item.balance.toLocaleString("fr-FR")} FCFA`}
        </Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoText}>👤 Coursier : {item.cashier_name || "Non assigné"}</Text>
          <Text style={[styles.statusText, { color: item.closed ? colors.error : colors.secondary }]}>
            {item.closed ? "● Clôturée" : "● Ouverte"}
          </Text>
        </View>

        <Button
          mode="text"
          icon="chevron-right"
          contentStyle={{ flexDirection: 'row-reverse' }}
          style={styles.detailsBtn}
          onPress={() => navigation.navigate("TransactionsListCaisse", { cashId: item.id })}
        >
          Détails transactions
        </Button>
      </Card.Content>
    </Card>
  );
});

/* ================= MAIN ================= */
export default function CashesList({ navigation }) {
  const { colors } = useTheme();
  const [profile, setProfile] = useState(null);
  const [cashes, setCashes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = navigation.addListener("focus", init);
    return unsub;
  }, [navigation]);

  const init = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const { data: profileData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      await fetchCashes(profileData);
    }
    setLoading(false);
  };

  const fetchCashes = async (profileData) => {
    let query = supabase.from("cashes_view").select("*");

    if (profileData.role === "kiosque") query = query.eq("cashier_id", profileData.id);
    if (profileData.role === "admin") query = query.eq("owner_id", profileData.id);

    const { data, error } = await query.order('name');
    if (error) Alert.alert("Erreur", error.message);
    else setCashes(data || []);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cashes.filter((c) =>
      (c.name || "").toLowerCase().includes(q) ||
      (c.kiosk_name || "").toLowerCase().includes(q) ||
      (c.cashier_name || "").toLowerCase().includes(q)
    );
  }, [cashes, search]);

  const deleteCash = async (id) => {
    Alert.alert("Supprimer", "Cette action est irréversible.", [
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

  const refreshCashes = async () => {
    if (!profile) return;
    setRefreshing(true);
    await fetchCashes(profile);
    setRefreshing(false);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1, backgroundColor: "#F2F2F7" }} size="large" />;

  return (
    <View style={[styles.container, { backgroundColor: "#F2F2F7" }]}>
      <StatusBar barStyle="dark-content" />
      
      <TextInput
        mode="outlined"
        placeholder="Rechercher une boutique..."
        value={search}
        onChangeText={setSearch}
        left={<TextInput.Icon icon="magnify" />}
        style={styles.search}
        outlineStyle={{ borderRadius: 12, borderColor: '#D1D1D6' }}
      />

      {profile?.role === "admin" && (
        <Button
          mode="contained"
          icon="plus"
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddCash")}
        >
          Nouvelle Boutique
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
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshCashes} />
        }
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16, backgroundColor: "#FFF" },
  addBtn: { marginHorizontal: 16, marginBottom: 12, borderRadius: 10 },
  listContent: { paddingBottom: 20 },
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: { fontWeight: "bold", color: "#1C1C1E" },
  balance: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 5 
  },
  infoText: { fontSize: 14, color: "#636366" },
  statusText: { fontSize: 12, fontWeight: "bold" },
  detailsBtn: { alignSelf: 'flex-start', marginTop: 10, marginLeft: -10 }
});