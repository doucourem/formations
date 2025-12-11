import { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Box, TextField, Button, Stack, MenuItem, Typography } from "@mui/material";

export default function MaintenanceForm({ bus, garages = [] }) {
  const [form, setForm] = useState({
    bus_id: bus.id,
    maintenance_date: "",
    type: "",
    mileage: "",
    cost: "",
    labour_cost: "",
    parts: "",
    duration_hours: "",
    garage_id: "",
    photo_before: null,
    photo_after: null,
    notes: "",
  });

const submit = (e) => {
  e.preventDefault();
  const formData = new FormData();
  for (const key in form) {
    formData.append(key, form[key]);
  }
  Inertia.post(route("bus.maintenance.store"), formData, {
    onSuccess: () => closeDialog && closeDialog(),
  });
};


  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h6">Ajouter une maintenance</Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        {/* Date */}
        <TextField
          fullWidth
          type="date"
          label="Date"
          InputLabelProps={{ shrink: true }}
          value={form.maintenance_date}
          onChange={(e) => setForm({ ...form, maintenance_date: e.target.value })}
        />

        {/* Type */}
        <TextField
          select
          fullWidth
          label="Type de maintenance"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <MenuItem value="vidange">Vidange</MenuItem>
          <MenuItem value="pneus">Changement pneus</MenuItem>
          <MenuItem value="freins">Freins</MenuItem>
          <MenuItem value="moteur">Moteur</MenuItem>
          <MenuItem value="autre">Autre</MenuItem>
        </TextField>

        {/* Kilométrage */}
        <TextField
          type="number"
          fullWidth
          label="Kilométrage"
          value={form.mileage}
          onChange={(e) => setForm({ ...form, mileage: e.target.value })}
        />

        {/* Coût total */}
        <TextField
          type="number"
          fullWidth
          label="Coût total (FCFA)"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
        />

        {/* Main d’œuvre */}
        <TextField
          type="number"
          fullWidth
          label="Coût main d’œuvre (FCFA)"
          value={form.labour_cost}
          onChange={(e) => setForm({ ...form, labour_cost: e.target.value })}
        />

        {/* Pièces changées */}
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Pièces changées"
          value={form.parts}
          onChange={(e) => setForm({ ...form, parts: e.target.value })}
        />

        {/* Durée en heures */}
        <TextField
          type="number"
          fullWidth
          label="Durée maintenance (heures)"
          value={form.duration_hours}
          onChange={(e) => setForm({ ...form, duration_hours: e.target.value })}
        />

        {/* Garage */}
        <TextField
          select
          label="Garage"
          fullWidth
          value={form.garage_id}
          onChange={(e) => setForm({ ...form, garage_id: e.target.value })}
        >
          {garages.map((garage) => (
            <MenuItem key={garage.id} value={garage.id}>
              {garage.name} {garage.address ? `- ${garage.address}` : ""}
            </MenuItem>
          ))}
        </TextField>

        {/* Photos */}
        <TextField
          type="file"
          fullWidth
          label="Photo avant"
          InputLabelProps={{ shrink: true }}
          onChange={(e) => setForm({ ...form, photo_before: e.target.files[0] })}
        />
        <TextField
          type="file"
          fullWidth
          label="Photo après"
          InputLabelProps={{ shrink: true }}
          onChange={(e) => setForm({ ...form, photo_after: e.target.files[0] })}
        />

        {/* Notes */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        <Button variant="contained" type="submit">
          Ajouter
        </Button>
      </Stack>
    </Box>
  );
}
