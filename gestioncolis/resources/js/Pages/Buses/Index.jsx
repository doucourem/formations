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
  Card,
  CardHeader,
  CardContent,
  Tooltip, // ✅ Ajouté ici
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

import { indigo, grey } from "@mui/material/colors";

export default function BusesIndex({ buses, filters }) {
  const [sortField, setSortField] = useState(filters?.sort_field || "id");
  const [sortDirection, setSortDirection] = useState(filters?.sort_direction || "asc");

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    Inertia.get(
      route("buses.index"),
      { per_page: filters.per_page, sort_field: field, sort_direction: direction },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cet avion ?")) {
      Inertia.delete(route("buses.destroy", id));
    }
  };

  const handlePage = (page) => {
    Inertia.get(
      route("buses.index"),
      { per_page: filters.per_page, page, sort_field: sortField, sort_direction: sortDirection },
      { preserveState: true }
    );
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" color={indigo[900]} mb={2}>
          Gestion des avions
        </Typography>
        <Typography variant="body2" color={grey[700]} mb={3}>
          Liste et administration des avions
        </Typography>

        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={<Typography variant="h6">Avions</Typography>}
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => Inertia.visit(route("buses.create"))}
              >
                Ajouter un avion
              </Button>
            }
            sx={{ bgcolor: indigo[50] }}
          />
          <CardContent>
            <TableContainer component={Paper} sx={{ border: "1px solid #EEE" }}>
              <Table>
                <TableHead sx={{ bgcolor: indigo[900] }}>
                  <TableRow>
                    {["id", "model", "capacity", "registration_number"].map((field) => (
                      <TableCell
                        key={field}
                        sx={{ cursor: "pointer", color: "#fff", fontWeight: "bold" }}
                        onClick={() => handleSort(field)}
                      >
                        {field === "id" && "ID"}
                        {field === "model" && "Modèle"}
                        {field === "capacity" && "Capacité"}
                        {field === "registration_number" && "Immatriculation"}
                        {renderSortIcon(field)}
                      </TableCell>
                    ))}
                    <TableCell align="center" sx={{ color: "#fff", fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {buses.data && buses.data.length > 0 ? (
                    buses.data.map((bus) => (
                      <TableRow key={bus.id} hover>
                        <TableCell>{bus.id}</TableCell>
                        <TableCell>{bus.model}</TableCell>
                        <TableCell>{bus.capacity}</TableCell>
                        <TableCell>{bus.registration_number || "-"}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Voir les voyages">
                              <IconButton
                                color="secondary"
                                size="small"
                                onClick={() => Inertia.visit(route("trips.byBus", bus.id))}
                              >
                                <TravelExploreIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Éditer">
                              <IconButton
                                color="primary"
                                size="small"
                                onClick={() => Inertia.visit(route("buses.edit", bus.id))}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Supprimer">
                              <IconButton color="error" size="small" onClick={() => handleDelete(bus.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        Aucun bus trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={3} display="flex" justifyContent="center">
              <Pagination
                count={buses.last_page || 1}
                page={buses.current_page || 1}
                onChange={(e, page) => handlePage(page)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
