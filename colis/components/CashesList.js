import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Card, Text, Button, IconButton, TextInput } from "react-native-paper";
import supabase from "../supabaseClient";

export default function CashesList({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();
  const [cashes, setCashes] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const fetchedProfile = await fetchProfile();
      if (fetchedProfile) await fetchAll(fetchedProfile);
    });
    return unsubscribe;
  }, [navigation]);

  const fetchProfile = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      Alert.alert("Erreur", error.message);
      return null;
    }

    setProfile(data);
    return data;
  };

  const fetchAll = async (profileData) => {
    await Promise.all([
      fetchCashes(profileData),
      fetchKiosks(),
      fetchUsers(),
    ]);
  };

  const calculateCashBalance = async (cashId) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("amount, type")
      .eq("cash_id", cashId);

    if (error) return 0;

    let balance = 0;
    data.forEach((tx) => {
      balance += tx.type === "CREDIT" ? -tx.amount : tx.amount;
    });

    return balance;
  };

  const fetchCashes = async (profileData) => {
    if (!profileData) return;

    let kioskIds = [];

    if (profileData.role === "admin") {
      const { data } = await supabase
        .from("kiosks")
        .select("id")
        .eq("owner_id", profileData.id);

      kioskIds = (data || []).map((k) => k.id);
      if (!kioskIds.length) return setCashes([]);
    }

    let query = supabase.from("cashes").select("*");

    if (profileData.role === "admin") query = query.in("kiosk_id", kioskIds);
    if (profileData.role === "kiosque")
      query = query.eq("cashier_id", profileData.id);
    if (profileData.role === "grossiste")
      query = query.eq("seller_id", profileData.id);

    const { data, error } = await query;
    if (error) return Alert.alert("Erreur", error.message);

    const withBalance = await Promise.all(
      (data || []).map(async (c) => ({
        ...c,
        balance: await calculateCashBalance(c.id),
      }))
    );

    setCashes(withBalance);
  };

  const fetchKiosks = async () => {
    const { data } = await supabase.from("kiosks").select("id, name");
    setKiosks(data || []);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("users")
      .select("id, full_name, email, role");
    setUsers(data || []);
  };

  const deleteCash = async (id) => {
    Alert.alert("Supprimer", "Confirmer la suppression ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await supabase.from("cashes").delete().eq("id", id);
          fetchCashes(profile);
        },
      },
    ]);
  };

  const closeCash = async (cash) => {
    if (cash.closed)
      return Alert.alert("Info", "Cette BOUTIQUE est déjà clôturée.");

    Alert.alert(
      "Clôturer la BOUTIQUE",
      `Clôturer "${cash.name}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Clôturer",
          style: "destructive",
          onPress: async () => {
            await supabase
              .from("cashes")
              .update({ closed: true })
              .eq("id", cash.id);
            fetchCashes(profile);
          },
        },
      ]
    );
  };

  const filteredCashes = cashes.filter((cash) => {
    const kiosk = kiosks.find((k) => k.id === cash.kiosk_id);
    const cashier = users.find((u) => u.id === cash.cashier_id);
    return (
      cash.name.toLowerCase().includes(search.toLowerCase()) ||
      kiosk?.name?.toLowerCase().includes(search.toLowerCase()) ||
      cashier?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      cashier?.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Rechercher une BOUTIQUE, client ou coursier..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        textColor="#111827"
        placeholderTextColor="#6B7280"
      />

      {profile?.role === "admin" && (
        <Button
          icon="plus"
          mode="contained"
          onPress={() => navigation.navigate("AddCash")}
          style={[styles.addButton, { width: screenWidth * 0.9 }]}
        >
          Ajouter une BOUTIQUE
        </Button>
      )}

      <FlatList
        data={filteredCashes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const kiosk = kiosks.find((k) => k.id === item.kiosk_id);
          const cashier = users.find((u) => u.id === item.cashier_id);

          return (
            <Card style={styles.card}>
              <Card.Title
                title={item.name}
                titleStyle={styles.title}
                subtitle={`Client : ${kiosk?.name || "—"}`}
                subtitleStyle={styles.subtitle}
                right={(props) => (
                  <View style={{ flexDirection: "row" }}>
                    {profile?.role === "admin" && !item.closed && (
                      <IconButton
                        {...props}
                        icon="pencil"
                        onPress={() =>
                          navigation.navigate("EditCash", { cash: item })
                        }
                      />
                    )}
                    {profile?.role === "admin" && (
                      <IconButton
                        {...props}
                        icon="delete"
                        onPress={() => deleteCash(item.id)}
                      />
                    )}
                    {!item.closed && profile?.role === "admin" && (
                      <IconButton
                        {...props}
                        icon="lock"
                        onPress={() => closeCash(item)}
                      />
                    )}
                  </View>
                )}
              />

              <Card.Content>
                <Text
                  style={[
                    styles.text,
                    {
                      fontWeight: "bold",
                      color: item.balance < 0 ? "#B91C1C" : "#166534",
                    },
                  ]}
                >
                  {item.balance < 0
                    ? `⚠️ Il nous doit : ${item.balance} FCFA`
                    : `💰 Il a une avance : ${item.balance} FCFA`}
                </Text>

                <Text style={styles.text}>
                  👤 Coursier : {cashier?.full_name || cashier?.email || "—"}
                </Text>

                <Text
                  style={[
                    styles.text,
                    { color: item.closed ? "#B91C1C" : "#166534" },
                  ]}
                >
                  📦 État : {item.closed ? "Clôturée" : "Ouverte"}
                </Text>

                <Button
                  mode="outlined"
                  icon="eye"
                  style={{ marginTop: 10 }}
                  onPress={() =>
                    navigation.navigate("TransactionsListCaisse", {
                      cashId: item.id,
                    })
                  }
                >
                  Voir les transactions
                </Button>
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  searchInput: { margin: 16, backgroundColor: "#FFFFFF" },
  card: {
    marginVertical: 6,
    marginHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  text: { fontSize: 16, marginVertical: 2, color: "#111827" },
  title: { color: "#111827", fontWeight: "700" },
  subtitle: { color: "#374151" },
  addButton: { marginVertical: 10, alignSelf: "center" },
});
