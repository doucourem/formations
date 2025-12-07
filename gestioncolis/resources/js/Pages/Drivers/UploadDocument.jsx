import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import { Card, CardContent, CardHeader, Typography, Button, Box } from "@mui/material";

export default function UploadDocument({ driver }) {
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return alert("Veuillez sélectionner un document.");

    const formData = new FormData();
    formData.append("document", file);

    Inertia.post(`/drivers/${driver.id}/documents`, formData, {
      preserveScroll: true,
      onSuccess: () => setFile(null),
    });
  };

  return (
    <GuestLayout>
      <Card sx={{ maxWidth: 500, mx: "auto", mt: 4, borderRadius: 3, p: 2 }}>
        <CardHeader
          title={<Typography variant="h5">Ajouter un document pour {driver.first_name}</Typography>}
        />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
            <Button type="submit" variant="contained" color="primary">
              Upload
            </Button>
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
