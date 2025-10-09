import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";

export default function TicketForm({ ticket, trips }) {
  const [form, setForm] = useState({
    trip_id: ticket?.trip_id || "",
    stop_id: ticket?.stop_id || "",
    client_name: ticket?.client_name || "",
    seat_number: ticket?.seat_number || "",
    status: ticket?.status || "reserved",
  });

  const [stops, setStops] = useState([]);

  useEffect(() => {
    const selectedTrip = trips.find((t) => t.id === form.trip_id);
    setStops(selectedTrip?.route?.stops || []);
  }, [form.trip_id, trips]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
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
    ` (Départ : ${t.departure_at}, Arrivée : ${t.arrival_at})`}
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
            required
          />

          {/* Siège */}
          <TextField
            label="Siège"
            name="seat_number"
            value={form.seat_number}
            onChange={handleChange}
          />

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
              <MenuItem value="reserved">Réservé</MenuItem>
              <MenuItem value="paid">Payé</MenuItem>
              <MenuItem value="cancelled">Annulé</MenuItem>
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="success">
            {ticket?.id ? "Mettre à jour" : "Créer"}
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
