import React from "react";
import { Link } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export default function IndexByTrip({ trip, parcels }) {
  return (
    <GuestLayout>
      <Box p={3}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                <LocalShippingIcon color="primary" />
                <Typography variant="h6">
                  Colis du trajet #{trip.id} — {trip.route?.departureCity || "-"} → {trip.route?.arrivalCity || "-"}
                </Typography>
              </Stack>
            }
          />

          <CardContent>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ bgcolor: "#1565c0" }}>
                  <TableRow>
                    {["ID", "Expéditeur", "Destinataire", "Montant", "Statut"].map((col) => (
                      <TableCell key={col} sx={{ color: "white", fontWeight: "bold" }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {parcels.data.length > 0 ? (
                    parcels.data.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{p.id}</TableCell>
                        <TableCell>{p.sender_name}</TableCell>
                        <TableCell>{p.receiver_name}</TableCell>
                        <TableCell>{p.price.toLocaleString()} FCFA</TableCell>
                        <TableCell>{p.status}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography>Aucun colis trouvé</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
