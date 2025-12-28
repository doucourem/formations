import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  useWindowDimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { TextInput, Button, Card, Text } from "react-native-paper";
import supabase from "../supabaseClient";

export default function EditCashScreen({ route, navigation }) {
  const { cash } = route.params;
  const { width: screenWidth } = useWindowDimensions();

  const [user, setUser] = useState(null);

  const [name, setName] = useState(cash.name);
  const [balance, setBalance] = useState(cash.balance.toString());
  const [minBalance, setMinBalance] = useState(cash.min_balance?.toString() || "");

  const [kioskId, setKioskId] = useState(cash.kiosk_id);
  const [courierId, setCourierId] = useState(cash.cashier_id);
  const [sellerId, setSellerId] = useState(cash.seller_id);

  const [kiosks, setKiosks] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [sellers, setSellers] = useState([]);

  const [kioskQuery, setKioskQuery] = useState("");
  const [courierQuery, setCourierQuery] = useState("");
  const [sellerQuery, setSellerQuery] = useState("");

  // 🔹 Charger admin connecté et ses kiosques/utilisateurs
  useEffect(() => {
    const loadData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) return Alert.alert("Erreur Auth", authError.message);
      setUser(user);

      await fetchKiosks(user.id);
      await fetchCouriers(user.id);
      await fetchSellers(user.id);
    };
    loadData();
  }, []);

  const fetchKiosks = async (adminId) => {
    const { data, error } = await supabase
      .from("kiosks")
      .select("id, name")
      .eq("owner_id", adminId); // uniquement kiosques de l'admin
    if (error) return Alert.alert("Erreur", error.message);
    setKiosks(data || []);

    const currentKiosk = data?.find(k => k.id === kioskId);
    if (currentKiosk) setKioskQuery(currentKiosk.name);
  };

  const fetchCouriers = async (adminId) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role")
      .eq("role", "kiosque")
      .eq("owner_id", adminId); // uniquement ses utilisateurs
    if (error) return Alert.alert("Erreur", error.message);
    setCouriers(data || []);

    const currentCourier = data?.find(u => u.id === courierId);
    if (currentCourier) setCourierQuery(currentCourier.full_name || currentCourier.email);
  };

  const fetchSellers = async (adminId) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role")
      .eq("role", "grossiste")
      .eq("owner_id", adminId); // uniquement ses utilisateurs
    if (error) return Alert.alert("Erreur", error.message);
    setSellers(data || []);

    const currentSeller = data?.find(u => u.id === sellerId);
    if (currentSeller) setSellerQuery(currentSeller.full_name || currentSeller.email);
  };

  const handleUpdate = async () => {
    if (!name || !minBalance || !kioskId) {
      return Alert.alert("Erreur", "Tous les champs sont requis.");
    }

    const numericBalance = parseFloat(balance);
    const numericMinBalance = parseFloat(minBalance);

    const { error } = await supabase
      .from("cashes")
      .update({
        name,
        min_balance: numericMinBalance,
        kiosk_id: kioskId,
        cashier_id: courierId,
        seller_id: sellerId,
      })
      .eq("id", cash.id);

    if (error) Alert.alert("Erreur", error.message);
    else {
      Alert.alert("✅ Succès", "BOUTIQUE mise à jour !");
      navigation.goBack();
    }
  };

  // 🔹 Filtrage automatique
  const filteredKiosks = kiosks.filter(k => k.name.toLowerCase().includes(kioskQuery.toLowerCase()));
  const filteredCouriers = couriers.filter(u => (u.full_name || u.email || "").toLowerCase().includes(courierQuery.toLowerCase()));
  const filteredSellers = sellers.filter(u => (u.full_name || u.email || "").toLowerCase().includes(sellerQuery.toLowerCase()));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={[styles.card, { width: screenWidth - 20 }]}>
        <Card.Title title="Modifier la BOUTIQUE" />
        <Card.Content>
          <TextInput label="Nom" value={name} onChangeText={setName} style={styles.input} />
          <TextInput label="Seuil minimum" keyboardType="numeric" value={minBalance} onChangeText={setMinBalance} style={styles.input} />

          {/* Sélection kiosque */}
          <Text style={styles.label}>Client</Text>
          <TextInput
            placeholder="Rechercher un client..."
            value={kioskQuery}
            onChangeText={text => { setKioskQuery(text); setKioskId(null); }}
            style={styles.input}
          />
          {kioskQuery.length > 0 && filteredKiosks.length > 0 && (
            <FlatList
              data={filteredKiosks}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { setKioskId(item.id); setKioskQuery(item.name); }} style={styles.autocompleteItem}>
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Sélection coursier */}
          <Text style={styles.label}>Coursier</Text>
          <TextInput
            placeholder="Rechercher un coursier..."
            value={courierQuery}
            onChangeText={text => { setCourierQuery(text); setCourierId(null); }}
            style={styles.input}
          />
          {courierQuery.length > 0 && filteredCouriers.length > 0 && (
            <FlatList
              data={filteredCouriers}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { setCourierId(item.id); setCourierQuery(item.full_name || item.email); }} style={styles.autocompleteItem}>
                  <Text>{item.full_name || item.email}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Sélection vendeur */}
          <Text style={styles.label}>Vendeur</Text>
          <TextInput
            placeholder="Rechercher un vendeur..."
            value={sellerQuery}
            onChangeText={text => { setSellerQuery(text); setSellerId(null); }}
            style={styles.input}
          />
          {sellerQuery.length > 0 && filteredSellers.length > 0 && (
            <FlatList
              data={filteredSellers}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { setSellerId(item.id); setSellerQuery(item.full_name || item.email); }} style={styles.autocompleteItem}>
                  <Text>{item.full_name || item.email}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <Button mode="contained" onPress={handleUpdate} style={styles.submitButton}>
            Mettre à jour
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, alignItems: "center" },
  card: { borderRadius: 12, paddingBottom: 16 },
  input: { marginBottom: 12 },
  label: { fontWeight: "bold", marginTop: 12, marginBottom: 6 },
  autocompleteItem: { padding: 8, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  submitButton: { marginTop: 20},
});
