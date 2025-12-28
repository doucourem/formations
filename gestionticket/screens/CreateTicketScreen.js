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

  const loadSeats = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/seats`);
      console.log(res.data); // vérifier la réponse
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

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

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
        renderItem={({ item }) => (
          <Button
            mode={selectedSeat === item.seat_number ? "contained" : "outlined"}
            disabled={item.status === "sold"}
            onPress={() => reserveSeat(item)}
            style={[
              styles.seat,
              {
                backgroundColor:
                  selectedSeat === item.seat_number
                    ? "#4CAF50"
                    : item.status === "sold"
                    ? "#F44336"
                    : item.status === "reserved"
                    ? "#FF9800"
                    : undefined,
              },
            ]}
            textColor="#fff"
          >
            {item.seat_number}
          </Button>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator
      />

      <Button
        mode="contained"
        onPress={saveTicket}
        loading={saving}
        disabled={!selectedSeat || saving}
        style={{ marginTop: 20 }}
      >
        Confirmer la réservation
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 20 },
  title: { marginBottom: 10, fontWeight: "bold" },
  seat: { margin: 4, minWidth: 60 },
});
