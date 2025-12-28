import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import { fetchTicket } from "../services/ticketApi";

export default function TicketDetailScreen({ route }) {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    fetchTicket(ticketId).then((res) => setTicket(res.data));
  }, []);

  if (!ticket) return null;

  return (
    <ScrollView>
      <Card>
        <Card.Content>
          <Text variant="titleLarge">{ticket.client_name}</Text>
          <Text>Siège : {ticket.seat_number}</Text>
          <Text>Status : {ticket.status}</Text>
          <Text>
            {ticket.trip.route.departure_city.name} →
            {ticket.trip.route.arrival_city.name}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
