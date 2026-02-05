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
  Stack,
  IconButton,
  Button,
  Tooltip,
  TextField,
  Pagination,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import { indigo, grey } from "@mui/material/colors";

export default function CitiesIndex({ cities, filters }) {
  const [sortField, setSortField] = useState(filters?.sort_field || "id");
  const [sortDirection, setSortDirection] = useState(filters?.sort_direction || "asc");
  const [search, setSearch] = useState(filters?.search || "");

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    Inertia.get(
      route("cities.index"),
      {
        page: cities.current_page,
        per_page: filters.per_page,
        sort_field: field,
        sort_direction: direction,
        search,
      },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette ville ?")) {
      Inertia.delete(route("cities.destroy", id), { preserveState: true });
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    Inertia.get(
      route("cities.index"),
      {
        page: 1,
        per_page: filters.per_page,
        sort_field: sortField,
        sort_direction: sortDirection,
        search: value,
      },
      { preserveState: true }
    );
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUpwardIcon fontSize="small" />
    ) : (
      <ArrowDownwardIcon fontSize="small" />
    );
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" color={indigo[900]} mb={2}>
          Gestion des villes
        </Typography>
        <Typography variant="body2" color={grey[700]} mb={3}>
          Liste et administration des villes
        </Typography>

        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={<Typography variant="h6">Villes</Typography>}
            action={
              <Button
                variant="contained"
                color="primary"
                onClick={() => Inertia.visit(route("cities.create"))}
              >
                Ajouter une ville
              </Button>
            }
            sx={{ bgcolor: indigo[50] }}
          />

          <CardContent>
            {/* Recherche */}
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: "#F4F7FA",
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <TextField
                label="Rechercher une ville"
                size="small"
                fullWidth
                value={search}
                onChange={handleSearchChange}
              />
            </Box>

            {/* Tableau */}
            <TableContainer component={Paper} sx={{ border: "1px solid #EEE" }}>
              <Table>
                <TableHead sx={{ bgcolor: indigo[900] }}>
                  <TableRow>
                    <TableCell
                      sx={{ cursor: "pointer", color: "#fff", fontWeight: "bold" }}
                      onClick={() => handleSort("id")}
                    >
                      ID {renderSortIcon("id")}
                    </TableCell>
                    <TableCell
                      sx={{ cursor: "pointer", color: "#fff", fontWeight: "bold" }}
                      onClick={() => handleSort("name")}
                    >
                      Nom {renderSortIcon("name")}
                    </TableCell>
                    <TableCell
                      sx={{ cursor: "pointer", color: "#fff", fontWeight: "bold" }}
                      onClick={() => handleSort("code")}
                    >
                      Code {renderSortIcon("code")}
                    </TableCell>
                    <TableCell align="center" sx={{ color: "#fff", fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {cities.data?.length > 0 ? (
                    cities.data.map((city) => (
                      <TableRow key={city.id} hover>
                        <TableCell>{city.id}</TableCell>
                        <TableCell>{city.name}</TableCell>
                        <TableCell>{city.code ?? "-"}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="Éditer">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => Inertia.visit(route("cities.edit", city.id))}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(city.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        Aucune ville trouvée.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box mt={3} display="flex" justifyContent="center">
              <Pagination
                count={cities.last_page || 1}
                page={cities.current_page || 1}
                onChange={(e, page) =>
                  Inertia.get(
                    route("cities.index"),
                    {
                      page,
                      per_page: filters.per_page,
                      sort_field: sortField,
                      sort_direction: sortDirection,
                      search,
                    },
                    { preserveState: true }
                  )
                }
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
