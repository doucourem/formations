import React, { useState, useMemo } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import { router } from "@inertiajs/react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Stack,
  Pagination,
  Dialog,
  DialogActions,
  DialogTitle,
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function Index({ garages }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGarage, setSelectedGarage] = useState(null);

  // Filtre
  const filteredGarages = useMemo(() => {
    return (garages || []).filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [garages, search]);

  // Pagination
  const pageCount = Math.ceil(filteredGarages.length / rowsPerPage);
  const paginatedGarages = filteredGarages.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleDeleteClick = (garage) => {
    setSelectedGarage(garage);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    Inertia.delete(route("garages.destroy", selectedGarage.id));
    setDeleteDialogOpen(false);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 2 }}>
        {/* HEADER */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Garages</Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => router.visit(route("garages.create"))}
          >
            Nouveau
          </Button>
        </Stack>

        {/* SEARCH */}
        <TextField
          size="small"
          fullWidth
          placeholder="Rechercher un garage..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* TABLEAU */}
        {paginatedGarages.length === 0 ? (
          <Typography align="center" sx={{ mt: 3 }}>
            Aucun garage trouvé.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#1565c0" }}>
                <TableRow>
                  {["Nom", "Adresse", "Email", "Téléphone", "Actions"].map((col) => (
                    <TableCell key={col} sx={{ color: "white", fontWeight: "bold" }}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedGarages.map((g) => (
                  <TableRow key={g.id} hover>
                    <TableCell>{g.name}</TableCell>
                    <TableCell>{g.address || "-"}</TableCell>
                    <TableCell>{g.email || "-"}</TableCell>
                    <TableCell>{g.phone || "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Modifier">
                          <IconButton
                            color="primary"
                            onClick={() => router.visit(route("garages.edit", g.id))}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(g)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* PAGINATION */}
        {pageCount > 1 && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

        {/* Dialog suppression */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>
            Supprimer le garage "{selectedGarage?.name}" ?
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
            <Button color="error" onClick={handleConfirmDelete}>Supprimer</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </GuestLayout>
  );
}
