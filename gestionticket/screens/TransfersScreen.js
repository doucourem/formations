import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, Modal, TextInput, Alert, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fetchTransfers, createTransfer } from "../services/apiTransfers";
import TransferModal from "../screens/TransferModal";

export default function TransfersScreen() {
  const [transfers, setTransfers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ sender_id: "", receiver_id: "", amount: "" });
  
  // Nouveau state pour la date
  const [filterDate, setFilterDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadTransfers();
  }, [filterDate]);

  const loadTransfers = async () => {
    try {
      const data = await fetchTransfers({ status: "sent", date: filterDate.toISOString().slice(0,10) });
      setTransfers(data.data);
    } catch (e) {
      console.error("Erreur:", e);
      Alert.alert("Erreur", "Impossible de charger les transferts.");
    }
  };

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    if (!form.sender_id || !form.receiver_id || !form.amount) {
      return Alert.alert("Erreur", "Tous les champs sont obligatoires.");
    }
    try {
      await createTransfer({
        sender_id: form.sender_id,
        receiver_id: form.receiver_id,
        amount: Number(form.amount),
      });
      Alert.alert("Succès", "Transfert ajouté !");
      setModalVisible(false);
      setForm({ sender_id: "", receiver_id: "", amount: "" });
      loadTransfers();
    } catch (e) {
      console.error("Erreur création transfert :", e);
      Alert.alert("Erreur", "Impossible de créer le transfert.");
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "paid": return "Payé";
      case "pending": return "En attente";
      case "cancelled": return "Annulé";
      case "sent": return "Envoyé";
      default: return "Inconnu";
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transferts d'argent</Text>

      {/* Sélecteur de date */}
      <View style={{ marginBottom: 16 }}>
        <Button title={`Filtrer par date : ${filterDate.toLocaleDateString()}`} onPress={() => setShowDatePicker(true)} />
        {showDatePicker && (
          <DateTimePicker
            value={filterDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setFilterDate(selectedDate);
            }}
          />
        )}
      </View>

      <Button title="➕ Ajouter un transfert" onPress={() => setModalVisible(true)} color="#4CAF50" />

      <FlatList
        data={transfers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.line}>📤 Expéditeur : {item.sender.name}</Text>
            <Text style={styles.line}>📥 Destinataire : {item.receiver.name}</Text>
            <Text style={styles.line}>💰 Montant : {item.amount.toLocaleString()} FCFA</Text>
            <Text style={styles.line}>📄 Statut : {formatStatus(item.status)}</Text>
            <Text style={styles.line}>🗓 Date : {item.created_at}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal pour créer un transfert */}
        <TransferModal visible={modalVisible} onClose={() => setModalVisible(false)} onCreated={loadTransfers} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F0F2F5" },
  title: { fontWeight: "bold", fontSize: 22, marginBottom: 16, textAlign: "center", color: "#333" },
  card: { padding: 12, backgroundColor: "#fff", borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#ddd", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  line: { marginBottom: 4, fontSize: 16, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, marginBottom: 10, fontSize: 16, backgroundColor: "#fff" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  button: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});
