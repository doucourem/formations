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

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchAll);
    return unsubscribe;
  }, [navigation]);

  const fetchAll = async () => {
    await Promise.all([fetchCashes(), fetchKiosks(), fetchUsers()]);
  };

  /**
   * 🔹 Corrigé : Seul l'admin voit tout,
   * les caissiers voient uniquement leur caisse.
   */
  const fetchCashes = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return Alert.alert("Erreur", userError.message);
    if (!user) return Alert.alert("Erreur", "Utilisateur non connecté");

    // Récupérer le rôle de l'utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("users") // ou "profiles" selon ta structure
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      Alert.alert("Erreur", profileError.message);
      return;
    }

    // Si admin → tout afficher, sinon → filtrer
    let query = supabase.from("cashes").select("*");
    if (profile?.role == "kiosque") {
      query = query.eq("cashier_id", user.id);
    }

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
    if (error) Alert.alert("Erreur", error.message);
    else setUsers(data || []);
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

          return (
            <Card style={[styles.card, { width: screenWidth * 0.95, alignSelf: "center" }]}>
              <Card.Title
                title={item.name}
                subtitle={`Client: ${kiosk?.name || "—"}`}
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
                <Text
                  style={[
                    styles.text,
                    item.balance < 0 ? styles.negative : styles.positive,
                  ]}
                >
                  {item.balance < 0
                    ? `⚠️ Doit : ${Math.abs(item.balance)} FCFA`
                    : `💰 Doit recevoir : ${item.balance} FCFA`}
                </Text>
                <Text style={styles.text}>
                  👤 Coursier : {cashier?.full_name || cashier?.email || "—"}
                </Text>
                <Text style={[styles.text, { color: item.closed ? "#EF4444" : "#10B981" }]}>
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
  text: { fontSize: 16, fontWeight: "bold", marginVertical: 2 },
  positive: { color: "green" },
  negative: { color: "red" },
  addButton: { marginVertical: 10 },
});
