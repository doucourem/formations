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
    start_stop_id: ticket?.start_stop_id || "",
    end_stop_id: ticket?.end_stop_id || "",
    client_name: ticket?.client_name || "",
    client_nina: ticket?.client_nina || "",
    seat_number: ticket?.seat_number || "",
    status: ticket?.status || "reserved",
    price: ticket?.price || 0,
  });

  const [stops, setStops] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [busCapacity, setBusCapacity] = useState(0);
  const [soldTickets, setSoldTickets] = useState(0);

  // 🔹 Met à jour les arrêts et sièges selon le trajet sélectionné
  useEffect(() => {
    const selectedTrip = trips.find((t) => t.id === data.trip_id);

    if (selectedTrip) {
      const tripStops = selectedTrip?.route?.stops || [];
      setStops(tripStops);

      const tickets = selectedTrip?.tickets || [];
      let seatsTaken = [];

      if (data.start_stop_id && data.end_stop_id) {
        const startOrder = tripStops.find(
          (s) => s.id === Number(data.start_stop_id)
        )?.order;
        const endOrder = tripStops.find(
          (s) => s.id === Number(data.end_stop_id)
        )?.order;

        if (startOrder !== undefined && endOrder !== undefined) {
          seatsTaken = tickets
            .filter((t) => {
              const tStart = tripStops.find((s) => s.id === t.start_stop_id)?.order;
              const tEnd = tripStops.find((s) => s.id === t.end_stop_id)?.order;
              return !(tEnd < startOrder || tStart > endOrder);
            })
            .map((t) => t.seat_number);
        }
      } else {
        // Aucun arrêt défini → on bloque les sièges déjà pris sur tout le trajet
        seatsTaken = tickets.map((t) => t.seat_number);
      }

      setOccupiedSeats(seatsTaken);
      setBusCapacity(selectedTrip?.bus?.capacity || 0);
      setSoldTickets(tickets.length);
    } else {
      setStops([]);
      setOccupiedSeats([]);
      setBusCapacity(0);
      setSoldTickets(0);
    }
  }, [data.trip_id, data.start_stop_id, data.end_stop_id, trips, ticket]);

  // 🔹 Calcul automatique du prix selon les arrêts (facultatif maintenant)
  useEffect(() => {
    if (data.start_stop_id && data.end_stop_id) {
      const start = stops.find((s) => s.id === Number(data.start_stop_id));
      const end = stops.find((s) => s.id === Number(data.end_stop_id));

      if (start && end && start.order <= end.order) {
        const selectedStops = stops.filter(
          (s) => s.order >= start.order && s.order <= end.order
        );
        const totalPrice = selectedStops.reduce(
          (sum, s) => sum + (s.price || 0),
          0
        );
        setData("price", totalPrice);
      } else {
        setData("price", 0);
      }
    } else {
      // Aucun arrêt défini → garder le prix actuel ou 0
      setData("price", data.price || 0);
    }
  }, [data.start_stop_id, data.end_stop_id, stops]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticket?.id) {
      put(route("ticket.update", ticket.id));
    } else {
      post(route("ticket.store"));
    }
  };

  const isBusFull = soldTickets >= busCapacity;

  // 🔹 Helpers pour affichage
  const formatStopdepartLabel = (s) => s.city?.name || "—";
  const formatStopLabel = (s) => s.toCity?.name || s.city?.name || "—";

  // 🔹 Places libres
  const allSeats = Array.from({ length: busCapacity }, (_, i) => (i + 1).toString());
  const freeSeats = allSeats.filter((seat) => !occupiedSeats.includes(seat));

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
          </FormControl>

          {/* Stop de départ (facultatif) */}
          <FormControl fullWidth disabled={!data.trip_id} error={!!errors.start_stop_id}>
            <InputLabel id="start-stop-label">Départ (optionnel)</InputLabel>
            <Select
              labelId="start-stop-label"
              name="start_stop_id"
              value={data.start_stop_id}
              onChange={(e) => {
                setData("start_stop_id", e.target.value);
                setData("end_stop_id", "");
              }}
            >
              {stops.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {formatStopdepartLabel(s)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Stop d’arrivée (facultatif) */}
          <FormControl fullWidth disabled={!data.start_stop_id} error={!!errors.end_stop_id}>
            <InputLabel id="end-stop-label">Arrivée (optionnel)</InputLabel>
            <Select
              labelId="end-stop-label"
              name="end_stop_id"
              value={data.end_stop_id}
              onChange={(e) => setData("end_stop_id", e.target.value)}
            >
              {stops
                .filter(
                  (s) =>
                    s.order >=
                    (stops.find((st) => st.id === Number(data.start_stop_id))?.order || 0)
                )
                .map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {formatStopLabel(s)}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Client */}
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

          {/* Siège */}
          <FormControl fullWidth error={!!errors.seat_number}>
            <TextField
              label="Numéro de siège"
              name="seat_number"
              value={data.seat_number}
              onChange={(e) => setData("seat_number", e.target.value)}
              fullWidth
              disabled={isBusFull || busCapacity === 0}
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

          {/* Statut */}
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
          </FormControl>

          {/* Soumission */}
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={processing || isBusFull}
          >
            {ticket?.id ? "Mettre à jour" : "Créer"}
          </Button>

          {/* Alerte bus complet */}
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
      </Box>
    </GuestLayout>
  );
} 
