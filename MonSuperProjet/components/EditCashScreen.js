import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Alert,
  useWindowDimensions,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput, Button, Card, Text } from "react-native-paper";
import supabase from "../supabaseClient";

export default function EditCashScreen({ route, navigation }) {
  const { cash } = route.params;
  const { width: screenWidth } = useWindowDimensions();

  const [name, setName] = useState(cash.name);
  const [balance, setBalance] = useState(cash.balance.toString());
  const [kioskId, setKioskId] = useState(cash.kiosk_id);
  const [cashierId, setCashierId] = useState(cash.cashier_id);
  const [kiosks, setKiosks] = useState([]);
  const [users, setUsers] = useState([]);

  const [kioskQuery, setKioskQuery] = useState("");
  const [cashierQuery, setCashierQuery] = useState("");

  useEffect(() => {
    fetchKiosks();
    fetchCashiers();
  }, []);

  const fetchKiosks = async () => {
    const { data, error } = await supabase.from("kiosks").select("id, name");
    if (error) Alert.alert("Erreur", error.message);
    else setKiosks(data || []);
    const currentKiosk = data?.find(k => k.id === kioskId);
    if (currentKiosk) setKioskQuery(currentKiosk.name);
  };

  const fetchCashiers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role").eq("role", "kiosque");
    if (error) Alert.alert("Erreur", error.message);
    else setUsers(data || []);
    const currentCashier = data?.find(u => u.id === cashierId);
    if (currentCashier) setCashierQuery(currentCashier.full_name || currentCashier.email);
  };

  const handleUpdate = async () => {
    if (!name || !balance || !kioskId || !cashierId)
      return Alert.alert("Erreur", "Tous les champs sont requis.");

    const { error } = await supabase
      .from("cashes")
      .update({ name, balance: parseFloat(balance), kiosk_id: kioskId, cashier_id: cashierId })
      .eq("id", cash.id);

    if (error) Alert.alert("Erreur", error.message);
    else {
      Alert.alert("✅ Succès", "Caisse mise à jour !");
      navigation.goBack();
    }
  };

  const filteredKiosks = kiosks.filter(k => k.name.toLowerCase().includes(kioskQuery.toLowerCase()));
  const filteredCashiers = users.filter(u => (u.full_name || u.email).toLowerCase().includes(cashierQuery.toLowerCase()));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={[styles.card, { width: screenWidth - 20 }]}>
        <Card.Title title="Modifier la Caisse" />
        <Card.Content>
          <TextInput label="Nom" value={name} onChangeText={setName} style={styles.input} />
          <TextInput label="Solde" keyboardType="numeric" value={balance} onChangeText={setBalance} style={styles.input} />

          <Text style={styles.label}>Client</Text>
          <TextInput
            placeholder="Rechercher un client..."
            value={kioskQuery}
            onChangeText={text => { setKioskQuery(text); setKioskId(null); }}
            style={styles.input}
          />
          {filteredKiosks.length > 0 && (
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

          <Text style={styles.label}>Coursier</Text>
          <TextInput
            placeholder="Rechercher un coursier..."
            value={cashierQuery}
            onChangeText={text => { setCashierQuery(text); setCashierId(null); }}
            style={styles.input}
          />
          {filteredCashiers.length > 0 && (
            <FlatList
              data={filteredCashiers}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setCashierId(item.id); setCashierQuery(item.full_name || item.email); }}
                  style={styles.autocompleteItem}
                >
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
  submitButton: { marginTop: 20 },
});
