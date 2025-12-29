import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { Button, TextInput, Text, ActivityIndicator } from "react-native-paper";
import api, { createTicket } from "../services/ticketApi";

export default function CreateTicketScreen({ navigation, route }) {
  const { tripId } = route.params;
  const [clientName, setClientName] = useState("");
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);

  const loadSeats = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/seats`);
      setSeats(res.data);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de charger les sièges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeats();
    const interval = setInterval(loadSeats, 5000);
    return () => clearInterval(interval);
  }, []);

  const reserveSeat = async (seat) => {
    if (!clientName) {
      Alert.alert("Erreur", "Veuillez entrer le nom du client avant de choisir un siège.");
      return;
    }
    try {
      await api.post("/seats/reserve", {
        trip_id: tripId,
        seat_number: seat.seat_number,
        client_name: clientName,
      });
      setSelectedSeat(seat.seat_number);
      loadSeats();
    } catch {
      Alert.alert("Indisponible", "Ce siège vient d’être pris");
      loadSeats();
    }
  };

  const saveTicket = async () => {
    if (!clientName || !selectedSeat) {
      Alert.alert("Erreur", "Nom du client et siège obligatoires");
      return;
    }
    setSaving(true);
    try {
      await createTicket({
        trip_id: tripId,
        client_name: clientName,
        seat_number: selectedSeat,
        status: "reserved",
      });
      Alert.alert("Succès", "Réservation enregistrée");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erreur", "Échec de la réservation");
    } finally {
      setSaving(false);
    }
  };

  const payTicket = async () => {
    if (!selectedSeat) {
      Alert.alert("Erreur", "Veuillez sélectionner un siège avant de payer");
      return;
    }
    setPaying(true);
    try {
      // Ici, tu peux appeler ton API de paiement
      await createTicket({
        trip_id: tripId,
        client_name: clientName,
        seat_number: selectedSeat,
        status: "paid",
      });
      Alert.alert("Succès", "Paiement effectué");
      loadSeats();
    } catch (e) {
      Alert.alert("Erreur", "Échec du paiement");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <TextInput
        label="Nom du client"
        value={clientName}
        onChangeText={setClientName}
        style={styles.input}
      />

      <Text style={styles.title}>Choisir un siège</Text>

      <FlatList
        data={seats}
        numColumns={4}
        keyExtractor={(item) => item.seat_number.toString()}
        renderItem={({ item }) => {
          let bgColor;
          switch (item.status) {
            case "sold":
              bgColor = "#F44336";
              break;
            case "reserved":
              bgColor = "#FF9800";
              break;
            default:
              bgColor = "#4CAF50";
          }
          if (selectedSeat === item.seat_number) bgColor = "#1976D2";

          return (
            <Button
              mode={selectedSeat === item.seat_number ? "contained" : "outlined"}
              onPress={() => reserveSeat(item)}
              disabled={item.status === "sold"}
              style={[styles.seat, { backgroundColor: bgColor }]}
              textColor="#fff"
            >
              {item.seat_number}
            </Button>
          );
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={saveTicket}
          loading={saving}
          disabled={!selectedSeat || saving || paying}
          style={{ flex: 1, marginRight: 5 }}
        >
          Confirmer la réservation
        </Button>
        <Button
          mode="contained"
          onPress={payTicket}
          loading={paying}
          disabled={!selectedSeat || saving || paying}
          style={{ flex: 1, marginLeft: 5, backgroundColor: "#FF9800" }}
        >
          Payer
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 20 },
  title: { marginBottom: 10, fontWeight: "bold", fontSize: 16 },
  seat: { margin: 4, minWidth: 60, minHeight: 50, justifyContent: "center" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
});
