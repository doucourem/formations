import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Alert, RefreshControl } from "react-native";
import { Card, Text, Button, ActivityIndicator, useTheme, Chip, Divider } from "react-native-paper";
import { fetchTrips } from "../services/ticketApi";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function TripListScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const loadTrips = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    try {
      const res = await fetchTrips();
      const data = res.data?.data ?? res.data ?? [];
      setTrips(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de charger les voyages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const formatDateTime = (datetime) => {
    if (!datetime) return "-";
    const d = new Date(datetime);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvailableSeats = (trip) => {
    const capacity = trip?.bus?.capacity ?? 0;
    const reservedSeats =
      trip?.tickets?.filter(
        (t) => t.status === "reserved" || t.status === "paid"
      ).length ?? 0;
    return {
      left: Math.max(capacity - reservedSeats, 0),
      total: capacity
    };
  };

  const renderTripItem = ({ item }) => {
    const { left, total } = getAvailableSeats(item);
    const isFull = left <= 0;

    return (
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          {/* Header du trajet */}
          <View style={styles.routeHeader}>
            <View style={styles.cityContainer}>
              <Text variant="titleLarge" style={styles.cityName}>
                {item?.route?.departure_city?.name}
              </Text>
              <Icon name="arrow-right" size={20} color={theme.colors.primary} />
              <Text variant="titleLarge" style={styles.cityName}>
                {item?.route?.arrival_city?.name}
              </Text>
            </View>
            <Chip 
              icon="bus" 
              style={{ backgroundColor: isFull ? "#FFEBEE" : "#E8F5E9" }}
              textStyle={{ color: isFull ? "#D32F2F" : "#388E3C", fontSize: 11 }}
            >
              {isFull ? "COMPLET" : `${left} places`}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          {/* Infos Détails */}
          <View style={styles.detailsRow}>
            <View style={styles.infoBlock}>
              <Icon name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.infoText}>{formatDateTime(item.departure_at)}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Icon name="identifier" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.infoText}>{item?.bus?.registration_number}</Text>
            </View>
          </View>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button
            mode="text"
            icon="ticket-multiple"
            onPress={() => navigation.navigate("TripTicketsScreen", { tripId: item.id })}
          >
            Détails
          </Button>
          <Button
            mode="contained"
            disabled={isFull}
            icon={isFull ? "close-circle" : "cart-plus"}
            onPress={() => navigation.navigate("AddTicket", { tripId: item.id })}
            style={{ borderRadius: 8 }}
          >
            {isFull ? "Complet" : "Réserver"}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={trips}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => loadTrips(true)} colors={[theme.colors.primary]} />
      }
      renderItem={renderTripItem}
      ListEmptyComponent={
        <View style={styles.center}>
          <Icon name="bus-alert" size={60} color={theme.colors.outline} />
          <Text style={{ marginTop: 10, color: theme.colors.onSurfaceVariant }}>Aucun voyage disponible</Text>
          <Button onPress={() => loadTrips(true)}>Actualiser</Button>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, paddingBottom: 30 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: { marginBottom: 16, borderRadius: 12 },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cityContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cityName: {
    fontWeight: "bold",
    marginHorizontal: 5,
  },
  divider: { marginVertical: 10, opacity: 0.5 },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#555",
  },
  actions: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
});