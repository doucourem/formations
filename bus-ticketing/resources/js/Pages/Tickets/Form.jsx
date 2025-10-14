import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Button,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  Select,
  TextField,
} from "@mui/material";

export default function TicketForm({ ticket = null, trips = [], tickets = [] }) {
  const [form, setForm] = useState({
    trip_id: ticket?.trip_id || "",
    stop_id: ticket?.stop_id || "",
    client_name: ticket?.client_name || "",
    client_nina: ticket?.client_nina || "",
    seat_number: ticket?.seat_number || "",
    status: ticket?.status || "booked",
  });

  const [stops, setStops] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);

  // Met à jour stops et sièges lorsque le voyage change
  useEffect(() => {
    const selectedTrip = trips.find((t) => t.id === form.trip_id);
    setStops(selectedTrip?.route?.stops || []);

    // Récupère les sièges déjà occupés pour ce voyage (hors ticket en édition)
    const seatsTaken = (tickets || [])
      .filter((t) => t.trip_id === form.trip_id && t.id !== ticket?.id)
      .map((t) => t.seat_number);

    setOccupiedSeats(seatsTaken);

    // Génère la liste des sièges disponibles
    const busCapacity = selectedTrip?.bus?.capacity || 0;
    const seats = [];
    for (let i = 1; i <= busCapacity; i++) {
      seats.push(i.toString());
    }
    const freeSeats = seats.filter((s) => !seatsTaken.includes(s));
    setAvailableSeats(freeSeats);
  }, [form.trip_id, trips, tickets, ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticket?.id) {
      Inertia.put(route("ticket.update", ticket.id), form);
    } else {
      Inertia.post(route("ticket.store"), form);
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          {ticket?.id ? `Éditer le ticket #${ticket.id}` : "Créer un ticket"}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Voyage */}
          <FormControl fullWidth>
            <InputLabel id="trip-label">Voyage</InputLabel>
            <Select
              labelId="trip-label"
              name="trip_id"
              value={form.trip_id || ""}
              label="Voyage"
              onChange={handleChange}
              required
            >
              {trips.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {(t.route?.departureCity?.name || "-") +
                    " → " +
                    (t.route?.arrivalCity?.name || "-") +
                    ` (Départ : ${t.departure_at})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Point d'arrêt */}
          <FormControl fullWidth disabled={!form.trip_id}>
            <InputLabel id="stop-label">Point d’arrêt</InputLabel>
            <Select
              labelId="stop-label"
              name="stop_id"
              value={form.stop_id || ""}
              label="Point d’arrêt"
              onChange={handleChange}
            >
              {stops.length > 0 ? (
                stops.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.city?.name || "—"} ({s.distance_from_start} km)
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Aucun arrêt disponible</MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Nom du client */}
          <TextField
            label="Nom du client"
            name="client_name"
            value={form.client_name}
            onChange={handleChange}
            fullWidth
            required
          />

          {/* NINA */}
          <TextField
            label="NINA"
            name="client_nina"
            value={form.client_nina}
            onChange={handleChange}
            fullWidth
          />

          {/* Siège */}
          <FormControl fullWidth>
            <InputLabel id="seat-label">Siège</InputLabel>
            <Select
              labelId="seat-label"
              name="seat_number"
              value={form.seat_number}
              onChange={handleChange}
              required
            >
              {availableSeats.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
              {occupiedSeats.map((s) => (
                <MenuItem key={s} value={s} disabled>
                  {s} (déjà réservé)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Statut */}
          <FormControl fullWidth>
            <InputLabel id="status-label">Statut</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={form.status}
              label="Statut"
              onChange={handleChange}
              required
            >
              <MenuItem value="booked">Réservé</MenuItem>
              <MenuItem value="paid">Payé</MenuItem>
              <MenuItem value="cancelled">Annulé</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="success">
            {ticket?.id ? "Mettre à jour" : "Créer"}
          </Button>
        </Box>

        {occupiedSeats.length > 0 && (
          <Typography sx={{ mt: 2, fontStyle: "italic" }}>
            Sièges déjà réservés : {occupiedSeats.join(", ")}
          </Typography>
        )}
      </Box>
    </GuestLayout>
  );
}
