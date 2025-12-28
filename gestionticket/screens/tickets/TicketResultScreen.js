// src/screens/tickets/TicketResultScreen.js
import React from "react";
import { View, Text, Button } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function TicketResultScreen({ route }) {
  const { ticket } = route.params;

  return (
    <View style={{ padding: 20, alignItems: "center" }}>
      <Text>Ticket #{ticket.id}</Text>
      <Text>Client: {ticket.client_name}</Text>
      <Text>Siège: {ticket.seat_number}</Text>
      <QRCode value={ticket.uuid} size={180} />
      <Button title="Retour" onPress={() => route.navigation.goBack()} />
    </View>
  );
}
