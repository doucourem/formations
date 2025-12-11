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

  // ⚠️ S'assure que produits est un tableau
  const produitsList = produits || [];

  // Filtre
  const filteredProduits = useMemo(() => {
    return produitsList.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [produitsList, search]);

  // Pagination
  const pageCount = Math.ceil(filteredProduits.length / rowsPerPage);
  const paginatedProduits = filteredProduits.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Supprimer
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
        {/* CardHeader avec titre et bouton "Nouveau" */}
        <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
          <CardHeader
            title="Liste des produits"
            titleTypographyProps={{ fontWeight: 600, variant: "h6" }}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.visit(route("produits.create"))}
              >
                Nouveau produit
              </Button>
            }
          />
        </Card>

        {/* Recherche */}
        <TextField
          size="small"
          fullWidth
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Liste des produits */}
        {paginatedProduits.length === 0 ? (
          <Typography align="center" sx={{ mt: 3 }}>
            Aucun produit trouvé.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {paginatedProduits.map((p) => (
              <Card
                key={p.id}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" p={1}>
                  {/* Photo */}
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={p.photo ? `/storage/${p.photo}` : "/placeholder.png"}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>

                  {/* Infos */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography fontWeight={600}>{p.name}</Typography>
                    <Typography color="text.secondary">{p.sale_price} CFA</Typography>
                  </Box>

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Modifier">
                      <IconButton
                        color="primary"
                        onClick={() => Inertia.visit(route("produits.edit", p.id))}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton color="error" onClick={() => handleDeleteClick(p)}>
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
