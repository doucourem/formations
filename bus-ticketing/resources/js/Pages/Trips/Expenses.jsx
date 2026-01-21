import React from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer, Button } from "@mui/material";
import { Link } from "@inertiajs/react";

export default function TripExpenses({ trip, expenses }) {
  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          💰 Dépenses du trajet #{trip.id}
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Montant (FCFA)</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{{
                      chauffeur: "Chauffeur",
                      fuel: "Carburant",
                      toll: "Péage",
                      meal: "Restauration",
                      maintenance: "Entretien",
                      other: "Autre",
                    }[exp.type] || exp.type}</TableCell>
                    <TableCell>{exp.amount.toLocaleString("fr-FR")}</TableCell>
                    <TableCell>{exp.description || "-"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">Aucune dépense</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2}>
          <Button variant="contained" component={Link} href={route("trips.index")}>
            🔙 Retour aux trajets
          </Button>
        </Box>
      </Box>
    </GuestLayout>
  );
}
