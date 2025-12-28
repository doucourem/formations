// src/screens/trips/TripListScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import api from "../../api/axios";

export default function TripListScreen({ navigation }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    api.get("/trips").then(res => setTrips(res.data));
  }, []);

  return (
    <FlatList
      data={trips}
      keyExtractor={t => t.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate("TicketSell", { trip: item })}
          style={{ padding: 20, borderBottomWidth: 1 }}
        >
          <Text>{item.route.departureCity.name} → {item.route.arrivalCity.name}</Text>
          <Text>Départ: {item.departure_at}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
