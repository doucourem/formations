import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Alert, useWindowDimensions, FlatList, TouchableOpacity } from "react-native";
import { Card, TextInput, Text, Button } from "react-native-paper";
import supabase from "../supabaseClient";

export default function AddCashScreen({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [kioskId, setKioskId] = useState(null);
  const [cashierId, setCashierId] = useState(null);
  const [kiosks, setKiosks] = useState([]);
  const [users, setUsers] = useState([]);

  // Autocomplete states
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
  };

  const fetchCashiers = async () => {
    const { data, error } = await supabase.from("users").select("id, full_name, email, role")
    ;
    if (error) Alert.alert("Erreur", error.message);
    else setUsers(data || []);
  };

  const handleSubmit = async () => {
    if (!name || !balance || !kioskId || !cashierId) {
      return Alert.alert("Erreur", "Tous les champs sont requis.");
    }
    const { error } = await supabase.from("cashes").insert([
      { name, balance: parseFloat(balance), kiosk_id: kioskId, cashier_id: cashierId, closed: false },
    ]);
    if (error) Alert.alert("Erreur", error.message);
    else {
      Alert.alert("✅ Succès", "Caisse ajoutée avec succès !");
      navigation.goBack();
    }
  };

  // Filtered lists for autocomplete
  const filteredKiosks = kiosks.filter(k => k.name.toLowerCase().includes(kioskQuery.toLowerCase()));
  const filteredCashiers = users.filter(u => (u.full_name || u.email).toLowerCase().includes(cashierQuery.toLowerCase()));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={[styles.card, { width: screenWidth - 20 }]}>
        <Card.Title title="Nouvelle Caisse" />
        <Card.Content>
          <TextInput
            label="Nom de la caisse"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            label="Seuil"
            value={balance}
            onChangeText={setBalance}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>Sélectionner un client :</Text>
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

          <Text style={styles.label}>Sélectionner un coursier :</Text>
          <TextInput
            placeholder="Rechercher un coursier ..."
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
