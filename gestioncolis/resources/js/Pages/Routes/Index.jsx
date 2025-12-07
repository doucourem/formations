import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  IconButton,
  Pagination,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function RoutesIndex({ initialRoutes, initialFilters }) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [perPage, setPerPage] = useState(initialFilters?.per_page || 20);

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette route ?")) {
      Inertia.delete(route("busroutes.destroy", id), { preserveState: true });
    }
  };

  const handlePage = (page) => {
    Inertia.get(route("busroutes.index"), { per_page: perPage, page }, {
      preserveState: true,
      onSuccess: (pageData) => setRoutes(pageData.props.routes),
    });
  };

  const filtrer = () => {
    Inertia.get(route("busroutes.index"), { per_page: perPage }, {
      preserveState: true,
      onSuccess: (pageData) => setRoutes(pageData.props.routes),
    });
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Routes</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => Inertia.visit(route("busroutes.create"))}
          >
            Ajouter une route
          </Button>
        </Stack>

        {/* Filtrage */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2} alignItems="flex-end">
          <TextField
            label="Par page"
            type="number"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            size="small"
            sx={{ width: 120 }}
          />
          <Button variant="contained" color="primary" onClick={filtrer}>
            Filtrer
          </Button>
        </Stack>

        {/* Tableau */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff" }}><strong>ID</strong></TableCell>
                <TableCell sx={{ color: "#fff" }}><strong>Ville de départ</strong></TableCell>
                <TableCell sx={{ color: "#fff" }}><strong>Ville d'arrivée</strong></TableCell>
                <TableCell sx={{ color: "#fff" }}><strong>Prix (FCFA)</strong></TableCell>
                <TableCell sx={{ color: "#fff" }}><strong>Distance (km)</strong></TableCell>
                <TableCell align="center" sx={{ color: "#fff" }}><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.data?.length > 0 ? (
                routes.data.map((routeItem) => (
                  <TableRow key={routeItem.id}>
                    <TableCell>{routeItem.id}</TableCell>
                    <TableCell>{routeItem.departureCity?.name || "-"}</TableCell>
                    <TableCell>{routeItem.arrivalCity?.name || "-"}</TableCell>
                    <TableCell>{routeItem.price || "-"}</TableCell>
                    <TableCell>{routeItem.distance || "-"}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton color="primary" size="small" href={routeItem.edit_url}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" size="small" onClick={() => handleDelete(routeItem.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucune route trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box mt={3} display="flex" justifyContent="center">
          <Pagination
            count={routes.last_page || 1}
            page={routes.current_page || 1}
            onChange={(e, page) => handlePage(page)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      </Box>
    </GuestLayout>
  );
}
