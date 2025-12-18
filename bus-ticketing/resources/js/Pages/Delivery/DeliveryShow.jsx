import React, { useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Box, Card, CardHeader, CardContent, Typography, TextField, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper } from "@mui/material";
import { Inertia } from "@inertiajs/inertia";

export default function DeliveryShow({ delivery }) {
  const [log, setLog] = useState({ action: "depart", quantity: "", location: "" });

  const handleChange = (e) => setLog({ ...log, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route("deliveries.addLog", delivery.id), log);
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3, mb: 3 }}>
        <CardHeader title={<Typography variant="h5">Détails de la livraison #{delivery.id}</Typography>} />
        <CardContent>
          <Typography>Produit: {delivery.product_name}</Typography>
          <Typography>Quantité chargée: {delivery.quantity_loaded}</Typography>
          <Typography>Distance: {delivery.distance_km} km</Typography>
          <Typography>Prix: {delivery.price} CFA</Typography>
          <Typography>Statut: {delivery.status}</Typography>

          <Box component="form" display="grid" gap={2} mt={3} onSubmit={handleSubmit}>
            <TextField select label="Action" name="action" value={log.action} onChange={handleChange}>
              <MenuItem value="chargement">Chargement</MenuItem>
              <MenuItem value="depart">Départ</MenuItem>
              <MenuItem value="livraison">Livraison</MenuItem>
              <MenuItem value="incident">Incident</MenuItem>
            </TextField>
            <TextField label="Quantité" name="quantity" type="number" value={log.quantity} onChange={handleChange} />
            <TextField label="Lieu" name="location" value={log.location} onChange={handleChange} />
            <Button type="submit" variant="contained" color="primary">Ajouter le log</Button>
          </Box>

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Quantité</TableCell>
                  <TableCell>Lieu</TableCell>
                  <TableCell>Horodatage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {delivery.logs.map(l => (
                  <TableRow key={l.id}>
                    <TableCell>{l.action}</TableCell>
                    <TableCell>{l.quantity}</TableCell>
                    <TableCell>{l.location}</TableCell>
                    <TableCell>{new Date(l.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
