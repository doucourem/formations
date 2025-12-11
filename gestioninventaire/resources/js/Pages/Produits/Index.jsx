import React, { useState, useMemo } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout";
import { router } from "@inertiajs/react";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  IconButton,
  Button,
  Stack,
  Pagination,
  Dialog,
  DialogActions,
  DialogTitle,
  Avatar,
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function Index({ produits }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 6;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);

  // Filtre
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

  // Click delete
  const handleDeleteClick = (p) => {
    setSelectedProduit(p);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    Inertia.delete(route("produits.destroy", selectedProduit.id));
    setDeleteDialogOpen(false);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 2 }}>
        {/* HEADER */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" fontWeight={600}>
            Produits
          </Typography>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => router.visit(route("produits.create"))}
          >
            Nouveau
          </Button>
        </Stack>

        {/* SEARCH */}
        <TextField
          size="small"
          fullWidth
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* LISTE CARDS */}
        {paginatedProduits.length === 0 ? (
          <Typography align="center" sx={{ mt: 3 }}>
            Aucun produit trouvé.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {paginatedProduits.map((p) => (
              <Card key={p.id} sx={{ borderRadius: 2, p: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center">

                  {/* Photo */}
                  <Avatar
                    variant="rounded"
                    src={`/storage/${p.photo}`}
                    sx={{ width: 70, height: 70 }}
                  />

                  {/* Infos */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={600}>{p.name}</Typography>
                    <Typography color="text.secondary">
                      {p.sale_price} CFA
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
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
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}

        {/* Pagination */}
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
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>
            Supprimer le produit "{selectedProduit?.name}" ?
          </DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
            <Button color="error" onClick={handleConfirmDelete}>
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </GuestLayout>
  );
}
