import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link } from "@inertiajs/react";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import GuestLayout from "@/Layouts/GuestLayout";

export default function EditTrip({ trip, routes, buses }) {
  const [form, setForm] = useState({
    route_id: trip.route_id || "",
    bus_id: trip.bus_id || "",
    departure_at: trip.departure_at ? trip.departure_at.slice(0, 16) : "",
    arrival_at: trip.arrival_at ? trip.arrival_at.slice(0, 16) : "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    Inertia.put(route("trips.update", trip.id), form, {
      onError: (err) => {
        setErrors(err);
        setLoading(false);
      },
      onSuccess: () => setLoading(false),
    });
  };

  return (
    <GuestLayout>
      <Box sx={{ maxWidth: 650, mx: "auto", mt: 4 }}>
        <Card elevation={4} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <DirectionsBusIcon color="primary" />
                <Typography variant="h5">
                  Modifier le voyage #{trip.id}
                </Typography>
              </Stack>
            }
            action={
              <Button
                component={Link}
                href={route("trips.index")}
                startIcon={<ArrowBackIcon />}
                variant="outlined"
              >
                Retour
              </Button>
            }
          />
          <Divider />
          <CardContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              {/* Sélection de la route */}
              <FormControl fullWidth required>
                <InputLabel id="route-label">Route</InputLabel>
                <Select
                  labelId="route-label"
                  name="route_id"
                  value={form.route_id}
                  onChange={handleChange}
                  error={!!errors.route_id}
                  label="Route"
                >
                  {routes.length > 0 ? (
                    routes.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.departureCity || "-"} → {r.arrivalCity || "-"}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Aucune route disponible</MenuItem>
                  )}
                </Select>
                {errors.route_id && (
                  <Typography variant="caption" color="error">
                    {errors.route_id}
                  </Typography>
                )}
              </FormControl>

              {/* Sélection du bus */}
              <FormControl fullWidth required>
                <InputLabel id="bus-label">Bus</InputLabel>
                <Select
                  labelId="bus-label"
                  name="bus_id"
                  value={form.bus_id}
                  onChange={handleChange}
                  error={!!errors.bus_id}
                  label="Bus"
                >
                  {buses.length > 0 ? (
                    buses.map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.name || b.registration_number || `Bus #${b.id}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Aucun bus disponible</MenuItem>
                  )}
                </Select>
                {errors.bus_id && (
                  <Typography variant="caption" color="error">
                    {errors.bus_id}
                  </Typography>
                )}
              </FormControl>

              {/* Date de départ */}
              <TextField
                label="Heure de départ"
                name="departure_at"
                type="datetime-local"
                value={form.departure_at}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.departure_at}
                helperText={errors.departure_at}
                required
              />

              {/* Date d'arrivée */}
              <TextField
                label="Heure d’arrivée"
                name="arrival_at"
                type="datetime-local"
                value={form.arrival_at}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.arrival_at}
                helperText={errors.arrival_at}
                required
              />

              {/* Bouton de soumission */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Mettre à jour le trajet"
                  )}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
