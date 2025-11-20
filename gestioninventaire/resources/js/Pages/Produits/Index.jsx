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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

export default function ProduitsIndex({ produits, filters }) {
  const [sortField, setSortField] = useState(filters?.sort_field || "id");
  const [sortDirection, setSortDirection] = useState(filters?.sort_direction || "asc");

  const handleSort = (field) => {
    let direction = "asc";
    if (sortField === field) {
      direction = sortDirection === "asc" ? "desc" : "asc";
    }

    setSortField(field);
    setSortDirection(direction);

    Inertia.get(
      route("produits.index"),
      {
        per_page: filters.per_page,
        sort_field: field,
        sort_direction: direction,
      },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      Inertia.delete(route("produits.destroy", id));
    }
  };

  const handlePage = (page) => {
    Inertia.get(
      route("produits.index"),
      { per_page: filters.per_page, page },
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Produits</Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => Inertia.visit(route("produits.create"))}
          >
            Ajouter un produit
          </Button>
        </Stack>

        {/* Tableau Produits */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ cursor: "pointer", color: "#fff" }} onClick={() => handleSort("id")}>
                  ID {renderSortIcon("id")}
                </TableCell>

                <TableCell sx={{ cursor: "pointer", color: "#fff" }} onClick={() => handleSort("name")}>
                  Nom {renderSortIcon("name")}
                </TableCell>

                <TableCell align="center" sx={{ color: "#fff" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {produits.data?.length > 0 ? (
                produits.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.name}</TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => Inertia.visit(route("produits.edit", p.id))}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton color="error" size="small" onClick={() => handleDelete(p.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Aucun produit trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box mt={3} display="flex" justifyContent="center">
          <Pagination
            count={produits.last_page || 1}
            page={produits.current_page || 1}
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
