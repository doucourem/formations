import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { fetchSenders, fetchReceivers, createTransfer, updateTransfer } from "../services/apiTransfers";

export default function TransferModal({ visible, onClose, onCreated, transferToEdit }) {
  const [senders, setSenders] = useState([]);
  const [receivers, setReceivers] = useState([]);
  const [form, setForm] = useState({ sender_id: "", receiver_id: "", amount: "" });
  const [loading, setLoading] = useState(false);

  // Charger expéditeurs et destinataires et pré-remplir si édition
 useEffect(() => {
  if (visible) {
    loadSenders();
    loadReceivers();
    
    if (transferToEdit) {
      // Extraire l'id depuis sender et receiver si sender_id/receiver_id manquent
      const senderId = transferToEdit.sender_id ?? transferToEdit.sender?.id;
      const receiverId = transferToEdit.receiver_id ?? transferToEdit.receiver?.id;

      setForm({
        sender_id: senderId ? senderId.toString() : "",
        receiver_id: receiverId ? receiverId.toString() : "",
        amount: transferToEdit.amount?.toString() || "",
      });
    } else {
      setForm({ sender_id: "", receiver_id: "", amount: "" });
    }
  }
}, [visible, transferToEdit]);


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
      if (transferToEdit) {
        // Modifier le transfert existant
        await updateTransfer(transferToEdit.id, {
          sender_id: Number(form.sender_id),
          receiver_id: Number(form.receiver_id),
          amount: Number(form.amount),
        });
        Alert.alert("Succès", "Transfert modifié !");
      } else {
        // Créer un nouveau transfert
        await createTransfer({
          sender_id: Number(form.sender_id),
          receiver_id: Number(form.receiver_id),
          amount: Number(form.amount),
        });
        Alert.alert("Succès", "Transfert créé !");
      }

      setForm({ sender_id: "", receiver_id: "", amount: "" });
      onCreated?.();
      onClose();
    } catch (e) {
      console.error("Erreur sauvegarde transfert:", e);
      Alert.alert("Erreur", "Impossible de sauvegarder le transfert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {transferToEdit ? "Modifier Transfert" : "Nouveau Transfert"}
          </Text>

          {/* Expéditeur */}
          <Text style={styles.label}>Expéditeur</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.sender_id}
              onValueChange={(value) => handleChange("sender_id", value)}
            >
              <Picker.Item label="Sélectionner un expéditeur" value="" />
              {senders.map((s) => (
                <Picker.Item key={s.id} label={s.name} value={s.id.toString()} />
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
                <Picker.Item key={r.id} label={r.name} value={r.id.toString()} />
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
              onPress={() => {
                setForm({ sender_id: "", receiver_id: "", amount: "" });
                onClose();
              }}
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
