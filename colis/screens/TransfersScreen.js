import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { fetchTransfers } from "../services/apiTransfers";
import TransferModal from "../screens/TransferModal";

export default function TransfersScreen() {
  const [transfers, setTransfers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  useEffect(() => {
    loadTransfers();
  }, [filterDate]);

  const loadTransfers = async () => {
    try {
      const data = await fetchTransfers({ status: "sent", date: filterDate.toISOString().slice(0,10) });
      setTransfers(data.data || []);
    } catch (e) {
      console.error("Erreur:", e);
      Alert.alert("Erreur", "Impossible de charger les transferts.");
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

      {/* Filtre par date */}
      <View style={styles.filterContainer}>
        <Button
          title={`Filtrer par date : ${filterDate.toLocaleDateString()}`}
          onPress={() => setShowDatePicker(true)}
        />
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

      {/* Bouton Ajouter un transfert */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedTransfer(null); // création
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>➕ Ajouter un transfert</Text>
      </TouchableOpacity>

      {/* Liste des transferts */}
      <FlatList
  data={transfers}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={styles.card}>
      <Text style={styles.line}>📤 Expéditeur : {item.sender.name}</Text>
      <Text style={styles.line}>📥 Destinataire : {item.receiver.name}</Text>
      <Text style={styles.line}>💰 Montant : {item.amount.toLocaleString()} FCFA</Text>
      <Text style={styles.line}>📄 Statut : {formatStatus(item.status)}</Text>
      <Text style={styles.line}>
        🗓 Date : {new Date(item.created_at).toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })}
      </Text>

      {/* Bouton Modifier */}
      <TouchableOpacity
        onPress={() => {
          setSelectedTransfer(item);
          setModalVisible(true);
        }}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>✏️ Modifier</Text>
      </TouchableOpacity>
    </View>
  )}
  contentContainerStyle={{ paddingBottom: 20 }}
/>


      {/* Modal */}
      <TransferModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedTransfer(null);
        }}
        onCreated={loadTransfers}
        transferToEdit={selectedTransfer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F0F2F5" },
  title: { fontWeight: "bold", fontSize: 22, marginBottom: 16, textAlign: "center", color: "#333" },
  filterContainer: { marginBottom: 16 },
  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  addButtonText: { color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 16 },
  card: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  line: { marginBottom: 4, fontSize: 16, color: "#333" },
  editButton: {
    marginTop: 10,
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
  },
  editButtonText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
});
