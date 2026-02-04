import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import GuestLayout from "@/Layouts/GuestLayout"; // 🔄 Changé pour voir la Sidebar
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
  TextField,
  Card,
  CardContent,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Route as RouteIcon,
} from "@mui/icons-material";
import { indigo } from "@mui/material/colors";

export default function RoutesIndex({ initialRoutes, initialFilters }) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [perPage, setPerPage] = useState(initialFilters?.per_page || 20);

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette route ?")) {
      Inertia.delete(route("busroutes.destroy", id), { preserveState: true });
    }
  };

  const handlePage = (page) => {
    Inertia.get(route("busroutes.index"), { per_page: perPage, page }, {
      preserveState: true,
      onSuccess: (pageData) => setRoutes(pageData.props.routes),
    });
  };

  const filtrer = () => {
    Inertia.get(route("busroutes.index"), { per_page: perPage }, {
      preserveState: true,
      onSuccess: (pageData) => setRoutes(pageData.props.routes),
    });
  };

  return (
    <GuestLayout>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" color={indigo[900]}>
              Lignes & Trajets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configuration des axes de transport (Villes de départ et d'arrivée)
            </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{ bgcolor: indigo[700], "&:hover": { bgcolor: indigo[900] } }}
            startIcon={<AddIcon />}
            onClick={() => Inertia.visit(route("busroutes.create"))}
          >
            Nouvelle Ligne
          </Button>
        </Stack>
      </Box>

      <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E0E0E0" }}>
        <CardContent>
          {/* Section Filtrage */}
          <Stack 
            direction={{ xs: "column", sm: "row" }} 
            spacing={2} 
            mb={3} 
            alignItems="center"
            sx={{ p: 2, bgcolor: "#F8F9FA", borderRadius: 2 }}
          >
            <TextField
              label="Résultats par page"
              type="number"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              size="small"
              sx={{ width: 150, bgcolor: "white" }}
            />
            <Button 
                variant="contained" 
                sx={{ bgcolor: indigo[500] }} 
                onClick={filtrer}
            >
              Appliquer
            </Button>
          </Stack>

          {/* Tableau */}
          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #EEE" }}>
            <Table>
              <TableHead sx={{ bgcolor: indigo[50] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", width: "80px" }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <RouteIcon fontSize="small" color="primary" /> Ville de départ
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Ville d'arrivée</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {routes.data?.length > 0 ? (
                  routes.data.map((routeItem) => (
                    <TableRow key={routeItem.id} hover>
                      <TableCell>#{routeItem.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                           {routeItem.departureCity?.name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                           {routeItem.arrivalCity?.name || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton 
                            sx={{ color: indigo[500], bgcolor: indigo[50], "&:hover": { bgcolor: indigo[100] } }} 
                            size="small" 
                            onClick={() => Inertia.visit(route("busroutes.edit", routeItem.id))}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            size="small" 
                            sx={{ bgcolor: "#FFEBEE", "&:hover": { bgcolor: "#FFCDD2" } }}
                            onClick={() => handleDelete(routeItem.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">Aucune route configurée pour le moment.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box mt={4} display="flex" justifyContent="center">
            <Pagination
              count={routes.last_page || 1}
              page={routes.current_page || 1}
              onChange={(e, page) => handlePage(page)}
              color="primary"
              size="large"
            />
          </Box>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}