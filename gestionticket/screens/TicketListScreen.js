import React, { useCallback, useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import {
  Card,
  Text,
  ActivityIndicator,
  Button,
  TextInput,
  Chip,
  Menu,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Linking from "expo-linking";
import { fetchTickets } from "../services/ticketApi";

/* ================= CONSTANTES ================= */
const statusOptions = [
  { label: "Tous", value: "" },
  { label: "Réservé", value: "reserved" },
  { label: "Payé", value: "paid" },
  { label: "Annulé", value: "cancelled" },
];

const statusColors = {
  reserved: "#FF9800",
  paid: "#4CAF50",
  cancelled: "#F44336",
};

export default function TicketListScreen() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);

  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  /* ================= LOAD TICKETS ================= */
  const loadTickets = async (pageNumber = 1, reset = false) => {
    try {
      if (reset) setLoading(true);

      const res = await fetchTickets({
        page: pageNumber,
        search: clientFilter,
        status: statusFilter,
        date: dateFilter ? dateFilter.toISOString().split("T")[0] : null,
      });

      const newTickets = res.data.data;
      setTickets(reset ? newTickets : [...tickets, ...newTickets]);
      setHasMore(res.data.meta.current_page < res.data.meta.last_page);
      setPage(res.data.meta.current_page + 1);
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de charger les tickets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTickets(1, true);
    }, [clientFilter, statusFilter, dateFilter])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets(1, true);
  };

  const exportPdf = (ticketId) => {
    Linking.openURL(`${process.env.EXPO_PUBLIC_API_URL}/tickets/${ticketId}/pdf`);
  };

  const getStatusLabel = (status) => statusOptions.find(s => s.value === status)?.label || status;

  /* ================= RENDER ================= */
  if (loading && page === 1) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* ================= FILTRES ================= */}
      <Card style={styles.filters}>
        <TextInput
          label="Client"
          value={clientFilter}
          onChangeText={setClientFilter}
          mode="outlined"
          style={styles.input}
        />

        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Button mode="outlined" onPress={() => setStatusMenuVisible(true)}>
              {statusOptions.find(s => s.value === statusFilter)?.label || "Statut"}
            </Button>
          }
        >
          {statusOptions.map((s) => (
            <Menu.Item
              key={s.value}
              title={s.label}
              onPress={() => {
                setStatusFilter(s.value);
                setStatusMenuVisible(false);
              }}
            />
          ))}
        </Menu>

        <Button mode="outlined" onPress={() => setShowDatePicker(true)}>
          {dateFilter ? dateFilter.toLocaleDateString() : "Filtrer par date"}
        </Button>

        {showDatePicker && (
          <DateTimePicker
            value={dateFilter || new Date()}
            mode="date"
            display="default"
            onChange={(e, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDateFilter(selectedDate);
            }}
          />
        )}

        <Button
          mode="contained"
          style={{ marginTop: 10 }}
          onPress={() => loadTickets(1, true)}
        >
          Appliquer filtres
        </Button>
      </Card>

      {/* ================= LISTE DES TICKETS ================= */}
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={() => hasMore && loadTickets(page)}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 10 }} /> : null}
        renderItem={({ item }) => (
          <Card style={styles.card}>
  <Card.Content>
    <Text variant="titleMedium">{item.client_name}</Text>
    <Text>
      {item.trip?.departureCity || "-"} → {item.trip?.arrivalCity || "-"}
    </Text>
    <Text>Siège : {item.seat_number ?? "N/A"}</Text>
    <Text>Prix : {item.price ? `${item.price} CFA` : "N/A"}</Text>

    <View style={styles.row}>
      <Chip
        style={{ backgroundColor: statusColors[item.status] || "#999" }}
        textStyle={{ color: "#fff" }}
      >
        {getStatusLabel(item.status)}
      </Chip>

      <Button
        mode="outlined"
        icon="file-pdf-box"
        onPress={() => exportPdf(item.id)}
      >
        PDF
      </Button>
    </View>
  </Card.Content>
</Card>

        )}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { padding: 10 },
  card: { marginBottom: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  filters: { margin: 10, padding: 10 },
  input: { marginBottom: 10 },
  row: { marginTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
