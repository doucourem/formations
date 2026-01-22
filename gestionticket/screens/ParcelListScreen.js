import React, { useCallback, useState } from "react";
import { View, FlatList, StyleSheet, Alert, RefreshControl } from "react-native";
import {
  Card,
  Text,
  ActivityIndicator,
  Button,
  TextInput,
  Chip,
  Menu,
  useTheme,
  IconButton,
  Surface,
  Divider
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { fetchParcels } from "../services/parcelApi";

const statusOptions = [
  { label: "Tous", value: "" },
  { label: "En attente", value: "pending", color: "#FF9800" },
  { label: "En transit", value: "in_transit", color: "#2196F3" },
  { label: "Livré", value: "delivered", color: "#4CAF50" },
  { label: "Annulé", value: "cancelled", color: "#F44336" },
];

export default function ParcelListScreen() {
  const theme = useTheme();

  // DATA
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // FILTERS
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);

  // UI
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const getStatusInfo = (value) =>
    statusOptions.find(s => s.value === value) || statusOptions[0];

  const loadParcels = async (pageNumber = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const res = await fetchParcels({
        page: pageNumber,
        search,
        status: statusFilter,
        date: dateFilter ? dateFilter.toISOString().split("T")[0] : null,
      });

      const newParcels = res.data?.data || [];
      const meta = res.data?.meta || {};

      setParcels(reset ? newParcels : [...parcels, ...newParcels]);
      setHasMore(meta.current_page < meta.last_page);
      setPage(meta.current_page + 1);
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible de charger les colis");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadParcels(1, true);
    }, [statusFilter, dateFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadParcels(1, true);
  };

  const renderParcel = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);

    return (
      <Card style={styles.card} elevation={1}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.tracking}>
                #{item.tracking_number}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {item.sender_name} → {item.recipient_name}
              </Text>
            </View>

            <Chip
              style={[styles.statusChip, { backgroundColor: statusInfo.color }]}
              textStyle={styles.chipText}
            >
              {statusInfo.label}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.routeBox}>
            <Icon name="map-marker-path" size={16} color={theme.colors.primary} />
            <Text style={styles.routeText}>
              {`${item.trip?.departureCity || "-"} → ${item.trip?.arrivalCity || "-"}`}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.price, { color: theme.colors.primary }]}>
              {item.price ? `${item.price} CFA` : "---"}
            </Text>

            <Button
              mode="outlined"
              icon="eye"
              onPress={() => {/* navigation.navigate("ParcelDetails", { id: item.id }) */}}
            >
              Détails
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* FILTERS */}
      <Surface style={styles.filterSurface} elevation={2}>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Rechercher (tracking, expéditeur...)"
            value={search}
            onChangeText={setSearch}
            style={styles.searchBar}
            right={<TextInput.Icon icon="magnify" onPress={() => loadParcels(1, true)} />}
          />

          <IconButton
            icon={isFilterExpanded ? "filter-off" : "filter-variant"}
            onPress={() => setIsFilterExpanded(!isFilterExpanded)}
          />
        </View>

        {isFilterExpanded && (
          <View style={styles.optionsPanel}>
            <View style={styles.optionsRow}>
              <Menu
                visible={statusMenuVisible}
                onDismiss={() => setStatusMenuVisible(false)}
                anchor={
                  <Button onPress={() => setStatusMenuVisible(true)}>
                    {getStatusInfo(statusFilter).label}
                  </Button>
                }
              >
                {statusOptions.map(s => (
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

              <Button icon="calendar" onPress={() => setShowDatePicker(true)}>
                {dateFilter ? dateFilter.toLocaleDateString() : "Date"}
              </Button>
            </View>

            <View style={styles.filterActions}>
              {(search || statusFilter || dateFilter) && (
                <Button onPress={() => {
                  setSearch("");
                  setStatusFilter("");
                  setDateFilter(null);
                  loadParcels(1, true);
                }}>
                  Réinitialiser
                </Button>
              )}
              <Button mode="contained" onPress={() => loadParcels(1, true)}>
                Appliquer
              </Button>
            </View>
          </View>
        )}
      </Surface>

      {showDatePicker && (
        <DateTimePicker
          value={dateFilter || new Date()}
          mode="date"
          onChange={(e, d) => {
            setShowDatePicker(false);
            if (d) setDateFilter(d);
          }}
        />
      )}

      {/* LIST */}
      <FlatList
        data={parcels}
        keyExtractor={item => item.id.toString()}
        renderItem={renderParcel}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => hasMore && !loading && loadParcels(page)}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading && page > 1 ? <ActivityIndicator style={{ margin: 20 }} /> : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Icon name="package-variant" size={60} />
              <Text>Aucun colis trouvé</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterSurface: { padding: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchBar: { flex: 1, marginRight: 8 },
  optionsPanel: { marginTop: 15 },
  optionsRow: { flexDirection: "row", justifyContent: "space-between" },
  filterActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  listContent: { padding: 12 },
  card: { marginBottom: 12, borderRadius: 15 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  tracking: { fontWeight: "bold", fontSize: 16 },
  statusChip: { height: 26 },
  chipText: { color: "#fff", fontWeight: "bold" },
  divider: { marginVertical: 12 },
  routeBox: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  routeText: { marginLeft: 8 },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  price: { fontWeight: "bold" },
  empty: { alignItems: "center", marginTop: 100 },
});
