import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, SegmentedButtons, Text, useTheme } from "react-native-paper";
import { updateTicket } from "../services/ticketApi"; // Créez cette fonction dans votre service

export default function EditTicketScreen({ route, navigation }) {
  const { ticket } = route.params;
  const theme = useTheme();

  const [clientName, setClientName] = useState(ticket.client_name);
  const [seatNumber, setSeatNumber] = useState(ticket.seat_number?.toString() || "");
  const [status, setStatus] = useState(ticket.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!clientName) return Alert.alert("Erreur", "Le nom du client est requis");

    setLoading(true);
    try {
      await updateTicket(ticket.id, {
        client_name: clientName,
        seat_number: seatNumber,
        status: status,
      });
      Alert.alert("Succès", "Ticket mis à jour avec succès", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de mettre à jour le ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Modifier le Ticket #{ticket.id}</Text>
      
      <TextInput
        label="Nom du Client"
        value={clientName}
        onChangeText={setClientName}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Numéro de Siège"
        value={seatNumber}
        onChangeText={setSeatNumber}
        mode="outlined"
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Statut du paiement</Text>
      <SegmentedButtons
        value={status}
        onValueChange={setStatus}
        buttons={[
          { value: 'reserved', label: 'Réservé' },
          { value: 'paid', label: 'Payé' },
          { value: 'cancelled', label: 'Annulé' },
        ]}
        style={styles.segmented}
      />

      <Button 
        mode="contained" 
        onPress={handleSave} 
        loading={loading} 
        disabled={loading}
        style={styles.saveBtn}
      >
        Enregistrer les modifications
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { marginBottom: 20, fontWeight: 'bold' },
  input: { marginBottom: 15 },
  label: { marginTop: 10, marginBottom: 8, fontWeight: '500' },
  segmented: { marginBottom: 25 },
  saveBtn: { paddingVertical: 8, borderRadius: 8 }
});