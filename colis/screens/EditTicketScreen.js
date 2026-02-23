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
  Menu,
  Provider,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import api, { updateTicket } from "../services/ticketApi"; // 🔹 updateTicket
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function EditTicketScreen({ navigation, route }) {
  const { tripId, ticket } = route.params; // ticket existant
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const [clientName, setClientName] = useState(ticket?.client_name || "");
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(ticket?.seat_number || null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [stops, setStops] = useState([]);
  const [startStop, setStartStop] = useState(ticket?.start_stop_id || null);
  const [endStop, setEndStop] = useState(ticket?.end_stop_id || null);
  const [departureMenuVisible, setDepartureMenuVisible] = useState(false);
  const [arrivalMenuVisible, setArrivalMenuVisible] = useState(false);

  const numColumns = width > 600 ? 5 : 4;

  const loadData = async () => {
    try {
      const seatsRes = await api.get(`/trips/${tripId}/seats`);
      setSeats(seatsRes.data);
      const stopsRes = await api.get(`/trips/${tripId}/stops`);
      setStops(stopsRes.data);
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
    if (seat.status !== "available" && seat.seat_number !== selectedSeat) return;
    setSelectedSeat(seat.seat_number);
  };

  const handleValidate = async () => {
    if (!clientName || !selectedSeat || !startStop || !endStop) {
      return Alert.alert("Incomplet", "Nom, siège, départ et arrivée requis.");
    }

    if (startStop === endStop) {
      return Alert.alert("Erreur", "Le départ et l'arrivée ne peuvent pas être identiques.");
    }

    setProcessing(true);
    try {
      await updateTicket(ticket.id, {
        client_name: clientName,
        seat_number: selectedSeat,
        start_stop_id: startStop,
        end_stop_id: endStop,
        status: "paid",
      });

      Alert.alert("Succès", "Billet mis à jour avec succès");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Erreur", "Impossible de mettre à jour le billet.");
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
          mode={isSelected ? "contained" : "outlined"}
          disabled={(isSold || isReserved) && item.seat_number !== selectedSeat}
          onPress={() => handleSeatSelection(item)}
          style={[styles.seat, { backgroundColor: bg }]}
          labelStyle={{ color }}
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
        <Surface style={styles.card}>
          <TextInput
            label="Nom du passager"
            value={clientName}
            onChangeText={setClientName}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
          />
        </Surface>

        {/* Départ / Arrivée */}
        <Surface style={styles.card}>
          {/* Départ */}
          <Menu
            visible={departureMenuVisible}
            onDismiss={() => setDepartureMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setDepartureMenuVisible(true)}>
                {startStop
                  ? stops.find(st => st.id === startStop)?.city.name
                  : "Sélectionner le départ"}
              </Button>
            }
          >
            {stops.map(s => (
              <Menu.Item
                key={s.id}
                onPress={() => {
                  setStartStop(s.id);
                  setEndStop(null);
                  setDepartureMenuVisible(false);
                }}
                title={`${s.order}. ${s.city.name} - ${Number(s.partial_price).toLocaleString()} CFA`}
              />
            ))}
          </Menu>

          {/* Arrivée */}
          <Menu
            visible={arrivalMenuVisible}
            onDismiss={() => setArrivalMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setArrivalMenuVisible(true)}
                style={{ marginTop: 10 }}
              >
                {endStop
                  ? stops.find(st => st.id === endStop)?.to_city.name
                  : "Sélectionner l'arrivée"}
              </Button>
            }
          >
            {stops
              .filter(s => s.order > (stops.find(st => st.id === startStop)?.order || 0))
              .map(s => (
                <Menu.Item
                  key={s.id}
                  onPress={() => {
                    setEndStop(s.id);
                    setArrivalMenuVisible(false);
                  }}
                  title={`${s.order}. ${s.to_city.name} - ${Number(s.partial_price).toLocaleString()} CFA`}
                />
              ))}
          </Menu>
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
            keyExtractor={i => i.seat_number.toString()}
            numColumns={numColumns}
            columnWrapperStyle={{ justifyContent: "space-around" }}
            contentContainerStyle={{ paddingVertical: 15 }}
            showsVerticalScrollIndicator={false}
          />
        </Surface>

        <Button
          mode="contained"
          onPress={handleValidate}
          loading={processing}
          disabled={!selectedSeat || !startStop || !endStop || processing}
          style={styles.payBtn}
        >
          Mettre à jour
        </Button>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { padding: 15, borderRadius: 12, marginBottom: 15 },
  busContainer: { flex: 1, padding: 10, borderRadius: 15 },
  busHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  busTitle: { fontSize: 12, fontWeight: "bold", opacity: 0.6 },
  seatWrapper: { width: "22%", marginVertical: 6 },
  seat: { width: "100%" },
  payBtn: { marginTop: 10, borderRadius: 10, paddingVertical: 6 },
});
