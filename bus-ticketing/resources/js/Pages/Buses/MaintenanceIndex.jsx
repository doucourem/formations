import React from "react";
import { Box, Card, CardHeader, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";
import MaintenanceForm from "./MaintenanceForm";

export default function MaintenanceIndex({ bus, maintenances }) {
  return (
    <GuestLayout>

      <Card elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <CardHeader
          title={
            <Typography variant="h5">
              🧑‍🔧 Historique d’entretien – Bus {bus.number_plate}
            </Typography>
          }
        />

        <Box mt={2}>
          <Typography variant="body1">
            <strong>Modèle :</strong> {bus.model || "—"}
          </Typography>

          <Typography variant="body1">
            <strong>Kilométrage actuel :</strong> {bus.current_km?.toLocaleString()} km
          </Typography>

          <Typography variant="body1" color="error">
            <strong>Prochaine maintenance prévue à :</strong>{" "}
            {bus.next_maintenance_km?.toLocaleString()} km
          </Typography>
        </Box>
      </Card>

      {/* ========= FORMULAIRE =========== */}
      <Card elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          ➕ Ajouter une maintenance
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <MaintenanceForm bus={bus} />
      </Card>

      {/* ========= LISTE DES ENTRETIENS =========== */}
      <Card elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          📋 Liste des entretiens effectués
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {maintenances.length === 0 ? (
          <Typography>Aucune maintenance enregistrée pour ce bus.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#1565c0" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Type</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Kilométrage</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Coût (FCFA)</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Notes</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {maintenances.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.maintenance_date}</TableCell>
                    <TableCell>{m.type}</TableCell>
                    <TableCell>{m.mileage?.toLocaleString() || "—"}</TableCell>
                    <TableCell>{m.cost?.toLocaleString()} FCFA</TableCell>
                    <TableCell>{m.notes || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

    </GuestLayout>
  );
}
