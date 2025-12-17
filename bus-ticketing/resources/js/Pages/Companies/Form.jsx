import React from "react";
import { useForm } from "@inertiajs/react"; // <-- À ajouter
import { Box, Button, Stack, TextField, Typography, MenuItem } from "@mui/material";


export default function CompanyForm({ company = null, submitUrl, method }) {
  const { data, setData, post, put, patch, processing, errors } = useForm({
    name: company?.name || "",
    type: company?.type || "",
    address: company?.address || "",
    contact: company?.contact || "",
    logo: null,
  });

  const submit = (e) => {
    e.preventDefault();

    const formDataOptions = { forceFormData: true };

    if (method.toLowerCase() === "post") {
      post(submitUrl, formDataOptions);
    } else if (method.toLowerCase() === "put") {
      put(submitUrl, formDataOptions);
    } else if (method.toLowerCase() === "patch") {
      patch(submitUrl, formDataOptions);
    } else {
      console.error("Méthode HTTP non supportée:", method);
    }
  };

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h6" mb={2}>
        Informations compagnie
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Nom"
          value={data.name}
          onChange={(e) => setData("name", e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          required
        />

        <TextField
          select
          label="Type"
          value={data.type}
          onChange={(e) => setData("type", e.target.value)}
          error={!!errors.type}
          helperText={errors.type}
          required
        >
          <MenuItem value="passengers">Transport passagers</MenuItem>
          <MenuItem value="cargo">Cargo / Gros porteur</MenuItem>
        </TextField>

        <TextField
          label="Adresse"
          value={data.address}
          onChange={(e) => setData("address", e.target.value)}
        />

        <TextField
          label="Contact"
          value={data.contact}
          onChange={(e) => setData("contact", e.target.value)}
        />

        <Button variant="outlined" component="label">
          Logo
          <input
            type="file"
            hidden
            onChange={(e) => setData("logo", e.target.files[0])}
          />
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={processing}
        >
          Enregistrer
        </Button>
      </Stack>
    </Box>
  );
}
