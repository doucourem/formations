import React, { useState, useMemo } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TextField,
  Pagination,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from '@mui/icons-material/Add';

export default function Index({ boutiques }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBoutique, setSelectedBoutique] = useState(null);

  const filteredBoutiques = useMemo(() => {
    return boutiques.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [boutiques, search]);

  const pageCount = Math.ceil(filteredBoutiques.length / rowsPerPage);
  const paginatedBoutiques = filteredBoutiques.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleDeleteClick = (boutique) => {
    setSelectedBoutique(boutique);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    Inertia.delete(route("boutiques.destroy", selectedBoutique.id));
    setDeleteDialogOpen(false);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
          <TextField
            label="Rechercher par nom"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
          <IconButton
            color="primary"
            onClick={() => Inertia.visit(route("boutiques.create"))}
          >
            <Tooltip title="Nouvelle boutique">
              <AddIcon />
            </Tooltip>
          </IconButton>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Adresse</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedBoutiques.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucune boutique trouvée.
                  </TableCell>
                </TableRow>
              )}

              {paginatedBoutiques.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.name}</TableCell>
                  <TableCell>{b.adresse}</TableCell>
                  <TableCell>{b.telephone}</TableCell>
                  <TableCell>{b.email}</TableCell>
                  <TableCell>{b.description}</TableCell>
                  <TableCell align="center">
                     <Tooltip title="Voir Trimestres">
  <IconButton
    color="info"
    onClick={() =>
      Inertia.visit(route("boutiques.trimestres.index", b.id))
    }
  >
    <VisibilityIcon />
  </IconButton>

                    </Tooltip>

                    <Tooltip title="Modifier">
                      <IconButton
                        color="primary"
                        onClick={() => Inertia.visit(route("boutiques.edit", b.id))}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Supprimer">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(b)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {pageCount > 1 && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>
            Voulez-vous vraiment supprimer la boutique "{selectedBoutique?.name}" ?
          </DialogTitle>
          <DialogActions>
            <IconButton onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </IconButton>
            <IconButton color="error" onClick={handleConfirmDelete}>
              Supprimer
            </IconButton>
          </DialogActions>
        </Dialog>
      </Box>
    </GuestLayout>
  );
}
