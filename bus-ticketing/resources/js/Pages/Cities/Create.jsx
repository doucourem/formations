import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { Link } from "@inertiajs/inertia-react";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Stack,
} from "@mui/material";

export default function Create() {
  const [form, setForm] = useState({
    name: "",
    code: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name) {
      alert("Le nom de la ville est obligatoire");
      return;
    }

    Inertia.post(route("cities.store"), form);
  };

  return (
    <GuestLayout>
      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 4,
            p: 3,
            boxShadow: 2,
            borderRadius: 2,
            bgcolor: "white",
          }}
        >
          <Typography variant="h5" gutterBottom>
            Créer une nouvelle ville
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Nom de la ville"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />

            <TextField
              label="Code"
              name="code"
              value={form.code}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Enregistrer
              </Button>

              <Button
                component={Link}
                href={route("cities.index")}
                variant="outlined"
                color="secondary"
              >
                Annuler
              </Button>
            </Stack>
          </form>
        </Box>
      </Container>
    </GuestLayout>
  );
}
