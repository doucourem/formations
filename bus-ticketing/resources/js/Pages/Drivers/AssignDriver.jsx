import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import { Card, CardContent, CardHeader, Typography, Button, Box, TextField, MenuItem } from "@mui/material";

export default function AssignDriver({ driver, buses = [], trips = [] }) {
  const [form, setForm] = useState({ bus_id: "", trip_id: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.bus_id && !form.trip_id) return alert("Sélectionnez un bus ou un voyage.");

    Inertia.post(`/drivers/${driver.id}/assign`, form, { preserveScroll: true });
  };

  return (
    <GuestLayout>
      <Card sx={{ maxWidth: 500, mx: "auto", mt: 4, borderRadius: 3, p: 2 }}>
        <CardHeader
          title={<Typography variant="h5">Affecter {driver.first_name} à un bus ou voyage</Typography>}
        />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Bus"
              value={form.bus_id}
              onChange={(e) => setForm({ ...form, bus_id: e.target.value })}
              variant="outlined"
              fullWidth
            >
              <MenuItem value="">-- Sélectionner un bus --</MenuItem>
              {buses.map(bus => (
                <MenuItem key={bus.id} value={bus.id}>{bus.registration_number}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Voyage"
              value={form.trip_id}
              onChange={(e) => setForm({ ...form, trip_id: e.target.value })}
              variant="outlined"
              fullWidth
            >
              <MenuItem value="">-- Sélectionner un voyage --</MenuItem>
              {trips.map(trip => (
                <MenuItem key={trip.id} value={trip.id}>
                  {trip.route.departureCity.name} → {trip.route.arrivalCity.name} ({new Date(trip.departure_at).toLocaleString()})
                </MenuItem>
              ))}
            </TextField>

            <Button type="submit" variant="contained" color="primary">
              Affecter
            </Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
