import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import api from "../services/ticketApi";
import { fetchTicketsByTrip } from "../services/ticketApi";
export default function TripTicketsScreen({ route }) {
  const { tripId } = route.params;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets(tripId);
  }, []);



const loadTickets = async (tripId) => {
  try {
    const res = await fetchTicketsByTrip(tripId);
    const tickets = res.data?.data ?? res.data ?? [];
    // trier par numéro de siège
    const sorted = tickets.sort((a, b) => (a.seat_number ?? 0) - (b.seat_number ?? 0));
    setTickets(sorted);
  } catch (err) {
    console.error(err);
    Alert.alert("Erreur", "Impossible de charger les tickets");
  } finally {
    setLoading(false);
  }
};


  const getStatusColor = (status) => {
    switch (status) {
      case "reserved": return "#f0ad4e"; // orange
      case "paid": return "#5cb85c";     // vert
      case "cancelled": return "#d9534f"; // rouge
      default: return "#999";
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={tickets}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Content>
            <Text>Nom du client : {item.client_name}</Text>
            <Text>Siège : {item.seat_number}</Text>
            <Text style={{ color: getStatusColor(item.status) }}>
              Statut : {item.status}
            </Text>
            <Text>Prix : {item.price} CFA</Text>
          </Card.Content>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  card: { marginBottom: 10 },
});
