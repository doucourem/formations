import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Alert, useWindowDimensions, FlatList, TouchableOpacity } from "react-native";
import { Card, TextInput, Text, Button } from "react-native-paper";
import supabase from "../supabaseClient";

export default function AddCashScreen({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [minBalance, setMinBalance] = useState("");

  const [kioskId, setKioskId] = useState(null);
  const [courierId, setCourierId] = useState(null);
  const [sellerId, setSellerId] = useState(null);

  const [kiosks, setKiosks] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [sellers, setSellers] = useState([]);

  const [kioskQuery, setKioskQuery] = useState("");
  const [courierQuery, setCourierQuery] = useState("");
  const [sellerQuery, setSellerQuery] = useState("");

  // 🔹 Charger l’admin connecté et ses kiosques/utilisateurs
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

  // 🔹 Kiosques de cet admin
  const fetchKiosks = async (adminId) => {
    const { data, error } = await supabase
      .from("kiosks")
      .select("id, name")
      .eq("owner_id", adminId); // <-- Filtre admin
    if (error) Alert.alert("Erreur", error.message);
    else setKiosks(data || []);
  };

  // 🔹 Coursiers liés aux kiosques de l’admin
  const fetchCouriers = async (adminId) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role")
      .eq("role", "kiosque")
      .eq("owner_id", adminId); // <-- adapte selon ta table
    if (error) Alert.alert("Erreur", error.message);
    else setCouriers(data || []);
  };

  // 🔹 Vendeurs liés aux kiosques de l’admin
  const fetchSellers = async (adminId) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role")
      .eq("role", "grossiste")
      .eq("owner_id", adminId); // <-- adapte selon ta table
    if (error) Alert.alert("Erreur", error.message);
    else setSellers(data || []);
  };

  // 🔹 Soumission du formulaire
  const handleSubmit = async () => {
    if (!name || !minBalance || !kioskId) {
      return Alert.alert("Erreur", "Tous les champs sont requis.");
    }

    const numericBalance = parseFloat(0);
    const numericMinBalance = parseFloat(minBalance);

    const { error } = await supabase.from("cashes").insert([
      {
        name,
        balance: numericBalance,
        min_balance: numericMinBalance,
        kiosk_id: kioskId,
        cashier_id: courierId,
        seller_id: sellerId,
        closed: false
      },
    ]);

    if (error) Alert.alert("Erreur", error.message);
    else {
      Alert.alert("✅ Succès", "BOUTIQUE ajoutée avec succès !");
      navigation.goBack();
    }
  };

  // 🔹 Filtrage automatique
  const filteredKiosks = kiosks.filter(k =>
    k.name.toLowerCase().includes(kioskQuery.toLowerCase())
  );
  const filteredCouriers = couriers.filter(u =>
    (u.full_name || u.email || "").toLowerCase().includes(courierQuery.toLowerCase())
  );
  const filteredSellers = sellers.filter(u =>
    (u.full_name || u.email || "").toLowerCase().includes(sellerQuery.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={[styles.card, { width: screenWidth - 20 }]}>
        <Card.Title title="Nouvelle BOUTIQUE" />
        <Card.Content>
          <TextInput
            label="Nom de la BOUTIQUE"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
       
          <TextInput
            label="Seuil minimum (FCFA)"
            value={minBalance}
            onChangeText={setMinBalance}
            keyboardType="numeric"
            style={styles.input}
          />

          {/* Sélection kiosque */}
          <Text style={styles.label}>Sélectionner un client :</Text>
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
                <TouchableOpacity
                  onPress={() => { setKioskId(item.id); setKioskQuery(item.name); }}
                  style={styles.autocompleteItem}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Sélection coursier */}
          <Text style={styles.label}>Sélectionner un coursier :</Text>
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
                <TouchableOpacity
                  onPress={() => { setCourierId(item.id); setCourierQuery(item.full_name || item.email); }}
                  style={styles.autocompleteItem}
                >
                  <Text>{item.full_name || item.email}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Sélection vendeur */}
          <Text style={styles.label}>Sélectionner un vendeur :</Text>
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
                <TouchableOpacity
                  onPress={() => { setSellerId(item.id); setSellerQuery(item.full_name || item.email); }}
                  style={styles.autocompleteItem}
                >
                  <Text>{item.full_name || item.email}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <Button mode="contained" onPress={handleSubmit} style={styles.submitButton}>
            Enregistrer
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
  submitButton: { marginTop: 20 },
});
