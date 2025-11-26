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
  Button,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import { Card, CardHeader } from "@mui/material";

export default function Index({ produits }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);

  // Filtrage par nom
  const filteredProduits = useMemo(() => {
    return produits.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [produits, search]);

  // Pagination
  const pageCount = Math.ceil(filteredProduits.length / rowsPerPage);
  const paginatedProduits = filteredProduits.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Ouvrir popup suppression
  const handleDeleteClick = (produit) => {
    setSelectedProduit(produit);
    setDeleteDialogOpen(true);
  };

  // Confirmer suppression
  const handleConfirmDelete = () => {
    Inertia.delete(route("produits.destroy", selectedProduit.id));
    setDeleteDialogOpen(false);
  };

  return (
  <GuestLayout>
  <Box sx={{ p: 3 }}>
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader title="Liste des produits" 
        action={
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      router.visit(route("produits.create", boutique.id))
                    }
                  >
                    Nouveau produit
                  </Button>
                }/>

      <Box sx={{ p: 3 }}>
        {/* Barre de recherche et bouton ajouter */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
          <TextField
            label="Rechercher par nom"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
        </Box>

        {/* Tableau */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Photo</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProduits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Aucun produit trouvé.
                  </TableCell>
                </TableRow>
              )}

              {paginatedProduits.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    {p.photo && (
                      <img
                        src={`/storage/${p.photo}`}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.sale_price} CFA</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Modifier">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          Inertia.visit(route("produits.edit", p.id))
                        }
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Supprimer">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(p)}
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

        {/* Pagination */}
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
      </Box>
    </Card>

    {/* Dialog suppression */}
    <Dialog
      open={deleteDialogOpen}
      onClose={() => setDeleteDialogOpen(false)}
    >
      <DialogTitle>
        Voulez-vous vraiment supprimer le produit "{selectedProduit?.name}" ?
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
