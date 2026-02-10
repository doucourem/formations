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
  Card,
  CardHeader,
  CardContent,
  Chip
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
  const [expandedGarageId, setExpandedGarageId] = useState(null);

  // Pagination interne maintenances
  const [maintenancesPage, setMaintenancesPage] = useState({});
  const rowsPerPageMaint = 5;

  const getPaginatedMaintenances = (garage) => {
    const currentPage = maintenancesPage[garage.id] || 1;
    const start = (currentPage - 1) * rowsPerPageMaint;
    const end = start + rowsPerPageMaint;
    return garage.maintenances.slice(start, end);
  };

  const handleMaintenancesPageChange = (garageId, value) => {
    setMaintenancesPage(prev => ({ ...prev, [garageId]: value }));
  };

  // Filtre
  const filteredGarages = useMemo(() => {
    return (garages || []).filter((g) =>
      g.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [garages, search]);

  // Pagination principale
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

  const toggleExpand = (id) => {
    setExpandedGarageId(expandedGarageId === id ? null : id);
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 2 }}>
        <Card>
          <CardHeader
            title={<Typography variant="h6" fontWeight={600}>Garages</Typography>}
            action={
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => router.visit(route("garages.create"))}
              >
                Nouveau
              </Button>
            }
          />
          <CardContent>
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
                      <React.Fragment key={g.id}>
                        <TableRow hover onClick={() => toggleExpand(g.id)} sx={{ cursor: "pointer" }}>
                          <TableCell>{g.name}</TableCell>
                          <TableCell>{g.address || "-"}</TableCell>
                          <TableCell>{g.email || "-"}</TableCell>
                          <TableCell>{g.phone || "-"}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Modifier">
                                <IconButton
                                  color="primary"
                                  onClick={(e) => { e.stopPropagation(); router.visit(route("garages.edit", g.id)); }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  color="error"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(g); }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>

                        {/* MAINTENANCES */}
                        {expandedGarageId === g.id && g.maintenances?.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={5} sx={{ bgcolor: "#f5f5f5" }}>
                              <Typography variant="subtitle2" sx={{ mb: 1 }}>Maintenances :</Typography>

                              <Table size="small">
                                <TableHead>
  <TableRow>
    <TableCell>Véhicule</TableCell>
    <TableCell>Date</TableCell>
    <TableCell>Type</TableCell>
    <TableCell>Coût</TableCell>
  </TableRow>
</TableHead>
<TableBody>
  {g.maintenances.map((m) => (
    <TableRow key={m.id}>
      <TableCell>{m.bus?.registration_number || "-"}</TableCell>
     <TableCell>
  {new Date(m.maintenance_date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  })}
</TableCell>

      <TableCell>{m.type}</TableCell>
      <TableCell>{m.cost}</TableCell>
    </TableRow>
  ))}
</TableBody>

                              </Table>

                              {/* PAGINATION INTERNE */}
                              {g.maintenances.length > rowsPerPageMaint && (
                                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                                  <Pagination
                                    count={Math.ceil(g.maintenances.length / rowsPerPageMaint)}
                                    page={maintenancesPage[g.id] || 1}
                                    onChange={(e, value) => handleMaintenancesPageChange(g.id, value)}
                                    size="small"
                                    color="primary"
                                  />
                                </Box>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* PAGINATION PRINCIPALE */}
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
          </CardContent>
        </Card>

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
