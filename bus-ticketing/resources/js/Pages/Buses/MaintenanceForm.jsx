import { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Box, TextField, Button, Stack, MenuItem, Typography, Divider } from "@mui/material";

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

  // Gestion unique des champs
  const handleChange = (field) => (e) => {
    const value = e.target.type === "file" ? e.target.files[0] : e.target.value;
    setForm({ ...form, [field]: value });
  };

  const submit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });
    Inertia.post(route("bus.maintenance.store"), formData, {
      onSuccess: () => closeDialog && closeDialog(),
    });
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h6" mb={2}>
        Ajouter une maintenance
      </Typography>

      <Stack spacing={3}>
        {/* Section Informations principales */}
        <Stack spacing={2}>
          <TextField
            fullWidth
            type="date"
            label="Date"
            InputLabelProps={{ shrink: true }}
            value={form.maintenance_date}
            onChange={handleChange("maintenance_date")}
          />

          <TextField
            select
            fullWidth
            label="Type de maintenance"
            value={form.type}
            onChange={handleChange("type")}
          >
            {["vidange", "pneus", "freins", "moteur", "autre"].map((t) => (
              <MenuItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="number"
            fullWidth
            label="Kilométrage"
            value={form.mileage}
            onChange={handleChange("mileage")}
          />
        </Stack>

        <Divider />

        {/* Section Coûts */}
        <Stack spacing={2}>
          <TextField
            type="number"
            fullWidth
            label="Coût total (FCFA)"
            value={form.cost}
            onChange={handleChange("cost")}
          />
          <TextField
            type="number"
            fullWidth
            label="Coût main d’œuvre (FCFA)"
            value={form.labour_cost}
            onChange={handleChange("labour_cost")}
          />
        </Stack>

        <Divider />

        {/* Pièces et durée */}
        <Stack spacing={2}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Pièces changées"
            value={form.parts}
            onChange={handleChange("parts")}
          />
          <TextField
            type="number"
            fullWidth
            label="Durée maintenance (heures)"
            value={form.duration_hours}
            onChange={handleChange("duration_hours")}
          />
        </Stack>

        <Divider />

        {/* Garage */}
        <TextField
          select
          fullWidth
          label="Garage"
          value={form.garage_id}
          onChange={handleChange("garage_id")}
        >
          {garages.map((garage) => (
            <MenuItem key={garage.id} value={garage.id}>
              {garage.name} {garage.address ? `- ${garage.address}` : ""}
            </MenuItem>
          ))}
        </TextField>

        <Divider />

        {/* Photos */}
        <Stack spacing={2}>
          <TextField
            type="file"
            fullWidth
            label="Photo avant"
            InputLabelProps={{ shrink: true }}
            onChange={handleChange("photo_before")}
          />
          <TextField
            type="file"
            fullWidth
            label="Photo après"
            InputLabelProps={{ shrink: true }}
            onChange={handleChange("photo_after")}
          />
        </Stack>

        {/* Notes */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Notes"
          value={form.notes}
          onChange={handleChange("notes")}
        />

        <Button variant="contained" type="submit">
          Ajouter
        </Button>
      </Stack>
    </Box>
  );
}
