import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { 
  Card, 
  Text, 
  ActivityIndicator, 
  useTheme, 
  Surface, 
  Chip, 
  Divider,
  Avatar
} from "react-native-paper";
import { fetchTicketsByTrip } from "../services/ticketApi";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function TripTicketsScreen({ route }) {
  const { tripId } = route.params;
  const theme = useTheme();
  
  const [trip, setTrip] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTripData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchTicketsByTrip(tripId);
      const tripData = res.data?.data;

      if (tripData) {
        setTrip(tripData);
        // Tri par numéro de siège
        const sortedTickets = tripData.tickets 
          ? [...tripData.tickets].sort((a, b) => (a.seat_number ?? 0) - (b.seat_number ?? 0))
          : [];
        setTickets(sortedTickets);
      } else {
        Alert.alert("Erreur", "Données du voyage introuvables");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de charger les détails du voyage");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadTripData();
  }, [loadTripData]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "paid":
        return { label: "Payé", color: "#4CAF50", icon: "check-circle" };
      case "reserved":
        return { label: "Réservé", color: "#FF9800", icon: "clock-outline" };
      case "cancelled":
        return { label: "Annulé", color: "#F44336", icon: "close-circle" };
      default:
        return { label: status, color: "#999", icon: "help-circle" };
    }
  };

  const renderTicketItem = ({ item }) => {
    const status = getStatusConfig(item.status);

    return (
      <Card style={styles.card} elevation={1}>
        <Card.Content>
          <View style={styles.ticketRow}>
            {/* Numéro de siège style Avatar */}
            <Avatar.Text 
              size={40} 
              label={item.seat_number?.toString() || "?"} 
              style={{ backgroundColor: theme.colors.primaryContainer }}
              labelStyle={{ color: theme.colors.primary, fontWeight: 'bold' }}
            />
            
            <View style={styles.clientInfo}>
              <Text variant="titleMedium" style={styles.clientName}>{item.client_name}</Text>
              <View style={styles.agentRow}>
                <Icon name="account-tie" size={14} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={styles.agentText}>
                  {item.user?.name || "Agent inconnu"} {item.user?.agency ? `(${item.user.agency.name})` : ""}
                </Text>
              </View>
            </View>

           
            <Chip 
  textStyle={[styles.chipText, { fontSize: 14 }]} // On surcharge ici
  style={[styles.statusChip, { backgroundColor: statusInfo.color, height: 32 }]}
>
  {status.label}
</Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.priceRow}>
            <View style={styles.dateBlock}>
              <Icon name="calendar-clock" size={16} color={theme.colors.outline} />
              <Text variant="bodySmall" style={styles.dateText}>
                        {item.created_at ?? "-"}
              </Text>
            </View>
            <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
              {item.price?.toLocaleString() || "0"} CFA
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header Statique du Voyage */}
      <Surface style={styles.headerSurface} elevation={2}>
        <View style={styles.routeHeader}>
          <Text variant="headlineSmall" style={styles.routeText}>
            {trip.departureCity ?? "-"}
          </Text>
          <Icon name="arrow-right-bold" size={24} color={theme.colors.primary} />
          <Text variant="headlineSmall" style={styles.routeText}>
          {trip.arrivalCity ?? "-"}
       
          </Text>
        </View>
        
        <View style={styles.subHeader}>
          <View style={styles.headerInfo}>
            <Icon name="clock-outline" size={18} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.headerInfoText}>
              {trip?.departure_at ? new Date(trip.departure_at).toLocaleString() : "-"}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Icon name="bus" size={18} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.headerInfoText}>{trip?.bus?.registration_number || "Bus"}</Text>
          </View>
        </View>
      </Surface>

      {/* Liste des tickets */}
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTicketItem}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <Text variant="labelLarge" style={styles.listTitle}>
            PASSAGERS ENREGISTRÉS ({tickets.length})
          </Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="ticket-outline" size={50} color={theme.colors.outline} />
            <Text style={{ marginTop: 10 }}>Aucun ticket pour ce voyage</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerSurface: {
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 10,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 10
  },
  routeText: { fontWeight: 'bold' },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center' },
  headerInfoText: { marginLeft: 8, color: '#666', fontSize: 13 },
  listContainer: { padding: 15, paddingBottom: 30 },
  listTitle: { marginBottom: 15, color: '#888', letterSpacing: 1 },
  card: { marginBottom: 12, borderRadius: 12 },
  ticketRow: { flexDirection: 'row', alignItems: 'center' },
  clientInfo: { flex: 1, marginLeft: 15 },
  clientName: { fontWeight: 'bold' },
  agentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  agentText: { marginLeft: 5, color: '#777' },
  divider: { marginVertical: 12, opacity: 0.3 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBlock: { flexDirection: 'row', alignItems: 'center' },
  dateText: { marginLeft: 6, color: '#999' },
  emptyState: { alignItems: 'center', marginTop: 50, opacity: 0.5 }
});