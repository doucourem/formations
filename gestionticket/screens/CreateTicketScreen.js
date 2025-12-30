import React, { useEffect, useState, useCallback } from "react";
import { View, FlatList, StyleSheet, Alert, ScrollView } from "react-native";
import { 
  Button, 
  TextInput, 
  Text, 
  ActivityIndicator, 
  useTheme, 
  Surface,
  Divider
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import api, { createTicket } from "../services/ticketApi";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function CreateTicketScreen({ navigation, route }) {
  const { tripId } = route.params;
  const theme = useTheme();

  // États
  const [clientName, setClientName] = useState("");
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Charger les sièges depuis l'API
  const loadSeats = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.get(`/trips/${tripId}/seats`);
      setSeats(res.data);
    } catch (e) {
      console.error("Erreur chargement sièges:", e);
    } finally {
      setLoading(false);
    }
  };

  // Polling intelligent : s'arrête quand on quitte l'écran
  useFocusEffect(
    useCallback(() => {
      loadSeats(true);
      const interval = setInterval(() => loadSeats(false), 5000);
      return () => clearInterval(interval);
    }, [tripId])
  );

  // Logique de sélection/réservation temporaire
  const handleSeatSelection = async (seat) => {
    if (!clientName.trim()) {
      Alert.alert("Nom requis", "Entrez le nom du client avant de choisir un siège.");
      return;
    }

    if (seat.status !== "available" && seat.seat_number !== selectedSeat) {
      return; // Siège déjà pris
    }

    try {
      await api.post("/seats/reserve", {
        trip_id: tripId,
        seat_number: seat.seat_number,
        client_name: clientName,
      });
      setSelectedSeat(seat.seat_number);
      loadSeats(false);
    } catch (err) {
      Alert.alert("Indisponible", "Ce siège vient d'être réservé par quelqu'un d'autre.");
      loadSeats(false);
    }
  };

  // Validation finale (Réservation ou Paiement)
  const handleAction = async (status) => {
    if (!clientName || !selectedSeat) {
      Alert.alert("Incomplet", "Veuillez remplir le nom et choisir un siège.");
      return;
    }

    setProcessing(true);
    try {
      await createTicket({
        trip_id: tripId,
        client_name: clientName,
        seat_number: selectedSeat,
        status: status, // "reserved" ou "paid"
      });
      Alert.alert("Succès", status === "paid" ? "Billet vendu !" : "Réservation confirmée");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erreur", "Impossible de finaliser l'opération.");
    } finally {
      setProcessing(false);
    }
  };

  // Rendu d'un siège individuel
  const renderSeat = ({ item }) => {
    const isSelected = selectedSeat === item.seat_number;
    const isSold = item.status === "sold";
    const isReserved = item.status === "reserved";

    // Couleurs basées sur le thème
    let seatColor = theme.colors.outline; 
    let textColor = theme.colors.onSurface;

    if (isSold) {
      seatColor = "#E57373"; // Rouge
      textColor = "#fff";
    } else if (isReserved) {
      seatColor = theme.colors.secondary; // Orange
      textColor = "#fff";
    } else if (isSelected) {
      seatColor = theme.colors.primary; // Votre vert #4CAF50
      textColor = "#fff";
    }

    return (
      <Surface style={[styles.seatWrapper, { borderRadius: theme.roundness }]}>
        <Button
          mode={isSelected ? "contained" : "outlined"}
          onPress={() => handleSeatSelection(item)}
          disabled={isSold || (isReserved && !isSelected)}
          style={[styles.seat, { backgroundColor: isSelected || isSold || isReserved ? seatColor : "transparent" }]}
          labelStyle={{ color: isSelected || isSold || isReserved ? "#fff" : theme.colors.primary }}
          contentStyle={{ height: 50 }}
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
        <Text style={{ marginTop: 10 }}>Chargement du bus...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* SECTION CLIENT */}
      <Surface style={styles.headerCard}>
        <TextInput
          label="Nom du passager"
          value={clientName}
          onChangeText={setClientName}
          mode="outlined"
          placeholder="Ex: Jean Dupont"
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
          style={{ backgroundColor: theme.colors.surface }}
          left={<TextInput.Icon icon="account" />}
        />
      </Surface>

      {/* SECTION BUS */}
      <Surface style={styles.busContainer}>
        <View style={styles.busHeader}>
          <Icon name="steering" size={30} color={theme.colors.onSurfaceVariant} />
          <Text style={styles.busTitle}>PLAN DU VÉHICULE</Text>
        </View>
        <Divider style={{ marginBottom: 15 }} />

        

        <FlatList
          data={seats}
          numColumns={4}
          renderItem={renderSeat}
          keyExtractor={(item) => item.seat_number.toString()}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </Surface>

      {/* SECTION ACTIONS */}
      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={() => handleAction("reserved")}
          style={[styles.btn, { borderColor: theme.colors.primary }]}
          disabled={processing || !selectedSeat}
          loading={processing && !selectedSeat}
        >
          Réserver
        </Button>
        <Button
          mode="contained"
          onPress={() => handleAction("paid")}
          style={[styles.btn, { backgroundColor: theme.colors.primary }]}
          disabled={processing || !selectedSeat}
          loading={processing}
        >
          Payer
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerCard: {
    padding: 15,
    elevation: 2,
    borderRadius: 12,
    marginBottom: 15,
  },
  busContainer: {
    flex: 1,
    elevation: 1,
    borderRadius: 15,
    padding: 10,
  },
  busHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  busTitle: {
    fontWeight: "bold",
    letterSpacing: 1,
    fontSize: 12,
    color: "#777",
  },
  row: {
    justifyContent: "space-around",
  },
  seatWrapper: {
    width: "22%",
    marginVertical: 5,
    elevation: 1,
  },
  seat: {
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  btn: {
    flex: 0.48,
    borderRadius: 8,
  },
});