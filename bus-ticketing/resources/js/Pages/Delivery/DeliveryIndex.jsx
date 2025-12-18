import React from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Card, CardHeader, CardContent, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper, Typography } from "@mui/material";

export default function DeliveryIndex({ deliveries }) {
  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader title={<Typography variant="h5">Liste des livraisons 🚛</Typography>} />
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {["ID","Véhicule","Chauffeur","Produit","Lot","Quantité","Distance (km)","Prix (CFA)","Départ","Arrivée","Statut"].map(col => <TableCell key={col} sx={{fontWeight:"bold"}}>{col}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.length > 0 ? deliveries.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>{d.id}</TableCell>
                    <TableCell>{d.bus.registration_number}</TableCell>
                    <TableCell>{d.bus.name}</TableCell>
                    <TableCell>{d.product_name}</TableCell>
                    <TableCell>{d.product_lot}</TableCell>
                    <TableCell>{d.quantity_loaded}</TableCell>
                    <TableCell>{d.distance_km}</TableCell>
                    <TableCell>{d.price}</TableCell>
                    <TableCell>{new Date(d.departure_at).toLocaleString()}</TableCell>
                    <TableCell>{d.arrival_at ? new Date(d.arrival_at).toLocaleString() : "-"}</TableCell>
                    <TableCell>
                      {d.status === "pending" && "🟡 En attente"}
                      {d.status === "in_transit" && "🟠 En transit"}
                      {d.status === "delivered" && "🟢 Livré"}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={11} align="center">Aucune livraison enregistrée.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
