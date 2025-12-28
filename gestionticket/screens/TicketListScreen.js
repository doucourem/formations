import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Alert, TextInput } from "react-native";
import { Card, Text, ActivityIndicator, Button } from "react-native-paper";
import { fetchTickets } from "../services/ticketApi";

export default function TicketListScreen() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");

  useEffect(() => {
    loadTickets(1, true);
  }, [statusFilter, clientFilter]);

  const loadTickets = async (pageNumber = 1, reset = false) => {
    try {
      if (reset) setLoading(true);
      const res = await fetchTickets({ page: pageNumber, status: statusFilter, search: clientFilter });
      const newTickets = res.data.data;
      setTickets(reset ? newTickets : [...tickets, ...newTickets]);
      setHasMore(res.data.meta.current_page < res.data.meta.last_page);
      setPage(res.data.meta.current_page + 1);
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger les tickets");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "reserved": return "#f0ad4e";
      case "paid": return "#5cb85c";
      case "cancelled": return "#d9534f";
      default: return "#999";
    }
  };

  if (loading && page === 1) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* ====== FILTRES ====== */}
      <View style={styles.filters}>
        <TextInput
          placeholder="Filtrer par client"
          value={clientFilter}
          onChangeText={setClientFilter}
          style={styles.input}
        />
        <TextInput
          placeholder="Filtrer par statut (reserved, paid, cancelled)"
          value={statusFilter}
          onChangeText={setStatusFilter}
          style={styles.input}
        />
        <Button mode="contained" onPress={() => loadTickets(1, true)}>Appliquer</Button>
      </View>

      {/* ====== LISTE DES TICKETS ====== */}
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        onEndReached={() => hasMore && loadTickets(page)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading && <ActivityIndicator style={{ margin: 10 }} />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">{item.client_name}</Text>
              <Text>{item.trip.route.departure_city.name} → {item.trip.route.arrival_city.name}</Text>
              <Text>Siège : {item.seat_number || "N/A"}</Text>
              <Text>Prix : {item.price ? item.price + " CFA" : "N/A"}</Text>
              <Text style={{ color: getStatusColor(item.status) }}>Statut : {item.status}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  card: { marginBottom: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  filters: { padding: 10 },
  input: { marginBottom: 10, padding: 5, borderWidth: 1, borderRadius: 5, borderColor: "#ccc" },
});
