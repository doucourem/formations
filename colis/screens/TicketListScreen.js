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
import * as Linking from "expo-linking";
import { fetchTickets } from "../services/ticketApi";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const statusOptions = [
  { label: "Tous", value: "" },
  { label: "Réservé", value: "reserved", color: "#FF9800" },
  { label: "Payé", value: "paid", color: "#4CAF50" },
  { label: "Annulé", value: "cancelled", color: "#F44336" },
];

export default function TicketListScreen() {
  const theme = useTheme();
  
  // États de données
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // États des filtres
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(null);

  // États UI
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Fonction utilitaire pour récupérer les infos de statut
  const getStatusInfo = (statusValue) => {
    return statusOptions.find(s => s.value === statusValue) || statusOptions[0];
  };

  const loadTickets = async (pageNumber = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      
      const res = await fetchTickets({
        page: pageNumber,
        search: clientFilter,
        status: statusFilter,
        date: dateFilter ? dateFilter.toISOString().split("T")[0] : null,
      });

      const newTickets = res.data?.data || [];
      const meta = res.data?.meta || {};

      setTickets(reset ? newTickets : [...tickets, ...newTickets]);
      setHasMore(meta.current_page < meta.last_page);
      setPage(meta.current_page + 1);
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de charger les tickets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Recharger quand l'écran prend le focus ou quand les filtres critiques changent
  useFocusEffect(
    useCallback(() => {
      loadTickets(1, true);
    }, [statusFilter, dateFilter])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets(1, true);
  };

  const exportPdf = (ticketId) => {
    const url = `${process.env.EXPO_PUBLIC_API_URL}/tickets/${ticketId}/pdf`;
    Linking.openURL(url).catch(() => Alert.alert("Erreur", "Impossible d'ouvrir le PDF"));
  };

 const renderTicket = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <Card style={styles.card} elevation={1}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.clientName}>{item.client_name}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {`ID: #${item.id} • Siège: ${item.seat_number ?? "N/A"}`}
              </Text>
            </View>
            <Chip 
  textStyle={[styles.chipText, { fontSize: 14 }]} // On surcharge ici
  style={[styles.statusChip, { backgroundColor: statusInfo.color, height: 32 }]}
>
  {statusInfo.label}
</Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.routeBox}>
            <Icon name="bus-side" size={16} color={theme.colors.primary} />
            <Text style={styles.routeText}>
              {/* Utilisation d'une template string pour éviter les espaces entre nœuds */}
              {`${item.trip?.departureCity || "-"} → ${item.trip?.arrivalCity || "-"}`}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <Text variant="headlineSmall" style={[styles.price, { color: theme.colors.primary }]}>
              {item.price ? `${item.price} CFA` : "---"}
            </Text>
            <Button 
              mode="outlined" 
              icon="file-pdf-box" 
              onPress={() => exportPdf(item.id)}
              style={styles.pdfBtn}
            >
              PDF
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      
      {/* SECTION FILTRES */}
      <Surface style={styles.filterSurface} elevation={2}>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Rechercher un client..."
            value={clientFilter}
            onChangeText={setClientFilter}
            mode="flat"
            style={styles.searchBar}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            right={<TextInput.Icon icon="magnify" onPress={() => loadTickets(1, true)} />}
          />
          <IconButton 
            icon={isFilterExpanded ? "filter-off" : "filter-variant"} 
            mode="contained"
            containerColor={isFilterExpanded ? theme.colors.primary : theme.colors.surfaceVariant}
            iconColor={isFilterExpanded ? "#fff" : theme.colors.primary}
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
                  <Button 
                    mode="outlined" 
                    onPress={() => setStatusMenuVisible(true)} 
                    icon="chevron-down"
                    contentStyle={{ flexDirection: 'row-reverse' }}
                  >
                    {getStatusInfo(statusFilter).label}
                  </Button>
                }
              >
                {statusOptions.map((s) => (
                  <Menu.Item 
                    key={s.value} 
                    title={s.label} 
                    onPress={() => { setStatusFilter(s.value); setStatusMenuVisible(false); }} 
                  />
                ))}
              </Menu>

              <Button 
                mode="outlined" 
                icon="calendar" 
                onPress={() => setShowDatePicker(true)}
              >
                {dateFilter ? dateFilter.toLocaleDateString() : "Date"}
              </Button>
            </View>
            
            <View style={styles.filterActions}>
                { (dateFilter || statusFilter || clientFilter) && (
                    <Button 
                      onPress={() => { setDateFilter(null); setStatusFilter(""); setClientFilter(""); loadTickets(1, true); }}
                      textColor={theme.colors.error}
                    >
                      Réinitialiser
                    </Button>
                )}
                <Button mode="contained" onPress={() => { loadTickets(1, true); setIsFilterExpanded(false); }}>
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
          onChange={(e, date) => { setShowDatePicker(false); if (date) setDateFilter(date); }}
        />
      )}

      {/* LISTE DES TICKETS */}
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTicket}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        onEndReached={() => hasMore && !loading && loadTickets(page)}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Icon name="ticket-off-outline" size={60} color={theme.colors.outline} />
              <Text variant="bodyLarge" style={{ marginTop: 10 }}>Aucun ticket trouvé</Text>
            </View>
          )
        }
        ListFooterComponent={loading && page > 1 ? <ActivityIndicator style={{ margin: 20 }} color={theme.colors.primary} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  filterSurface: { 
    padding: 10, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20, 
    marginBottom: 5 
  },
  searchRow: { flexDirection: 'row', alignItems: 'center' },
  searchBar: { 
    flex: 1, 
    backgroundColor: '#f0f0f0', 
    height: 45, 
    marginRight: 8, 
    borderRadius: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  optionsPanel: { marginTop: 15, paddingHorizontal: 5 },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  filterActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 },
  listContent: { padding: 12, paddingBottom: 40 },
  card: { marginBottom: 12, borderRadius: 15, backgroundColor: '#fff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  clientName: { fontWeight: 'bold', fontSize: 18, marginBottom: 2 },
  statusChip: { height: 26, borderRadius: 13 },
  chipText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  divider: { marginVertical: 12, opacity: 0.3 },
  routeBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  routeText: { marginLeft: 8, fontSize: 15, fontWeight: '500', color: '#444' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontWeight: 'bold' },
  pdfBtn: { borderRadius: 8 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
});