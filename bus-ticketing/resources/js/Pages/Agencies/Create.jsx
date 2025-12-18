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
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Create({ cities = [], companies = [] }) {
  const [form, setForm] = useState({
    name: "",
    company_id: "",
    city_id: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let validationErrors = {};
    if (!form.name) validationErrors.name = "Le nom de l’agence est obligatoire.";
    if (!form.company_id) validationErrors.company_id = "La compagnie est obligatoire.";
    if (!form.city_id) validationErrors.city_id = "La ville est obligatoire.";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    Inertia.post(route("agencies.store"), form, {
      onFinish: () => setLoading(false),
    });
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <BusinessIcon color="primary" />
                <Typography variant="h5">Créer une Agence</Typography>
              </Stack>
            }
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Formulaire
              </Button>
            }
          />
          <CardContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {/* Nom */}
              <TextField
                label="Nom de l’agence"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
              />

              {/* Compagnie */}
              <FormControl fullWidth required error={!!errors.company_id}>
                <InputLabel>Compagnie</InputLabel>
                <Select
                  name="company_id"
                  value={form.company_id}
                  onChange={handleChange}
                >
                  <MenuItem value="">Choisir une compagnie</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.company_id && (
                  <Typography color="error" variant="caption">
                    {errors.company_id}
                  </Typography>
                )}
              </FormControl>

              {/* Ville */}
              <FormControl fullWidth required error={!!errors.city_id}>
                <InputLabel>Ville</InputLabel>
                <Select
                  name="city_id"
                  value={form.city_id}
                  onChange={handleChange}
                >
                  <MenuItem value="">Choisir une ville</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.city_id && (
                  <Typography color="error" variant="caption">
                    {errors.city_id}
                  </Typography>
                )}
              </FormControl>

              {/* Bouton */}
              <Button
                type="submit"
                variant="contained"
                color="success"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Créer l’agence"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
