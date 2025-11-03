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

  const MIN_BALANCE = 1000; // seuil minimal

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchAll);
    return unsubscribe;
  }, [navigation]);

  const fetchAll = async () => {
    await Promise.all([fetchCashes(), fetchKiosks(), fetchUsers()]);
  };

  const fetchCashes = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return Alert.alert("Erreur", userError.message);
    if (!user) return Alert.alert("Erreur", "Utilisateur non connecté");

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      Alert.alert("Erreur", profileError.message);
      return;
    }

    let query = supabase.from("cashes").select("*");
    if (profile?.role === "kiosque") query = query.eq("cashier_id", user.id);

    const { data, error } = await query;
    if (error) Alert.alert("Erreur", error.message);
    else setCashes(data || []);
  };

  const fetchKiosks = async () => {
    const { data, error } = await supabase.from("kiosks").select("id, name");
    if (!error) setKiosks(data || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role");
    if (!error) setUsers(data || []);
  };

  const deleteCash = async (id) => {
    Alert.alert("Supprimer", "Confirmer la suppression ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("cashes").delete().eq("id", id);
          if (error) Alert.alert("Erreur", error.message);
          else fetchCashes();
        },
      },
    ]);
  };

  const closeCash = async (cash) => {
    if (cash.closed) {
      Alert.alert("Info", "Cette caisse est déjà clôturée.");
      return;
    }

    Alert.alert(
      "Clôturer la caisse",
      `Voulez-vous vraiment clôturer la caisse "${cash.name}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Clôturer",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("cashes")
              .update({ closed: true })
              .eq("id", cash.id);

            if (error) Alert.alert("Erreur", error.message);
            else fetchCashes();
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
      (kiosk?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (cashier?.full_name || cashier?.email || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Rechercher une caisse, client ou coursier..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      <Button
        icon="plus"
        mode="contained"
        onPress={() => navigation.navigate("AddCash")}
        style={[styles.addButton, { width: screenWidth * 0.9, alignSelf: "center" }]}
      >
        Ajouter une caisse
      </Button>

      <FlatList
        contentContainerStyle={{ paddingBottom: 20 }}
        data={filteredCashes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const kiosk = kiosks.find((k) => k.id === item.kiosk_id);
          const cashier = users.find((u) => u.id === item.cashier_id);
          const belowMin = item.balance < MIN_BALANCE;

          return (
            <Card
              style={[
                styles.card,
                { width: screenWidth * 0.95, alignSelf: "center" },
                { backgroundColor: belowMin ? "#FEF2F2" : "#ECFDF5" },
              ]}
            >
              <Card.Title
                title={item.name}
                titleStyle={{ color: "#1F2937" }}
                subtitle={`Client: ${kiosk?.name || "—"}`}
                subtitleStyle={{ color: "#1F2937" }}
                right={(props) => (
                  <View style={{ flexDirection: "row" }}>
                    {!item.closed && (
                      <IconButton
                        {...props}
                        icon="pencil"
                        size={20}
                        onPress={() => navigation.navigate("EditCash", { cash: item })}
                      />
                    )}
                    <IconButton
                      {...props}
                      icon="delete"
                      size={20}
                      onPress={() => deleteCash(item.id)}
                    />
                    {!item.closed && (
                      <IconButton
                        {...props}
                        icon="lock"
                        size={20}
                        onPress={() => closeCash(item)}
                      />
                    )}
                  </View>
                )}
              />
              <Card.Content>
                <Text style={[styles.text, { color: "#1F2937", fontWeight: "bold" }]}>
                  {belowMin
                    ? `⚠️ Solde inférieur au seuil : ${item.balance} / ${MIN_BALANCE} FCFA`
                    : `💰 Solde OK : ${item.balance} FCFA`}
                </Text>
                <Text style={[styles.text, { color: "#1F2937" }]}>
                  👤 Coursier : {cashier?.full_name || cashier?.email || "—"}
                </Text>
                <Text style={[styles.text, { color: item.closed ? "#B91C1C" : "#166534" }]}>
                  📦 État : {item.closed ? "Clôturée" : "Ouverte"}
                </Text>
              </Card.Content>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 10 },
  searchInput: { marginHorizontal: 16, marginBottom: 10 },
  card: { marginVertical: 6, borderRadius: 12, paddingVertical: 6 },
  text: { fontSize: 16, marginVertical: 2 },
  addButton: { marginVertical: 10 },
});
