import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { fetchSenders, fetchReceivers, createTransfer } from "../services/apiTransfers";

export default function TransferModal({ visible, onClose, onCreated }) {
  const [senders, setSenders] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [form, setForm] = useState({ sender_id: "", receiver_id: "", amount: "" });
  const [loading, setLoading] = useState(false);

  // Charger les expéditeurs et destinataires
  useEffect(() => {
    if (visible) {
      loadSenders();
      loadReceivers();
    }
  }, [visible]);

  const loadSenders = async () => {
    try {
      const res = await fetchSenders();
      setSenders(res.data || []);
    } catch (e) {
      console.error("Erreur fetch senders:", e);
      Alert.alert("Erreur", "Impossible de charger les expéditeurs.");
    }
  };

  const loadReceivers = async () => {
    try {
      const res = await fetchReceivers();
      setReceivers(res.data || []);
    } catch (e) {
      console.error("Erreur fetch receivers:", e);
      Alert.alert("Erreur", "Impossible de charger les destinataires.");
    }
  };

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    if (!form.sender_id || !form.receiver_id || !form.amount) {
      return Alert.alert("Erreur", "Tous les champs sont obligatoires.");
    }
    setLoading(true);
    try {
      await createTransfer({
        sender_id: form.sender_id,
        receiver_id: form.receiver_id,
        amount: Number(form.amount),
      });
      Alert.alert("Succès", "Transfert créé !");
      setForm({ sender_id: "", receiver_id: "", amount: "" });
      onCreated?.(); // Recharge la liste
      onClose();
    } catch (e) {
      console.error("Erreur création transfert:", e);
      Alert.alert("Erreur", "Impossible de créer le transfert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nouveau Transfert</Text>

          {/* Expéditeur */}
          <Text style={styles.label}>Expéditeur</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.sender_id}
              onValueChange={(value) => handleChange("sender_id", value)}
            >
              <Picker.Item label="Sélectionner un expéditeur" value="" />
              {senders.map((s) => (
                <Picker.Item key={s.id} label={s.name} value={s.id} />
              ))}
            </Picker>
          </View>

          {/* Destinataire */}
          <Text style={styles.label}>Destinataire</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.receiver_id}
              onValueChange={(value) => handleChange("receiver_id", value)}
            >
              <Picker.Item label="Sélectionner un destinataire" value="" />
              {receivers.map((r) => (
                <Picker.Item key={r.id} label={r.name} value={r.id} />
              ))}
            </Picker>
          </View>

          {/* Montant */}
          <Text style={styles.label}>Montant (FCFA)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={form.amount}
            onChangeText={(v) => handleChange("amount", v)}
          />

          {/* Boutons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#4CAF50" }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enregistrer</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#f44336" }]}
              onPress={() => { setForm({ sender_id: "", receiver_id: "", amount: "" }); onClose(); }}
            >
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
