import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
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
  CardHeader,
  CardContent,
  Stack,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Create({ agencies = [] }) {
  const [form, setForm] = useState({
    vehicle_type: "bus",

    registration_number: "",
    model: "",
    status: "active",
    agency_id: "",

    // 🚌 Bus
    capacity: "",

    // 🚚 Camion
    max_load: "",

    // 🛢️ Citerne
    tank_capacity: "",
    product_type: "",
    compartments: 1,
    tank_material: "",
    pump_type: "",
    adr_certified: false,
    fire_extinguisher: false,
    last_inspection_date: "",
    next_inspection_date: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let validationErrors = {};

    if (!form.registration_number)
      validationErrors.registration_number = "Immatriculation obligatoire";
    if (!form.model) validationErrors.model = "Modèle obligatoire";
    if (!form.agency_id) validationErrors.agency_id = "Agence obligatoire";

    if (form.vehicle_type === "bus" && !form.capacity)
      validationErrors.capacity = "Nombre de places requis";

    if (form.vehicle_type === "truck" && !form.max_load)
      validationErrors.max_load = "Charge maximale requise";

    if (form.vehicle_type === "tanker") {
      if (!form.tank_capacity)
        validationErrors.tank_capacity = "Capacité citerne requise";
      if (!form.product_type)
        validationErrors.product_type = "Produit requis";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    Inertia.post(route("buses.store"), form, {
      onFinish: () => setLoading(false),
    });
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                {form.vehicle_type === "bus" && <DirectionsBusIcon />}
                {form.vehicle_type !== "bus" && <LocalShippingIcon />}
                <Typography variant="h5">
                  Création d’un véhicule
                </Typography>
              </Stack>
            }
            action={
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
              >
                Nouveau
              </Button>
            }
          />
          <CardContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {/* Type */}
              <FormControl fullWidth required>
                <InputLabel>Type de véhicule</InputLabel>
                <Select
                  name="vehicle_type"
                  value={form.vehicle_type}
                  onChange={handleChange}
                >
                  <MenuItem value="bus">Bus</MenuItem>
                  <MenuItem value="truck">Camion</MenuItem>
                  <MenuItem value="tanker">Camion citerne</MenuItem>
                </Select>
              </FormControl>

              {/* Commun */}
              <TextField
                label="Immatriculation"
                name="registration_number"
                value={form.registration_number}
                onChange={handleChange}
                error={!!errors.registration_number}
                helperText={errors.registration_number}
                required
              />

              <TextField
                label="Modèle"
                name="model"
                value={form.model}
                onChange={handleChange}
                error={!!errors.model}
                helperText={errors.model}
                required
              />

              {/* Bus */}
              {form.vehicle_type === "bus" && (
                <TextField
                  label="Nombre de places"
                  name="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={handleChange}
                  error={!!errors.capacity}
                  helperText={errors.capacity}
                  required
                />
              )}

              {/* Camion */}
              {form.vehicle_type === "truck" && (
                <TextField
                  label="Charge maximale (Tonnes)"
                  name="max_load"
                  type="number"
                  value={form.max_load}
                  onChange={handleChange}
                  error={!!errors.max_load}
                  helperText={errors.max_load}
                  required
                />
              )}

              {/* Citerne */}
              {form.vehicle_type === "tanker" && (
                <>
                  <TextField
                    label="Capacité citerne (Litres)"
                    name="tank_capacity"
                    type="number"
                    value={form.tank_capacity}
                    onChange={handleChange}
                    error={!!errors.tank_capacity}
                    helperText={errors.tank_capacity}
                    required
                  />

                  <FormControl fullWidth required error={!!errors.product_type}>
                    <InputLabel>Produit transporté</InputLabel>
                    <Select
                      name="product_type"
                      value={form.product_type}
                      onChange={handleChange}
                    >
                      <MenuItem value="fuel">Carburant</MenuItem>
                      <MenuItem value="water">Eau</MenuItem>
                      <MenuItem value="oil">Huile</MenuItem>
                      <MenuItem value="gas">Gaz</MenuItem>
                      <MenuItem value="chemical">Chimique</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Compartiments"
                    name="compartments"
                    type="number"
                    min={1}
                    value={form.compartments}
                    onChange={handleChange}
                  />

                  <TextField
                    label="Matière citerne"
                    name="tank_material"
                    value={form.tank_material}
                    onChange={handleChange}
                  />

                  <FormControl fullWidth>
                    <InputLabel>Type de pompe</InputLabel>
                    <Select
                      name="pump_type"
                      value={form.pump_type}
                      onChange={handleChange}
                    >
                      <MenuItem value="manual">Manuelle</MenuItem>
                      <MenuItem value="electric">Électrique</MenuItem>
                      <MenuItem value="hydraulic">Hydraulique</MenuItem>
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.adr_certified}
                          onChange={(e) =>
                            setForm({ ...form, adr_certified: e.target.checked })
                          }
                        />
                      }
                      label="Certifié ADR"
                    />

                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.fire_extinguisher}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              fire_extinguisher: e.target.checked,
                            })
                          }
                        />
                      }
                      label="Extincteur"
                    />
                  </Stack>

                  <TextField
                    label="Dernière inspection"
                    type="date"
                    name="last_inspection_date"
                    InputLabelProps={{ shrink: true }}
                    value={form.last_inspection_date}
                    onChange={handleChange}
                  />

                  <TextField
                    label="Prochaine inspection"
                    type="date"
                    name="next_inspection_date"
                    InputLabelProps={{ shrink: true }}
                    value={form.next_inspection_date}
                    onChange={handleChange}
                  />
                </>
              )}

              {/* Statut */}
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>

              {/* Agence */}
              <FormControl fullWidth required error={!!errors.agency_id}>
                <InputLabel>Agence</InputLabel>
                <Select
                  name="agency_id"
                  value={form.agency_id}
                  onChange={handleChange}
                >
                  {agencies.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Enregistrer le véhicule"
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
