import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  Card,
  Text,
  Button,
  ActivityIndicator,
  useTheme,
  Chip,
  Divider,
  TextInput,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { fetchTrips } from "../services/ticketApi";

export default function TripListScreen({ navigation }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 360;
  const isIOS = Platform.OS === "ios";

  const fontFamily = Platform.select({
    ios: "System",
    android: "Roboto",
  });

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [cityFilter, setCityFilter] = useState("");

  /* ========================
        CHARGEMENT
     ======================== */
  const loadTrips = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    try {
      const res = await fetchTrips();
      const data = res.data?.data ?? res.data ?? [];
      setTrips(data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger les voyages");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  /* ========================
        UTILS
     ======================== */
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
    const reserved =
      trip?.tickets?.filter(
        (t) => t.status === "reserved" || t.status === "paid"
      ).length ?? 0;

    return Math.max(capacity - reserved, 0);
  };

  /* ========================
        FILTRES
     ======================== */
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const left = getAvailableSeats(trip);

      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "available" && left > 0) ||
        (filterStatus === "full" && left <= 0);

      const cityMatch =
        trip?.route?.departure_city?.name
          ?.toLowerCase()
          .includes(cityFilter.toLowerCase()) ||
        trip?.route?.arrival_city?.name
          ?.toLowerCase()
          .includes(cityFilter.toLowerCase());

      return statusMatch && cityMatch;
    });
  }, [trips, filterStatus, cityFilter]);

  /* ========================
        ITEM
     ======================== */
  const renderTripItem = ({ item }) => {
    const left = getAvailableSeats(item);
    const isFull = left <= 0;

    return (
      <Card style={styles.card} elevation={3}>
        <Card.Content>
          {/* Trajet */}
          <View style={styles.routeHeader}>
            <View style={styles.cityContainer}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.cityName,
                  { fontFamily },
                ]}
              >
                {item?.route?.departure_city?.name}
              </Text>

              <Icon
                name="arrow-right"
                size={isSmallScreen ? 16 : 18}
                color={theme.colors.primary}
              />

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.cityName,
                  { fontFamily },
                ]}
              >
                {item?.route?.arrival_city?.name}
              </Text>
            </View>

            <Chip
              compact
              style={[
                styles.chip,
                { backgroundColor: isFull ? "#FFEBEE" : "#E8F5E9" },
              ]}
              textStyle={{
                fontFamily,
                fontSize: isSmallScreen ? 10 : 11,
                color: isFull ? "#D32F2F" : "#388E3C",
              }}
            >
              {isFull ? "COMPLET" : `${left} places`}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          {/* Infos */}
          <View style={styles.detailsRow}>
            <View style={styles.infoBlock}>
              <Icon
                name="clock-outline"
                size={isSmallScreen ? 14 : 16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={[styles.infoText, { fontFamily }]}>
                {formatDateTime(item.departure_at)}
              </Text>
            </View>

            <View style={styles.infoBlock}>
              <Icon
                name="bus"
                size={isSmallScreen ? 14 : 16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={[styles.infoText, { fontFamily }]}>
                {item?.bus?.registration_number || "-"}
              </Text>
            </View>
          </View>
        </Card.Content>

        {/* Actions */}
        <Card.Actions style={styles.actions}>
          <Button
            compact
            mode="text"
            labelStyle={{ fontFamily, fontSize: 12 }}
            onPress={() =>
              navigation.navigate("TripTicketsScreen", { tripId: item.id })
            }
          >
            Détails
          </Button>

          <Button
            compact
            mode="contained"
            disabled={isFull}
            labelStyle={{ fontFamily, fontSize: 12 }}
            onPress={() =>
              navigation.navigate("AddTicket", { tripId: item.id })
            }
          >
            {isFull ? "Complet" : "Réserver"}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  /* ========================
        LOADING
     ======================== */
  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  /* ========================
        RENDER
     ======================== */
  return (
    <View style={{ flex: 1 }}>
      {/* Filtres */}
      <View style={styles.filters}>
        {["all", "available", "full"].map((status) => (
          <Chip
            key={status}
            compact
            selected={filterStatus === status}
            onPress={() => setFilterStatus(status)}
            style={styles.filterChip}
          >
            {status === "all"
              ? "Tous"
              : status === "available"
              ? "Disponible"
              : "Complet"}
          </Chip>
        ))}
      </View>

      <TextInput
        label="Filtrer par ville"
        value={cityFilter}
        onChangeText={setCityFilter}
        mode="outlined"
        style={styles.input}
      />

      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTripItem}
        numColumns={1}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTrips(true)}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Icon name="bus-alert" size={56} color={theme.colors.outline} />
            <Text style={{ marginTop: 10 }}>Aucun voyage disponible</Text>
          </View>
        }
      />
    </View>
  );
}

/* ========================
        STYLES
   ======================== */
const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 28,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  routeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cityContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cityName: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 4,
    flexShrink: 1,
    color: "#222",
  },
  chip: {
    height: 28,
  },
  divider: {
    marginVertical: 8,
  },
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
    fontSize: 12,
    color: "#666",
  },
  actions: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginVertical: 8,
  },
  filterChip: {
    margin: 4,
    height: 30,
  },
  input: {
    marginHorizontal: 12,
    marginBottom: 8,
  },
});
