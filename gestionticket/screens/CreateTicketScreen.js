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
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import api, { createTicket } from "../services/ticketApi";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function CreateTicketScreen({ navigation, route }) {
  const { tripId } = route.params;
  const theme = useTheme();
  const { width } = useWindowDimensions();

  /* ================= ÉTATS ================= */
  const [clientName, setClientName] = useState("");
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const numColumns = width > 600 ? 5 : 4;

  /* ================= LOAD SEATS ================= */
  const loadSeats = async () => {
    try {
      const res = await api.get(`/trips/${tripId}/seats`);
      setSeats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSeats();
      const interval = setInterval(loadSeats, 5000);
      return () => clearInterval(interval);
    }, [tripId])
  );

  /* ================= SELECTION ================= */
  const handleSeatSelection = (seat) => {
    if (!clientName.trim()) {
      Alert.alert("Nom requis", "Veuillez entrer le nom du client.");
      return;
    }

    if (seat.status !== "available") return;

    setSelectedSeat(seat.seat_number);
  };

  /* ================= VALIDATION UNIQUE ================= */
  const handleValidate = async () => {
    if (!clientName || !selectedSeat) {
      Alert.alert("Incomplet", "Nom et siège requis.");
      return;
    }

    setProcessing(true);
    try {
      await createTicket({
        trip_id: tripId,
        client_name: clientName,
        seat_number: selectedSeat,
        status: "paid", // ✅ UNE SEULE ACTION
      });

      Alert.alert("Succès", "Billet vendu avec succès");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erreur", "Ce siège est déjà pris.");
      loadSeats();
    } finally {
      setProcessing(false);
    }
  };

  /* ================= RENDER SEAT ================= */
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
          mode={isSelected ? "contained" : "outlined"}
          disabled={isSold || isReserved}
          onPress={() => handleSeatSelection(item)}
          style={[styles.seat, { backgroundColor: bg }]}
          labelStyle={{ color }}
        >
          {item.seat_number}
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
          keyExtractor={(i) => i.seat_number.toString()}
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
        disabled={!selectedSeat || processing}
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
