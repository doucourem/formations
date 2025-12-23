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
    const unsubscribe = navigation.addListener("focus", fetchAll);
    return unsubscribe;
  }, [navigation]);

  const fetchAll = async () => {
    await Promise.all([fetchProfileAndCashes(), fetchKiosks(), fetchUsers()]);
  };

  // === Fetch user profile & cashes ===
  const fetchProfileAndCashes = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) return Alert.alert("Erreur", userError.message);
    if (!user) return Alert.alert("Erreur", "Utilisateur non connecté");

    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) return Alert.alert("Erreur", profileError.message);

    if (!profileData) {
      setHasProfile(false);
      setProfile(null);
      setCashes([]);
      return;
    } else {
      setProfile(profileData);
      setHasProfile(true);
    }

    // 1️⃣ Récupérer les cashes selon le rôle
    let query = supabase.from("cashes").select("*");
    if (profileData.role === "kiosque") query = query.eq("cashier_id", user.id);
    if (profileData.role === "grossiste") query = query.eq("seller_id", user.id);

    const { data: cashData, error: cashError } = await query;
    if (cashError) return Alert.alert("Erreur", cashError.message);
    if (!cashData || cashData.length === 0) {
      setCashes([]);
      return;
    }

    // 2️⃣ Récupérer toutes les transactions d'un coup
    const cashIds = cashData.map(c => c.id);
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("cash_id, amount, type")
      .in("cash_id", cashIds);

    if (txError) return Alert.alert("Erreur", txError.message);

    // 3️⃣ Calculer les soldes côté client
    const cashBalances = {};
    cashData.forEach(c => {
      const cashTxs = transactions.filter(t => t.cash_id === c.id);
      const balance = cashTxs.reduce(
        (sum, t) => sum + (t.type === "CREDIT" ? t.amount : -t.amount),
        0
      );
      cashBalances[c.id] = balance;
    });

    const cashesWithBalance = cashData.map(c => ({
      ...c,
      balance: cashBalances[c.id] || 0,
    }));

    setCashes(cashesWithBalance);
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
          else fetchProfileAndCashes();
        },
      },
    ]);
  };

  const closeCash = async (cash) => {
    if (cash.closed) {
      Alert.alert("Info", "Cette BOUTIQUE est déjà clôturée.");
      return;
    }

    Alert.alert(
      "Clôturer la BOUTIQUE",
      `Voulez-vous vraiment clôturer la BOUTIQUE "${cash.name}" ?`,
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
            else fetchProfileAndCashes();
          },
        },
      ]
    );
  };

  // === Créer des maps pour accès rapide aux noms ===
  const kiosksMap = Object.fromEntries(kiosks.map(k => [k.id, k.name]));
  const usersMap = Object.fromEntries(users.map(u => [u.id, u.full_name || u.email || ""]));
  const searchLower = search.toLowerCase();

  const filteredCashes = cashes.filter((cash) => {
    const kioskName = kiosksMap[cash.kiosk_id] || "";
    const cashierName = usersMap[cash.cashier_id] || "";
    return (
      cash.name.toLowerCase().includes(searchLower) ||
      kioskName.toLowerCase().includes(searchLower) ||
      cashierName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Rechercher une BOUTIQUE, client ou coursier..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
      />

      {profile && profile.role === "admin" && (
        <Button
          icon="plus"
          mode="contained"
          onPress={() => navigation.navigate("AddCash")}
          style={[styles.addButton, { width: screenWidth * 0.9, alignSelf: "center" }]}
        >
          Ajouter une BOUTIQUE
        </Button>
      )}

      {!hasProfile && (
        <Text style={{ textAlign: "center", color: "#B91C1C", marginVertical: 8, fontWeight: "600" }}>
          ⚠️ Votre profil kiosque n’est pas encore créé.
        </Text>
      )}

      <FlatList
        contentContainerStyle={{ paddingBottom: 20 }}
        data={filteredCashes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const kioskName = kiosksMap[item.kiosk_id];
          const cashierName = usersMap[item.cashier_id];
          const belowMin = item.balance < item.min_balance;

          return (
            <Card
              style={[
                styles.card,
                { width: screenWidth * 0.95, alignSelf: "center" },
                { backgroundColor: belowMin ? "#FEF2F2" : "#ECFDF5" }
              ]}
            >
             <Card.Title
  title={item.name}
  subtitle={`Client: ${kioskName || "—"}`}
  titleStyle={{ color: "#000000", fontWeight: "bold" }}      // texte noir
  subtitleStyle={{ color: "#000000" }}                        // sous-titre noir
  right={(props) => (
    <View style={{ flexDirection: "row" }}>
      {profile?.role === "admin" && !item.closed && (
        <IconButton
          {...props}
          icon="pencil"
          size={20}
          onPress={() => navigation.navigate("EditCash", { cash: item })}
        />
      )}
      {profile?.role === "admin" && (
        <IconButton {...props} icon="delete" size={20} onPress={() => deleteCash(item.id)} />
      )}
      {profile?.role === "admin" && !item.closed && (
        <IconButton {...props} icon="lock" size={20} onPress={() => closeCash(item)} />
      )}
    </View>
  )}
/>


              <Card.Content>
                <Text style={{ fontWeight: "bold", color: belowMin ? "#B91C1C" : "#166534" }}>
                  {belowMin
                    ? `⚠️ Il nous doit : ${item.balance} FCFA`
                    : `💰 Il a une avance : ${item.balance} FCFA`}
                </Text>
                <Text>👤 Coursier : {cashierName || "—"}</Text>
                <Text style={{ color: item.closed ? "#B91C1C" : "#166534" }}>
                  📦 État : {item.closed ? "Clôturée" : "Ouverte"}
                </Text>
                <Button
                  mode="outlined"
                  icon="eye"
                  onPress={() => navigation.navigate("TransactionsListCaisse", { cashId: item.id })}
                  style={{ marginTop: 10 }}
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
  container: { flex: 1, paddingVertical: 10 },
  searchInput: { marginHorizontal: 16, marginBottom: 10 },
  card: { marginVertical: 6, borderRadius: 12, paddingVertical: 6 },
  text: { fontSize: 16, marginVertical: 2 },
  addButton: { marginVertical: 10 },
});
