import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function DriverDetails({ driver, buses = [], trips = [] }) {
  const [documentFile, setDocumentFile] = useState(null);
  const [assignment, setAssignment] = useState({ bus_id: "", trip_id: "" });

  // Upload document
  const handleUploadDocument = (e) => {
    e.preventDefault();
    if (!documentFile) return alert("Sélectionnez un document");

    const formData = new FormData();
    formData.append("file", documentFile);

    Inertia.post(`/drivers/${driver.id}/documents`, formData, {
      preserveScroll: true,
      onSuccess: () => setDocumentFile(null),
    });
  };

  // Assign bus/trip
  const handleAssign = (e) => {
    e.preventDefault();
    if (!assignment.bus_id && !assignment.trip_id)
      return alert("Sélectionnez un bus ou voyage");

    Inertia.post(`/drivers/${driver.id}/assign`, assignment, {
      preserveScroll: true,
      onSuccess: () => setAssignment({ bus_id: "", trip_id: "" }),
    });
  };

  // Delete document
  const handleDeleteDocument = (id) => {
    if (confirm("Supprimer ce document ?")) {
      Inertia.delete(`/drivers/${driver.id}/documents/${id}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <GuestLayout>
      {/* Chauffeur info */}
      <Card sx={{ maxWidth: 700, mx: "auto", mt: 4, borderRadius: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Informations du Chauffeur</Typography>}
        />
        <CardContent>
          <Typography>
            <strong>Nom :</strong> {driver.first_name} {driver.last_name}
          </Typography>
          <Typography>
            <strong>Téléphone :</strong> {driver.phone ?? "-"}
          </Typography>
          <Typography>
            <strong>Email :</strong> {driver.email ?? "-"}
          </Typography>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card sx={{ maxWidth: 700, mx: "auto", mt: 3, borderRadius: 3 }}>
        <CardHeader title={<Typography variant="h6">Documents</Typography>} />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleUploadDocument}
            display="flex"
            gap={2}
            alignItems="center"
          >
            <input
              type="file"
              onChange={(e) => setDocumentFile(e.target.files[0])}
            />
            <Button type="submit" variant="contained">
              Ajouter Document
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom du document</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {driver.documents?.length > 0 ? (
                  driver.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.type ?? "-"}</TableCell>
                      <TableCell>
                        {doc.created_at
                          ? new Date(doc.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Aucun document
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card sx={{ maxWidth: 700, mx: "auto", mt: 3, mb: 4, borderRadius: 3 }}>
        <CardHeader title={<Typography variant="h6">Affectations</Typography>} />
        <CardContent>
          <Box
            component="form"
            onSubmit={handleAssign}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <TextField
              select
              label="Bus"
              value={assignment.bus_id}
              onChange={(e) =>
                setAssignment({ ...assignment, bus_id: e.target.value })
              }
              variant="outlined"
              fullWidth
            >
              <MenuItem value="">-- Sélectionner un bus --</MenuItem>
              {buses.map((bus) => (
                <MenuItem key={bus.id} value={bus.id}>
                  {bus.registration_number ?? "-"}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Voyage"
              value={assignment.trip_id}
              onChange={(e) =>
                setAssignment({ ...assignment, trip_id: e.target.value })
              }
              variant="outlined"
              fullWidth
            >
              <MenuItem value="">-- Sélectionner un voyage --</MenuItem>
              {trips.map((trip) => {
                const dep = trip.route?.departure_city ?? "-";
                const arr = trip.route?.arrival_city ?? "-";
                const depTime = trip.departure_at
                  ? new Date(trip.departure_at).toLocaleString()
                  : "-";
                return (
                  <MenuItem key={trip.id} value={trip.id}>
                    {dep} → {arr} ({depTime})
                  </MenuItem>
                );
              })}
            </TextField>

            <Button type="submit" variant="contained">
              Affecter
            </Button>
          </Box>

          {/* Liste des affectations */}
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Détails</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {driver.assignments?.length > 0 ? (
                  driver.assignments.map((a) => {
                    if (a.type === "bus") {
                      return (
                        <TableRow key={a.id}>
                          <TableCell>Bus</TableCell>
                          <TableCell>{a.bus?.registration_number ?? "-"}</TableCell>
                        </TableRow>
                      );
                    } else if (a.type === "trip") {
                      const dep = a.trip?.route?.departure_city ?? "-";
                      const arr = a.trip?.route?.arrival_city ?? "-";
                      return (
                        <TableRow key={a.id}>
                          <TableCell>Voyage</TableCell>
                          <TableCell>
                            {dep} → {arr}
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      Aucune affectation
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
