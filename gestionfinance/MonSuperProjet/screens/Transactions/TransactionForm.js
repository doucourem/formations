import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { Menu, Button as PaperButton, Text, TextInput } from "react-native-paper";
import api from "../../api/api";

export default function TransactionForm({ refresh, transaction, onClose }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // champs de transaction
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amountFcfa, setAmountFcfa] = useState("");
  const [type, setType] = useState("");
  const [amountSent, setAmountSent] = useState("");
  const [amountToPay, setAmountToPay] = useState("");
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [destination, setDestination] = useState("");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await api.get("/clients");
        setClients(data);
      } catch (err) {
        console.log("Erreur chargement clients", err);
      }
    };
    fetchClients();
  }, []);

  // Préremplir si modification
  useEffect(() => {
    if (transaction) {
      setSelectedClient(
        clients.find((c) => c.id === transaction.client_id) || null
      );
      setPhoneNumber(transaction.phone_number || "");
      setAmountFcfa(transaction.amount_fcfa?.toString() || "");
      setType(transaction.type || "");
      setAmountSent(transaction.amount_sent?.toString() || "");
      setAmountToPay(transaction.amount_to_pay?.toString() || "");
      setSenderName(transaction.sender_name || "");
      setReceiverName(transaction.receiver_name || "");
      setDestination(transaction.destination || "");
      setCode(transaction.code || "");
      setNotes(transaction.notes || "");
    }
  }, [transaction, clients]);

  // Enregistrer ou mettre à jour
  const handleSubmit = async () => {
    if (!selectedClient || !amountFcfa || !type) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const payload = {
      client_id: selectedClient.id,
      phone_number: phoneNumber,
      amount_fcfa: parseFloat(amountFcfa),
      type,
      amount_sent: parseFloat(amountSent) || 0,
      amount_to_pay: parseFloat(amountToPay) || 0,
      sender_name: senderName || null,
      receiver_name: receiverName || null,
      destination: destination || null,
      code: code || null,
      notes: notes || null,
    };

    try {
      setIsSubmitting(true);
      if (transaction) {
        await api.put(`/transactions/${transaction.id}`, payload);
      } else {
        await api.post("/transactions", payload);
      }

      Alert.alert("Succès", "Transaction enregistrée !");
      refresh?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Échec de l'enregistrement de la transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>👤 Client</Text>
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={
          <PaperButton
            mode="outlined"
            onPress={() => setMenuVisible(true)}
            textColor="#e2e8f0"
            style={styles.menuButton}
          >
            {selectedClient ? selectedClient.name : "Sélectionner un client"}
          </PaperButton>
        }
      >
        {clients.map((client) => (
          <Menu.Item
            key={client.id}
            title={client.name}
            onPress={() => {
              setSelectedClient(client);
              setMenuVisible(false);
            }}
          />
        ))}
      </Menu>

      <TextInput
        placeholder="Numéro de téléphone"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        mode="outlined"
        style={styles.input}
        keyboardType="phone-pad"
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        placeholder="Montant (FCFA)"
        value={amountFcfa}
        onChangeText={setAmountFcfa}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        placeholder="Type (CREDIT / DEBIT)"
        value={type}
        onChangeText={setType}
        mode="outlined"
        style={styles.input}
        placeholderTextColor="#94a3b8"
      />

      <TextInput
        placeholder="Montant envoyé"
        keyboardType="numeric"
        value={amountSent}
        onChangeText={setAmountSent}
        style={styles.input}
      />
      <TextInput
        placeholder="Montant à payer"
        keyboardType="numeric"
        value={amountToPay}
        onChangeText={setAmountToPay}
        style={styles.input}
      />
      <TextInput
        placeholder="Nom expéditeur"
        value={senderName}
        onChangeText={setSenderName}
        style={styles.input}
      />
      <TextInput
        placeholder="Nom destinataire"
        value={receiverName}
        onChangeText={setReceiverName}
        style={styles.input}
      />
      <TextInput
        placeholder="Destination"
        value={destination}
        onChangeText={setDestination}
        style={styles.input}
      />
      <TextInput
        placeholder="Code / référence"
        value={code}
        onChangeText={setCode}
        style={styles.input}
      />
      <TextInput
        placeholder="Notes"
        value={notes}
        onChangeText={setNotes}
        style={[styles.input, { height: 60 }]}
        multiline
      />

      <View style={styles.buttonRow}>
        <PaperButton
          mode="contained"
          onPress={handleSubmit}
          buttonColor="#10b981"
          textColor="white"
          style={styles.button}
          disabled={isSubmitting}
        >
          {transaction ? "Modifier" : "Ajouter"}
        </PaperButton>
        {onClose && (
          <PaperButton
            mode="outlined"
            onPress={onClose}
            textColor="#f87171"
            style={styles.cancelButton}
            disabled={isSubmitting}
          >
            Annuler
          </PaperButton>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
    color: "#f1f5f9",
  },
  menuButton: {
    borderColor: "#334155",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    borderColor: "#f87171",
  },
});
