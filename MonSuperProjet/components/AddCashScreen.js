import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  useWindowDimensions,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Card, TextInput, Text, Button } from "react-native-paper";
import supabase from "../supabaseClient";

export default function AddCashScreen({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
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

  useEffect(() => {
    const loadData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return Alert.alert("Erreur", error.message);
      setUser(user);

      fetchKiosks(user.id);
      fetchCouriers(user.id);
      fetchSellers(user.id);
    };
    loadData();
  }, []);

  const fetchKiosks = async (adminId) => {
    const { data, error } = await supabase
      .from("kiosks")
      .select("id, name")
      .eq("owner_id", adminId);
    if (!error) setKiosks(data || []);
  };

  const fetchCouriers = async (adminId) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "kiosque")
      .eq("owner_id", adminId);
    if (!error) setCouriers(data || []);
  };

  const fetchSellers = async (adminId) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email")
      .eq("role", "grossiste")
      .eq("owner_id", adminId);
    if (!error) setSellers(data || []);
  };

  const handleSubmit = async () => {
    if (!name || !minBalance || !kioskId) {
      return Alert.alert("Erreur", "Tous les champs requis.");
    }

    const { error } = await supabase.from("cashes").insert([
      {
        name,
        balance: 0,
        min_balance: parseFloat(minBalance),
        kiosk_id: kioskId,
        cashier_id: courierId,
        seller_id: sellerId,
        closed: false,
      },
    ]);

    if (error) Alert.alert("Erreur", error.message);
    else {
      Alert.alert("Succès", "BOUTIQUE ajoutée");
      navigation.goBack();
    }
  };

  const filterByQuery = (list, query, key) =>
    list.filter(item =>
      (item[key] || "").toLowerCase().includes(query.toLowerCase())
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={[styles.card, { width: screenWidth - 20 }]}>
        <Card.Title title="Nouvelle BOUTIQUE" />
        <Card.Content>

          {/* Nom */}
          <TextInput
            label="Nom de la BOUTIQUE"
            value={name}
            onChangeText={setName}
            style={styles.input}
            textColor="#000"
          />

          {/* Seuil */}
          <TextInput
            label="Seuil minimum (FCFA)"
            value={minBalance}
            onChangeText={setMinBalance}
            keyboardType="numeric"
            style={styles.input}
            textColor="#000"
          />

          {/* CLIENT */}
          <Text style={styles.label}>Sélectionner un client</Text>
          <TextInput
            placeholder="Rechercher un client..."
            value={kioskQuery}
            onChangeText={t => { setKioskQuery(t); setKioskId(null); }}
            style={styles.input}
            textColor="#000"
            placeholderTextColor="#666"
          />
          {kioskQuery.length > 0 && (
            <FlatList
              data={filterByQuery(kiosks, kioskQuery, "name")}
              keyExtractor={i => i.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.autocompleteItem}
                  onPress={() => {
                    setKioskId(item.id);
                    setKioskQuery(item.name);
                  }}
                >
                  <Text style={styles.autocompleteText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* COURSIER */}
          <Text style={styles.label}>Sélectionner un coursier</Text>
          <TextInput
            placeholder="Rechercher un coursier..."
            value={courierQuery}
            onChangeText={t => { setCourierQuery(t); setCourierId(null); }}
            style={styles.input}
            textColor="#000"
            placeholderTextColor="#666"
          />
          {courierQuery.length > 0 && (
            <FlatList
              data={filterByQuery(couriers, courierQuery, "full_name")}
              keyExtractor={i => i.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.autocompleteItem}
                  onPress={() => {
                    setCourierId(item.id);
                    setCourierQuery(item.full_name || item.email);
                  }}
                >
                  <Text style={styles.autocompleteText}>
                    {item.full_name || item.email}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* VENDEUR */}
          <Text style={styles.label}>Sélectionner un vendeur</Text>
          <TextInput
            placeholder="Rechercher un vendeur..."
            value={sellerQuery}
            onChangeText={t => { setSellerQuery(t); setSellerId(null); }}
            style={styles.input}
            textColor="#000"
            placeholderTextColor="#666"
          />
          {sellerQuery.length > 0 && (
            <FlatList
              data={filterByQuery(sellers, sellerQuery, "full_name")}
              keyExtractor={i => i.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.autocompleteItem}
                  onPress={() => {
                    setSellerId(item.id);
                    setSellerQuery(item.full_name || item.email);
                  }}
                >
                  <Text style={styles.autocompleteText}>
                    {item.full_name || item.email}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
          >
            Enregistrer
          </Button>

        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  card: {
    borderRadius: 12,
    paddingBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
    color: "#000",
  },
  autocompleteItem: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  autocompleteText: {
    color: "#000",
  },
  submitButton: {
    marginTop: 20,
  },
});
