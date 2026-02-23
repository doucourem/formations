// src/screens/tickets/TicketSellScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import api from "../../api/axios";
import SeatMap from "../../components/SeatMap";

export default function TicketSellScreen({ route, navigation }) {
  const { trip } = route.params;
  const [seat, setSeat] = useState("");
  const [clientName, setClientName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const sellTicket = async () => {
    if (!seat || !clientName) return Alert.alert("Champs manquants");

    try {
      const res = await api.post("/tickets", {
        trip_id: trip.id,
        seat_number: seat,
        client_name: clientName,
        payment_method
      });

      navigation.navigate("TicketResult", { ticket: res.data });
    } catch (err) {
      Alert.alert("Erreur", err.response?.data?.message || err.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Client :</Text>
      <TextInput value={clientName} onChangeText={setClientName} placeholder="Nom du client" />

      <Text>Siège :</Text>
      <SeatMap trip={trip} selectedSeat={seat} onSelectSeat={setSeat} />

      <Text>Méthode paiement :</Text>
      <TextInput value={paymentMethod} onChangeText={setPaymentMethod} placeholder="cash / wave / orange" />

      <Button title="Vendre Ticket" onPress={sellTicket} />
    </View>
  );
}
