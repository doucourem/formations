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

export default function BoutiquesIndex({ boutiques, filters }) {
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
      route("boutiques.index"),
      {
        per_page: filters.per_page,
        sort_field: field,
        sort_direction: direction,
      },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette boutique ?")) {
      Inertia.delete(route("boutiques.destroy", id));
    }
  };

  const handlePage = (page) => {
    Inertia.get(
      route("boutiques.index"),
      {
        per_page: filters.per_page,
        page,
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Boutiques</Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => Inertia.visit(route("boutiques.create"))}
          >
            Ajouter une boutique
          </Button>
        </Stack>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: "#1976d2" }}>
              <TableRow>
                <TableCell
                  sx={{ cursor: "pointer", color: "#fff" }}
                  onClick={() => handleSort("id")}
                >
                  ID {renderSortIcon("id")}
                </TableCell>

                <TableCell
                  sx={{ cursor: "pointer", color: "#fff" }}
                  onClick={() => handleSort("name")}
                >
                  Nom {renderSortIcon("name")}
                </TableCell>

                <TableCell align="center" sx={{ color: "#fff" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {boutiques.data?.length > 0 ? (
                boutiques.data.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.id}</TableCell>
                    <TableCell>{b.name}</TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => Inertia.visit(route("boutiques.edit", b.id))}
                        >
                          <EditIcon />
                        </IconButton>

                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(b.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Aucune boutique trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={3} display="flex" justifyContent="center">
          <Pagination
            count={boutiques.last_page || 1}
            page={boutiques.current_page || 1}
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
