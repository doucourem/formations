import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Stack,
  TextField,
  Pagination,
  Card,
  CardHeader,
  CardContent,
  Typography,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";

export default function VehicleRentalIndex({ rentals }) {
  const [page, setPage] = useState(rentals.current_page || 1);

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette location ?")) {
      Inertia.delete(route("vehicle-rentals.destroy", id));
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    Inertia.get(
      route("vehicle-rentals.index", { page: value }),
      {},
      { preserveState: true }
    );
  };

  const handleSearch = (event) => {
    Inertia.get(
      route("vehicle-rentals.index"),
      { search: event.target.value },
      { preserveState: true }
    );
  };

  // Ajoutez cette fonction en haut du composant
const translateStatus = (status) => {
  switch (status) {
    case "active":
      return "Active";
    case "completed":
      return "Terminée";
    case "cancelled":
      return "Annulée";
    default:
      return status;
  }
};

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
        <CardHeader
          title={<Typography variant="h5">Liste des Locations de Véhicules 🚗</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => Inertia.get(route("vehicle-rentals.create"))}
            >
              Nouvelle Location
            </Button>
          }
        />
        <CardContent>
          {/* Recherche */}
          <Box mb={2}>
            <TextField
              label="Rechercher..."
              variant="outlined"
              size="small"
              fullWidth
              onChange={handleSearch}
            />
          </Box>

          {/* Tableau */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "ID",
                    "Véhicule",
                    "Client",
                    "Début",
                    "Fin",
                    "Prix",
                    "Photos",
                    "Statut",
                    "Actions",
                  ].map((col) => (
                    <TableCell key={col} 
                    sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
  {rentals.data.length > 0 ? (
    rentals.data.map((rental) => (
      <TableRow key={rental.id}>
        <TableCell>{rental.id}</TableCell>
        <TableCell>{rental.bus?.registration_number || "-"}</TableCell>
        <TableCell>{rental.client_name}</TableCell>
        <TableCell>{new Date(rental.rental_start).toLocaleString()}</TableCell>
        <TableCell>{new Date(rental.rental_end).toLocaleString()}</TableCell>
        <TableCell>{rental.rental_price}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={1}>
            {rental.photo_before_url && <img src={rental.photo_before_url} alt="Avant" width={50} />}
            {rental.photo_after_url && <img src={rental.photo_after_url} alt="Après" width={50} />}
          </Stack>
        </TableCell>
        <TableCell>{translateStatus(rental.status)}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={1}>
            <IconButton color="primary" onClick={() => Inertia.get(route("vehicle-rentals.show", rental.id))}>
              <VisibilityIcon />
            </IconButton>
            <IconButton color="warning" onClick={() => Inertia.get(route("vehicle-rentals.edit", rental.id))}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete(rental.id)}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={9} align="center">
        Aucune location enregistrée.
      </TableCell>
    </TableRow>
  )}
</TableBody>

            </Table>
          </TableContainer>

          {/* Pagination */}
          {rentals.last_page > 1 && (
            <Box mt={2} display="flex" justifyContent="center">
              <Pagination
                count={rentals.last_page}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
