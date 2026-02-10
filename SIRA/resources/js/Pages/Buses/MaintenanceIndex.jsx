import React, { useState } from "react";
import {
  Box,
  Card,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import GuestLayout from "@/Layouts/GuestLayout";
import MaintenanceForm from "./MaintenanceForm";

export default function MaintenanceIndex({ bus, maintenances, garages, maintenancePlans }) {
  const [open, setOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  const handleOpen = (maintenance = null) => {
    setSelectedMaintenance(maintenance); // null = création, sinon édition
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedMaintenance(null);
    setOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette maintenance ?")) {
      // Ici tu peux appeler ton API pour supprimer la maintenance
      console.log("Supprimer maintenance id:", id);
    }
  };

  return (
    <GuestLayout>
      {/* Card Informations bus */}
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
            <strong>Kilométrage actuel :</strong>{" "}
            {bus.last_maintenance_km?.toLocaleString() || "—"} km
          </Typography>
          <Typography variant="body1" color="error">
            <strong>Prochaine maintenance prévue à :</strong>{" "}
            {bus.next_maintenance_km?.toLocaleString() || "—"} km
          </Typography>
        </Box>
      </Card>

      {/* Bouton Ajouter */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        sx={{ mb: 3 }}
      >
        ➕ Ajouter une maintenance
      </Button>

      {/* Dialog / Pop-up */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedMaintenance
            ? "✏️ Modifier la maintenance"
            : "➕ Ajouter une maintenance"}
        </DialogTitle>
        <DialogContent>
          <Divider sx={{ mb: 2 }} />
          <MaintenanceForm
            bus={bus}
            garages={garages}
            maintenancePlans={maintenancePlans}
            maintenance={selectedMaintenance}
            closeDialog={handleClose}
          />
        </DialogContent>
      </Dialog>

      {/* Liste des entretiens */}
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
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Plan</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Kilométrage</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Coût (FCFA)</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Notes</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maintenances.map((m) => {
                  const formattedDate = new Date(m.maintenance_date).toLocaleDateString(
                    "fr-FR",
                    { day: "2-digit", month: "2-digit", year: "numeric" }
                  );
                  const planName = m.maintenance_plan?.name || m.type || "—";

                  return (
                    <TableRow key={m.id}>
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>{planName}</TableCell>
                      <TableCell>{m.mileage?.toLocaleString() || "—"}</TableCell>
                      <TableCell>{m.cost?.toLocaleString() || "0"} FCFA</TableCell>
                      <TableCell>{m.notes || "—"}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpen(m)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(m.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </GuestLayout>
  );
}
