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

  /** -------------------------------------------
   * UPLOAD DOCUMENT
   * ------------------------------------------- */
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

  /** -------------------------------------------
   * ASSIGN BUS / TRIP
   * ------------------------------------------- */
  const handleAssign = (e) => {
    e.preventDefault();
    if (!assignment.bus_id && !assignment.trip_id)
      return alert("Sélectionnez un bus ou un voyage");

    Inertia.post(`/drivers/${driver.id}/assign`, assignment, {
      preserveScroll: true,
      onSuccess: () => setAssignment({ bus_id: "", trip_id: "" }),
    });
  };

  /** -------------------------------------------
   * DELETE DOCUMENT
   * ------------------------------------------- */
  const handleDeleteDocument = (id) => {
    if (confirm("Supprimer ce document ?")) {
      Inertia.delete(`/drivers/${driver.id}/documents/${id}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <GuestLayout>
      {/* ------------------- INFOS DU CHAUFFEUR ------------------- */}
      <Card sx={{ maxWidth: 700, mx: "auto", mt: 4, borderRadius: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Informations du Chauffeur</Typography>}
        />
        <CardContent>
          <Typography>
            <strong>Nom :</strong> {driver.first_name} {driver.last_name}
          </Typography>
          <Typography>
            <strong>Téléphone :</strong> {driver.phone}
          </Typography>
          <Typography>
            <strong>Adresse :</strong> {driver.address}
          </Typography>
        </CardContent>
      </Card>

      {/* ----------------------- DOCUMENTS ------------------------- */}
      <Card sx={{ maxWidth: 700, mx: "auto", mt: 3, borderRadius: 3 }}>
        <CardHeader title={<Typography variant="h6">Documents</Typography>} />
        <CardContent>
          <form onSubmit={handleUploadDocument}>
            <Box display="flex" gap={2}>
              <TextField
                type="file"
                onChange={(e) => setDocumentFile(e.target.files[0])}
                fullWidth
              />
              <Button type="submit" variant="contained">
                Upload
              </Button>
            </Box>
          </form>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Taille</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {driver.documents?.length > 0 ? (
                  driver.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.original_name}</TableCell>
                      <TableCell>
                        {(doc.size / 1024).toFixed(1)} Ko
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
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

      {/* ----------------------- AFFECTATIONS ----------------------- */}
      <Card
        sx={{
          maxWidth: 700,
          mx: "auto",
          mt: 3,
          mb: 4,
          borderRadius: 3,
        }}
      >
        <CardHeader title={<Typography variant="h6">Affectations</Typography>} />
        <CardContent>
          {/* FORMULAIRE */}
          <Box
            component="form"
            onSubmit={handleAssign}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            {/* BUS */}
            <TextField
              select
              label="Bus"
              value={assignment.bus_id}
              onChange={(e) =>
                setAssignment({ ...assignment, bus_id: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="">-- Sélectionner un bus --</MenuItem>
              {buses.map((bus) => (
                <MenuItem key={bus.id} value={bus.id}>
                  {bus.registration_number ?? "-"}
                </MenuItem>
              ))}
            </TextField>

            {/* TRIP */}
           <TextField
  select
  label="Voyage"
  value={assignment.trip_id}
  onChange={(e) =>
    setAssignment({ ...assignment, trip_id: e.target.value })
  }
  fullWidth
>
  <MenuItem value="">-- Sélectionner un voyage --</MenuItem>

  {trips.map((trip) => {
    const dep = trip.route?.departure_city?.name ?? "-";
    const arr = trip.route?.arrival_city?.name ?? "-";
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
<TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Détails</TableCell>
                </TableRow>
              </TableHead>
          {/* LISTE AFFECTATIONS */}
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
        const dep = a.trip?.route?.departure_city?.name ?? "-";
        const arr = a.trip?.route?.arrival_city?.name ?? "-";
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
