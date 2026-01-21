import React, { useState, useCallback, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert, useWindowDimensions } from "react-native";
import {
  Button,
  TextInput,
  Text,
  ActivityIndicator,
  useTheme,
  Surface,
  Divider,
} from "react-native-paper";
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from "@react-navigation/native";
import api, { createTicket } from "../services/ticketApi";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function CreateTicketScreen({ navigation, route }) {
  const { tripId } = route.params;
  const theme = useTheme();
  const { width } = useWindowDimensions();

  /* ================= ÉTATS ================= */
  const [clientName, setClientName] = useState("");
  const [subTrips, setSubTrips] = useState([]);
  const [selectedSubTrip, setSelectedSubTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [startStop, setStartStop] = useState(null);
  const [endStop, setEndStop] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const numColumns = width > 600 ? 5 : 4;

  /* ================= LOAD SUBTRIPS ================= */
  const loadSubTrips = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/sub-trips`);
      setSubTrips(res.data || []);
      if (res.data?.length === 1) setSelectedSubTrip(res.data[0].id);
    } catch (e) {
      console.error("Erreur lors du chargement des sous-trajets :", e);
    }
  };

  /* ================= LOAD STOPS ================= */
  const loadStops = async (subTripId) => {
    if (!subTripId) {
      setStops([]);
      return;
    }
    try {
      const res = await api.get(`/sub-trips/${subTripId}/stops`);
      setStops(res.data || []);
    } catch (e) {
      console.error("Erreur lors du chargement des stops :", e);
    }
  };

  /* ================= LOAD SEATS ================= */
  const loadSeats = async () => {
    if (!selectedSubTrip) {
      setSeats([]);
      return;
    }
    try {
      const res = await api.get(`/sub-trips/${selectedSubTrip}/seats`);
      setSeats(res.data || []);
    } catch (e) {
      console.error("Erreur lors du chargement des sièges :", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubTrip) {
      loadStops(selectedSubTrip);
      loadSeats();
    }
  }, [selectedSubTrip]);

  useFocusEffect(
    useCallback(() => {
      loadSubTrips();
      const interval = setInterval(() => loadSeats(), 5000);
      return () => clearInterval(interval);
    }, [tripId, selectedSubTrip])
  );

  /* ================= SELECTION ================= */
  const handleSeatSelection = (seat) => {
    if (!clientName.trim()) {
      Alert.alert("Nom requis", "Veuillez entrer le nom du client.");
      return;
    }
    if (!seat?.seat_number || seat.status !== "available") return;
    setSelectedSeat(seat.seat_number);
  };

  /* ================= VALIDATION ================= */
  const handleValidate = async () => {
    if (!clientName.trim()) {
      Alert.alert("Nom requis", "Veuillez entrer le nom du client.");
      return;
    }
    if (!selectedSubTrip) {
      Alert.alert("Sous-trajet requis", "Veuillez sélectionner un sous-trajet.");
      return;
    }
    if (!selectedSeat) {
      Alert.alert("Siège requis", "Veuillez sélectionner un siège disponible.");
      return;
    }

    setProcessing(true);
    try {
      await createTicket({
        trip_id: tripId,
        sub_trip_id: selectedSubTrip,
        start_stop_id: startStop,
        end_stop_id: endStop,
        client_name: clientName,
        seat_number: selectedSeat,
        status: "paid",
      });

      Alert.alert("Succès", "Billet vendu avec succès");
      navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Ce siège est déjà pris ou une erreur est survenue.");
      loadSeats();
    } finally {
      setProcessing(false);
    }
  };

  /* ================= RENDER SEAT ================= */
  const renderSeat = ({ item }) => {
    const seatNumber = item?.seat_number?.toString() || "";
    const isSelected = selectedSeat === seatNumber;
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
          mode={isSelected ? "contained" : "outlined"}
          disabled={isSold || isReserved}
          onPress={() => handleSeatSelection(item)}
          style={[styles.seat, { backgroundColor: bg }]}
          labelStyle={{ color }}
        >
          {seatNumber || "—"}
        </Button>
      </Surface>
    );
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>Chargement du bus…</Text>
      </View>
    );
  }

  /* ================= UI ================= */
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* CLIENT */}
      <Surface style={styles.card}>
        <TextInput
          label="Nom du passager"
          value={clientName}
          onChangeText={setClientName}
          mode="outlined"
          left={<TextInput.Icon icon="account" />}
        />
      </Surface>

      {/* SOUS-TRAJETS */}
      <Surface style={styles.card}>
        <Text style={{ marginBottom: 8, fontWeight: "bold" }}>Sous-trajet</Text>
        {subTrips.length > 0 ? (
          subTrips.map((sub) => (
            <Button
              key={sub.id}
              mode={selectedSubTrip === sub.id ? "contained" : "outlined"}
              onPress={() => {
                setSelectedSubTrip(sub.id);
                setSelectedSeat(null);
                setStartStop(null);
                setEndStop(null);
                setLoading(true);
              }}
              style={{ marginBottom: 5 }}
            >
              {sub.name || `${sub.departureCity?.name || "-"} → ${sub.arrivalCity?.name || "-"}`}
            </Button>
          ))
        ) : (
          <Text>Aucun sous-trajet disponible</Text>
        )}
      </Surface>

      {/* STOP DE DÉPART */}
      {stops.length > 0 && (
        <Surface style={styles.card}>
          <Text style={{ marginBottom: 5 }}>Départ (optionnel)</Text>
          <Picker
            selectedValue={startStop}
            onValueChange={(value) => {
              setStartStop(value);
              setEndStop(null); // reset end stop when changing start
            }}
          >
            <Picker.Item label="— Sélectionner —" value={null} />
            {stops.map((s) => (
              <Picker.Item
                key={s.id}
                label={s.city?.name || s.toCity?.name || "—"}
                value={s.id}
              />
            ))}
          </Picker>
        </Surface>
      )}

      {/* STOP D’ARRIVÉE */}
      {startStop && (
        <Surface style={styles.card}>
          <Text style={{ marginBottom: 5 }}>Arrivée (optionnel)</Text>
          <Picker
            selectedValue={endStop}
            onValueChange={(value) => setEndStop(value)}
          >
            <Picker.Item label="— Sélectionner —" value={null} />
            {stops
              .filter((s) => s.order >= (stops.find(st => st.id === startStop)?.order || 0))
              .map((s) => (
                <Picker.Item
                  key={s.id}
                  label={s.city?.name || s.toCity?.name || "—"}
                  value={s.id}
                />
              ))}
          </Picker>
        </Surface>
      )}

      {/* BUS */}
      <Surface style={styles.busContainer}>
        <View style={styles.busHeader}>
          <Icon name="bus" size={28} />
          <Text style={styles.busTitle}>PLAN DU BUS</Text>
        </View>

        <Divider />

        <FlatList
          data={seats}
          renderItem={renderSeat}
          keyExtractor={(i, index) => (i?.seat_number?.toString() || index.toString())}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: "space-around" }}
          contentContainerStyle={{ paddingVertical: 15 }}
          showsVerticalScrollIndicator={false}
        />
      </Surface>

      {/* ACTION */}
      <Button
        mode="contained"
        onPress={handleValidate}
        loading={processing}
        disabled={!selectedSeat || processing || !selectedSubTrip}
        style={styles.payBtn}
      >
        Valider & Payer
      </Button>
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  busContainer: {
    flex: 1,
    padding: 10,
    borderRadius: 15,
  },

  busHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  busTitle: {
    fontSize: 12,
    fontWeight: "bold",
    opacity: 0.6,
  },

  seatWrapper: {
    width: "22%",
    marginVertical: 6,
  },

  seat: {
    width: "100%",
  },

  payBtn: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 6,
  },
});
