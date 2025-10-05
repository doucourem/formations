import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Edit({ agency, cities }) {
  const [form, setForm] = useState({
    name: agency?.name || "",
    city_id: agency?.city_id || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.put(route("agencies.update", agency.id), form);
  };

  return (
    <GuestLayout>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: "white" }}>
          <Typography variant="h5" gutterBottom>
            Modifier l'agence #{agency.id}
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nom de l'agence"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Ville</InputLabel>
              <Select
                name="city_id"
                value={form.city_id}
                onChange={handleChange}
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Mettre à jour
            </Button>
          </form>
        </Box>
      </Container>
    </GuestLayout>
  );
}
