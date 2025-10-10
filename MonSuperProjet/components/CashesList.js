import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Dimensions } from "react-native";
import { Text, Button, Dialog, Portal, TextInput, Card } from "react-native-paper";
import RNPickerSelect from "react-native-picker-select";
import { supabase } from "../supabaseClient";

export default function CashesList({ user }) {
  const [cashes, setCashes] = useState([]);
  const [kiosks, setKiosks] = useState([]);
  const [users, setUsers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    kioskId: "",
    balance: 0,
    closed: false,
    cashierId: "",
  });

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (user) {
      fetchCashes();
      fetchKiosks();
      fetchUsers();
    }
  }, [user]);

  // 🔹 Charger les caisses
  const fetchCashes = async () => {
    const { data, error } = await supabase
      .from("cashes")
      .select("*, kiosks(name), users(full_name, email)")
      .order("created_at", { ascending: false });

    if (!error && data) setCashes(data);
  };

  // 🔹 Charger les kiosks
  const fetchKiosks = async () => {
    const { data, error } = await supabase
      .from("kiosks")
      .select("id, name")
      .order("name", { ascending: true });
    if (!error && data) setKiosks(data);
  };

  // 🔹 Charger les utilisateurs (caissiers)
  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("id, full_name, email");
    if (!error && data) setUsers(data);
  };

  // 🔹 Ouvrir le dialogue pour ajouter une caisse
  const openAddDialog = () => {
    setFormData({
      id: null,
      name: "",
      kioskId: "",
      balance: 0,
      closed: false,
      cashierId: "",
    });
    setVisible(true);
  };

  // 🔹 Enregistrer la caisse
  const saveCash = async () => {
    if (!formData.name || !formData.kioskId || !formData.cashierId) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const payload = {
      name: formData.name,
      kiosk_id: formData.kioskId,
      balance: Number(formData.balance) || 0,
      closed: false,
      cashier_id: formData.cashierId,
    };

    const { error } = await supabase.from("cashes").insert(payload);
    if (error) {
      alert("Erreur : " + error.message);
    } else {
      setVisible(false);
      fetchCashes();
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Bouton désactivé */}
      <Button
        mode="contained"
        disabled
        style={[styles.addButton, { opacity: 0.6 }]}
      >
        + Nouvelle Caisse (désactivé)
      </Button>

      <FlatList
        data={cashes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const kiosk = kiosks.find((k) => k.id === item.kiosk_id);
          const cashier = users.find((u) => u.id === item.cashier_id);

          return (
            <Card style={[styles.card, { width: screenWidth - 20 }]}>
              <Card.Title title={item.name} subtitle={`Kiosque : ${kiosk?.name || "—"}`} />
              <Card.Content>
                <Text style={styles.text}>💰 Solde : {item.balance} FCFA</Text>
                <Text style={styles.text}>
                  👤 Caissier : {cashier?.full_name || cashier?.email || "—"}
                </Text>
                <Text style={styles.text}>
                  📦 État : {item.closed ? "Clôturée" : "Ouverte"}
                </Text>
              </Card.Content>
            </Card>
          );
        }}
      />

      {/* 🔹 Dialogue d’ajout (resté prêt à l’emploi mais non accessible car bouton désactivé) */}
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Nouvelle Caisse</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Nom de la caisse"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              style={styles.input}
            />

            <RNPickerSelect
              onValueChange={(val) => setFormData({ ...formData, kioskId: val })}
              value={formData.kioskId || ""}
              placeholder={{ label: "Sélectionner un kiosque", value: "" }}
              items={kiosks.map((k) => ({ label: k.name, value: k.id }))}
            />

            <RNPickerSelect
              onValueChange={(val) => setFormData({ ...formData, cashierId: val })}
              value={formData.cashierId || ""}
              placeholder={{ label: "Sélectionner un caissier", value: "" }}
              items={users.map((u) => ({
                label: u.full_name || u.email,
                value: u.id,
              }))}
            />

            <TextInput
              label="Solde initial"
              value={String(formData.balance)}
              keyboardType="numeric"
              onChangeText={(t) => setFormData({ ...formData, balance: t })}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Annuler</Button>
            <Button onPress={saveCash}>Enregistrer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  card: {
    marginVertical: 6,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#fff",
  },
  text: { fontSize: 16, marginVertical: 3 },
  input: { marginBottom: 10, backgroundColor: "#fff" },
  addButton: { marginVertical: 10 },
});
