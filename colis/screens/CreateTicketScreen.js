import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Alert, useWindowDimensions } from "react-native";
import {
  Button,
  TextInput,
  Text,
  ActivityIndicator,
  useTheme,
  Surface,
  Divider,
  Provider,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import api, { createTicket } from "../services/ticketApi";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function CreateTicketScreen({ navigation, route }) {
  const { tripId } = route.params;
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const [clientName, setClientName] = useState("");
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [stops, setStops] = useState([]);
  const [startStop, setStartStop] = useState(null);
  const [endStop, setEndStop] = useState(null);

  const numColumns = width > 600 ? 5 : 4;

  const loadData = async () => {
    try {
      const seatsRes = await api.get(`/trips/${tripId}/seats`);
      setSeats(seatsRes.data || []);

      const stopsRes = await api.get(`/trips/${tripId}/stops`);
      setStops(stopsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }, [tripId])
  );

  const handleSeatSelection = (seat) => {
    if (!clientName.trim()) {
      Alert.alert("Nom requis", "Veuillez entrer le nom du client.");
      return;
    }
    if (seat.status !== "available") return;
    setSelectedSeat(seat.seat_number);
  };

  const handleValidate = async () => {
    if (!clientName || !selectedSeat) {
      return Alert.alert("Incomplet", "Nom et siège requis.");
    }

    setProcessing(true);
    try {
      await createTicket({
        trip_id: tripId,
        client_name: clientName,
        seat_number: selectedSeat,
        start_stop_id: startStop ?? null,
        end_stop_id: endStop ?? null,
        status: "paid",
      });

      Alert.alert("Succès", "Billet vendu avec succès");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erreur", "Ce siège est déjà pris.");
      loadData();
    } finally {
      setProcessing(false);
    }
  };

  const renderSeat = ({ item }) => {
    const isSelected = selectedSeat === item.seat_number;
    const isSold = item.status === "sold";
    const isReserved = item.status === "reserved";

    let bg = "transparent";
    let color = theme.colors.primary;

    if (isSold) bg = "#E57373";
    else if (isReserved) bg = theme.colors.secondary;
    else if (isSelected) bg = theme.colors.primary;

    if (isSold || isReserved || isSelected) color = "#fff";

    return (
      <Surface style={styles.seatWrapper}>
        <Button
          compact
          mode={isSelected ? "contained" : "outlined"}
          disabled={isSold || isReserved}
          onPress={() => handleSeatSelection(item)}
          style={[styles.seat, { backgroundColor: bg }]}
          labelStyle={{ color, fontSize: 12 }}
        >
          {item.seat_number}
        </Button>
      </Surface>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>Chargement du bus…</Text>
      </View>
    );
  }

  return (
    <Provider>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        
        {/* CLIENT */}
        <Surface style={styles.card}>
          <TextInput
            label="Nom du passager"
            value={clientName}
            onChangeText={setClientName}
            mode="outlined"
            dense
            left={<TextInput.Icon icon="account" />}
          />
        </Surface>

        {/* TRAJET COMPACT */}
        <Surface style={styles.card}>
          <Text style={styles.sectionTitle}>Trajet</Text>

          <Text style={styles.label}>Départ</Text>
          <FlatList
            horizontal
            data={stops}
            keyExtractor={(i) => i.id.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = startStop === item.id;
              return (
                <Button
                  compact
                  mode={selected ? "contained" : "outlined"}
                  onPress={() => {
                    setStartStop(item.id);
                    setEndStop(null);
                  }}
                  style={styles.chip}
                  labelStyle={styles.chipText}
                >
                  {item.city?.name ?? "Ville"}
                </Button>
              );
            }}
          />

          <Text style={[styles.label, { marginTop: 8 }]}>Arrivée</Text>
          <FlatList
            horizontal
            data={stops.filter(
              s => s.order >= (stops.find(st => st.id === startStop)?.order || 0)
            )}
            keyExtractor={(i) => i.id.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = endStop === item.id;
              return (
                <Button
                  compact
                  mode={selected ? "contained" : "outlined"}
                  onPress={() => setEndStop(item.id)}
                  style={styles.chip}
                  labelStyle={styles.chipText}
                >
                  {item.to_city?.name ?? "Ville"}
                </Button>
              );
            }}
          />
        </Surface>

        {/* BUS */}
        <Surface style={styles.busContainer}>
          <View style={styles.busHeader}>
            <Icon name="bus" size={24} />
            <Text style={styles.busTitle}>PLAN DU BUS</Text>
          </View>

          <Divider />

          <FlatList
            data={seats}
            renderItem={renderSeat}
            keyExtractor={(i) => i.seat_number.toString()}
            numColumns={numColumns}
            columnWrapperStyle={{ justifyContent: "space-around" }}
            contentContainerStyle={{ paddingVertical: 12 }}
          />
        </Surface>

        {/* ACTION */}
        <Button
          mode="contained"
          onPress={handleValidate}
          loading={processing}
          disabled={!selectedSeat || processing}
          style={styles.payBtn}
        >
          Valider & Payer
        </Button>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: { padding: 12, borderRadius: 10, marginBottom: 12 },

  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  label: { fontSize: 12, opacity: 0.6, marginBottom: 2 },

  chip: {
    marginRight: 6,
    height: 32,
    borderRadius: 18,
    justifyContent: "center",
  },

  chipText: { fontSize: 12 },

  busContainer: { flex: 1, padding: 8, borderRadius: 12 },

  busHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  busTitle: { fontSize: 11, fontWeight: "bold", opacity: 0.6 },

  seatWrapper: { width: "22%", marginVertical: 5 },
  seat: { width: "100%" },

  payBtn: { marginTop: 8, borderRadius: 10, paddingVertical: 4 },
});
