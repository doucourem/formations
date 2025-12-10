import { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Box, TextField, Button, Stack, MenuItem, Typography } from "@mui/material";

export default function MaintenanceForm({ bus }) {
  const [form, setForm] = useState({
    bus_id: bus.id,
    maintenance_date: "",
    type: "",
    cost: "",
    mileage: "",
    notes: "",
  });

  const submit = (e) => {
    e.preventDefault();
    Inertia.post(route("bus.maintenance.store"), form);
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h6">Ajouter une maintenance</Typography>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          type="date"
          label="Date"
          InputLabelProps={{ shrink: true }}
          value={form.maintenance_date}
          onChange={(e) => setForm({ ...form, maintenance_date: e.target.value })}
        />

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

        <TextField
          type="number"
          fullWidth
          label="Coût (FCFA)"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
        />

        <TextField
          type="number"
          fullWidth
          label="Kilométrage"
          value={form.mileage}
          onChange={(e) => setForm({ ...form, mileage: e.target.value })}
        />

        <TextField
          fullWidth
          multiline
          rows={2}
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
