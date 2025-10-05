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

export default function Create({ cities }) {
  const [form, setForm] = useState({
    name: "",
    city_id: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route("agencies.store"), form);
  };

  return (
    <GuestLayout>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: "white" }}>
          <Typography variant="h5" gutterBottom>
            Créer une Agence
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
              Créer
            </Button>
          </form>
        </Box>
      </Container>
    </GuestLayout>
  );
}
