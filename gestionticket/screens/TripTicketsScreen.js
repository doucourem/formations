import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert, Text } from "react-native";
import { Card, ActivityIndicator } from "react-native-paper";
import {api, fetchTicketsByTrip} from "../services/ticketApi";

export default function TripTicketsScreen({ route }) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip(tripId);
  }, [tripId]);

  const loadTrip = async (tripId) => {
    try {
      const res = await fetchTicketsByTrip(tripId);
      const tripData = res.data.data; // ← correction ici

      if (tripData) {
        setTrip(tripData);
        setTickets(
          tripData.tickets
            ? tripData.tickets.sort(
                (a, b) => (a.seat_number ?? 0) - (b.seat_number ?? 0)
              )
            : []
        );
      } else {
        Alert.alert("Erreur", "Voyage introuvable");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de charger les tickets");
    } finally {
      setLoading(false);
    }
  };

  // Traduction du statut en français
  const getStatusText = (status) => {
    switch (status) {
      case "reserved":
        return "Réservé";
      case "paid":
        return "Payé";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  // Couleur selon le statut
  const getStatusColor = (status) => {
    switch (status) {
      case "reserved":
        return "#f0ad4e"; // orange
      case "paid":
        return "#5cb85c"; // vert
      case "cancelled":
        return "#d9534f"; // rouge
      default:
        return "#999"; // gris
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header du trajet */}
      {trip && (
        <View style={styles.tripHeader}>
          <Text style={styles.tripText}>
            {trip.departureCity ?? "-"} → {trip.arrivalCity ?? "-"}
          </Text>
          <Text style={styles.tripDate}>
            Départ :{" "}
            {trip.departure_at
              ? new Date(trip.departure_at).toLocaleString()
              : "-"}
          </Text>
        </View>
      )}

      {/* Liste des tickets */}
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text>Nom du client : {item.client_name}</Text>
              <Text>Siège : {item.seat_number ?? "-"}</Text>
              <Text style={{ color: getStatusColor(item.status) }}>
                Statut : {getStatusText(item.status)}
              </Text>
              <Text>Prix : {item.price ?? 0} CFA</Text>
              <Text>Réservé le : {item.created_at ?? "-"}</Text>
              {item.user && (
                <Text>
                  Agent : {item.user.name}{" "}
                  {item.user.agency ? `(${item.user.agency.name})` : ""}
                </Text>
              )}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Aucun ticket pour ce voyage
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  tripHeader: { marginBottom: 15 },
  tripText: { fontSize: 18, fontWeight: "bold" },
  tripDate: { fontSize: 14, color: "#555" },
  card: { marginBottom: 10 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
