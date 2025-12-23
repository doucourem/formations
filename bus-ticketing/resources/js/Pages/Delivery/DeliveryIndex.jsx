import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
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
  Paper,
  Typography,
  Button,
  IconButton,
  TextField,
  Stack,
  Pagination,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function DeliveryIndex({ deliveries }) {
  const [page, setPage] = useState(deliveries.current_page || 1);

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette livraison ?")) {
      Inertia.delete(route("deliveries.destroy", id));
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    Inertia.get(route("deliveries.index", { page: value }), {}, { preserveState: true });
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Liste des livraisons 🚛</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => Inertia.get(route("deliveries.create"))}
            >
              Ajouter
            </Button>
          }
        />
        <CardContent>
          <Box mb={2}>
            <TextField
              label="Rechercher..."
              variant="outlined"
              size="small"
              fullWidth
              onChange={(e) =>
                Inertia.get(route("deliveries.index"), { search: e.target.value }, { preserveState: true })
              }
            />
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "ID",
                    "Véhicule",
                    "Chauffeur",
                    "Produit",
                    "Lot",
                    "Quantité",
                    "Distance (km)",
                    "Prix (CFA)",
                    "Départ",
                    "Arrivée",
                    "Statut",
                    "Actions",
                  ].map((col) => (
                    <TableCell key={col} sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.data.length > 0 ? (
                  deliveries.data.map((d) => (
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
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton color="primary" onClick={() => Inertia.get(route("deliveries.show", d.id))}>
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton color="warning" onClick={() => Inertia.get(route("deliveries.edit", d.id))}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(d.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} align="center">
                      Aucune livraison enregistrée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {deliveries.last_page > 1 && (
            <Box mt={2} display="flex" justifyContent="center">
              <Pagination
                count={deliveries.last_page}
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

