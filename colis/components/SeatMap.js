// src/components/SeatMap.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function SeatMap({ trip, selectedSeat, onSelectSeat }) {
  const seats = Array.from({ length: trip.bus.capacity }, (_, i) => (i + 1).toString());
  const occupied = trip.tickets.map(t => t.seat_number);

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {seats.map(seat => (
        <TouchableOpacity
          key={seat}
          onPress={() => !occupied.includes(seat) && onSelectSeat(seat)}
          style={{
            width: 40,
            height: 40,
            margin: 5,
            backgroundColor: seat === selectedSeat ? "green" : occupied.includes(seat) ? "red" : "grey",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text style={{ color: "white" }}>{seat}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
