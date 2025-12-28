import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { Card, Text, Button, ActivityIndicator } from "react-native-paper";
import { fetchTrips } from "../services/ticketApi";

export default function TripListScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    try {
      const res = await fetchTrips();
      // Support Laravel pagination ou liste simple
      const data = res.data?.data ?? res.data ?? [];
      setTrips(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de charger les voyages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const formatDateTime = (datetime) => {
    if (!datetime) return "-";
    const d = new Date(datetime);
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getAvailableSeats = (trip) => {
    const capacity = trip?.bus?.capacity ?? 0;
    const reservedSeats =
      trip?.tickets?.filter(
        (t) => t.status === "reserved" || t.status === "paid"
      ).length ?? 0;
    return Math.max(capacity - reservedSeats, 0);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Aucun voyage disponible</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={trips}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => {
        const seats = getAvailableSeats(item);

        return (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">
                {item?.route?.departure_city?.name} →{" "}
                {item?.route?.arrival_city?.name}
              </Text>

              <Text>Départ : {formatDateTime(item.departure_at)}</Text>
              <Text>Arrivée : {formatDateTime(item.arrival_at)}</Text>

              <Text>
                Bus : {item?.bus?.registration_number} ({item?.bus?.model})
              </Text>

              <Text>Places disponibles : {seats}</Text>
            </Card.Content>

            <Card.Actions>
              {/* Bouton Voir Tickets */}
              <Button
                mode="outlined"
                onPress={() =>
                  navigation.navigate("Tickets du voyage", { tripId: item.id })
                }
              >
                Voir tickets
              </Button>

              {/* Bouton Réserver */}
              <Button
                mode="contained"
                disabled={seats <= 0}
                onPress={() =>
                  navigation.navigate("Créer Ticket", { tripId: item.id })
                }
              >
                {seats > 0 ? "Réserver" : "Complet"}
              </Button>
            </Card.Actions>
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  card: { marginBottom: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
