import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
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
  Alert,
} from "@mui/material";

export default function TicketForm({ ticket = null, trips = [] }) {
  const { data, setData, post, put, processing, errors } = useForm({
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
  const [soldTickets, setSoldTickets] = useState(0);
  const [busCapacity, setBusCapacity] = useState(0);

  // 🚌 Mise à jour dynamique selon le voyage choisi
  useEffect(() => {
    const selectedTrip = trips.find((t) => t.id === data.trip_id);

    if (selectedTrip) {
      setStops(selectedTrip?.route?.stops || []);

      const tickets = selectedTrip?.tickets || [];
      const seatsTaken = tickets
        .filter((t) => t.id !== ticket?.id)
        .map((t) => t.seat_number);

      setOccupiedSeats(seatsTaken);

      const capacity = selectedTrip?.bus?.capacity || 0;
      setBusCapacity(capacity);
      setSoldTickets(tickets.length);

      const seats = Array.from({ length: capacity }, (_, i) =>
        (i + 1).toString()
      );
      setAvailableSeats(seats.filter((s) => !seatsTaken.includes(s)));
    } else {
      setStops([]);
      setOccupiedSeats([]);
      setAvailableSeats([]);
      setSoldTickets(0);
      setBusCapacity(0);
    }
  }, [data.trip_id, trips, ticket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticket?.id) {
      put(route("ticket.update", ticket.id));
    } else {
      post(route("ticket.store"));
    }
  };

  // 🧩 Condition : bus plein ?
  const isBusFull = busCapacity > 0 && soldTickets >= busCapacity;

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
          <FormControl fullWidth error={!!errors.trip_id}>
            <InputLabel id="trip-label">Voyage</InputLabel>
            <Select
              labelId="trip-label"
              name="trip_id"
              value={data.trip_id}
              onChange={(e) => setData("trip_id", e.target.value)}
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
            {errors.trip_id && (
              <Typography color="error" variant="caption">
                {errors.trip_id}
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth disabled={!data.trip_id} error={!!errors.stop_id}>
            <InputLabel id="stop-label">Point d’arrêt</InputLabel>
            <Select
              labelId="stop-label"
              name="stop_id"
              value={data.stop_id}
              onChange={(e) => setData("stop_id", e.target.value)}
            >
              {stops.length > 0 ? (
                stops.map((s) => (
                 <MenuItem key={s.id} value={s.id}>
  {`${s.city?.name || "—"} → ${s.toCity?.name || "—"} (${s.distance_from_start} km)`}
</MenuItem>
                ))
              ) : (
                <MenuItem disabled>Aucun arrêt disponible</MenuItem>
              )}
            </Select>
            {errors.stop_id && (
              <Typography color="error" variant="caption">
                {errors.stop_id}
              </Typography>
            )}
          </FormControl>

          <TextField
            label="Nom du client"
            name="client_name"
            value={data.client_name}
            onChange={(e) => setData("client_name", e.target.value)}
            fullWidth
            required
            error={!!errors.client_name}
            helperText={errors.client_name}
          />

          <FormControl fullWidth error={!!errors.seat_number}>
            <TextField
              label="Numéro de siège"
              name="seat_number"
              value={data.seat_number}
              onChange={(e) => setData("seat_number", e.target.value)}
              fullWidth
              required
              error={!!errors.seat_number}
              helperText={
                errors.seat_number
                  ? errors.seat_number
                  : occupiedSeats.length > 0
                  ? `Sièges déjà réservés : ${occupiedSeats.join(", ")}`
                  : ""
              }
            />
          </FormControl>

          <FormControl fullWidth error={!!errors.status}>
            <InputLabel id="status-label">Statut</InputLabel>
            <Select
              labelId="status-label"
              name="status"
              value={data.status}
              onChange={(e) => setData("status", e.target.value)}
              required
            >
              <MenuItem value="reserved">Réservé</MenuItem>
              <MenuItem value="paid">Payé</MenuItem>
              <MenuItem value="cancelled">Annulé</MenuItem>
            </Select>
            {errors.status && (
              <Typography color="error" variant="caption">
                {errors.status}
              </Typography>
            )}
          </FormControl>

          {/* 🚫 Si bus plein → désactiver le bouton */}
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={processing || isBusFull}
          >
            {ticket?.id ? "Mettre à jour" : "Créer"}
          </Button>
        </Box>

        {/* 🧾 Résumé dynamique */}
        {data.trip_id && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1">
              🎟️ Billets vendus : <strong>{soldTickets}</strong>
            </Typography>
            <Typography variant="body1">
              🪑 Places disponibles :{" "}
              <strong>{busCapacity - soldTickets}</strong> / {busCapacity}
            </Typography>

            {isBusFull && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                🚫 Le bus est complet — impossible de réserver un nouveau billet.
              </Alert>
            )}

            {occupiedSeats.length > 0 && (
              <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                Sièges déjà réservés : {occupiedSeats.join(", ")}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </GuestLayout>
  );
}
