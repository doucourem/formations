import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";

export default function BoutiqueForm({ boutique }) {
  const [name, setName] = useState(boutique?.name || "");
  const [adresse, setAdresse] = useState(boutique?.adresse || "");
  const [telephone, setTelephone] = useState(boutique?.telephone || "");
  const [email, setEmail] = useState(boutique?.email || "");
  const [description, setDescription] = useState(boutique?.description || "");

  const isEdit = Boolean(boutique?.id);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      name,
      adresse,
      telephone,
      email,
      description,
    };

    if (isEdit) {
      Inertia.put(route("boutiques.update", boutique.id), payload);
    } else {
      Inertia.post(route("boutiques.store"), payload);
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={isEdit ? "Modifier la boutique" : "Créer une boutique"}
            sx={{ bgcolor: "#f5f5f5", textAlign: "center" }}
          />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Nom de la boutique"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  fullWidth
                />

                <TextField
                  label="Adresse"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Téléphone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                />

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => Inertia.visit(route("boutiques.index"))}
                  >
                    Annuler
                  </Button>

                  <Button type="submit" variant="contained" color="primary">
                    {isEdit ? "Mettre à jour" : "Créer"}
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
