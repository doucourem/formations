import React, { useState } from "react";
// Importation de 'router' depuis @inertiajs/react, qui est la convention moderne pour la navigation
import { router } from "@inertiajs/react"; 
import GuestLayout from "@/Layouts/GuestLayout";

// Suppression de l'import GuestLayout qui n'est pas résolu. 
// Le contenu sera enveloppé dans une structure Box simple.
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
import { Card, CardHeader } from "@mui/material";

export default function TrimestresIndex({ boutique, trimestres, filters }) {
    const [sortField, setSortField] = useState(filters?.sort_field || "id");
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || "asc");

    const handleSort = (field) => {
        let direction = "asc";
        if (sortField === field) {
            direction = sortDirection === "asc" ? "desc" : "asc";
        }

        setSortField(field);
        setSortDirection(direction);

        // Utilisation de router.get() à la place de Inertia.get()
        router.get(
            route("boutiques.trimestres.index", boutique.id),
            {
                per_page: filters.per_page,
                sort_field: field,
                sort_direction: direction,
            },
            { preserveState: true }
        );
    };

    const handleDelete = (id) => {
        // NOTE: Utiliser un composant modal personnalisé est recommandé au lieu de `confirm()`
        if (confirm("Voulez-vous vraiment supprimer ce trimestre ?")) {
            // Utilisation de router.delete() à la place de Inertia.delete()
            router.delete(route("trimestres.destroy", id));
        }
    };

    const handlePage = (page) => {
        // Utilisation de router.get() à la place de Inertia.get()
        router.get(
            route("boutiques.trimestres.index", boutique.id),
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
        // Remplacement de GuestLayout par une Box simple pour la mise en page

<GuestLayout>
  <Box sx={{ p: 5, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
    <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
      
      {/* Card */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardHeader
          title={`Trimestres – ${boutique.name}`}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() =>
                router.visit(route("boutiques.trimestres.create", boutique.id))
              }
            >
              Ajouter un trimestre
            </Button>
          }
        />

        {/* Contenu de la Card */}
        <Box sx={{ p: 3 }}>
          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ cursor: "pointer", color: "#fff" }} onClick={() => handleSort("id")}>
                    ID {renderSortIcon("id")}
                  </TableCell>
                  <TableCell sx={{ cursor: "pointer", color: "#fff" }} onClick={() => handleSort("start_date")}>
                    Début {renderSortIcon("start_date")}
                  </TableCell>
                  <TableCell sx={{ cursor: "pointer", color: "#fff" }} onClick={() => handleSort("end_date")}>
                    Fin {renderSortIcon("end_date")}
                  </TableCell>
                  <TableCell sx={{ cursor: "pointer", color: "#fff" }} onClick={() => handleSort("result")}>
                    Résultat {renderSortIcon("result")}
                  </TableCell>
                  <TableCell align="center" sx={{ color: "#fff" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

             <TableBody>
  {trimestres.data?.length > 0 ? (
    trimestres.data.map((t) => (
      <TableRow key={t.id}>
        <TableCell>{t.id}</TableCell>
        <TableCell>
          {new Date(t.start_date).toLocaleDateString("fr-FR")}
        </TableCell>
        <TableCell>
          {new Date(t.end_date).toLocaleDateString("fr-FR")}
        </TableCell>
        <TableCell>
          <strong>
            <a
              href={route("trimestres.show", t.id)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {t.result?.toLocaleString()} FCFA
            </a>
          </strong>
        </TableCell>
        <TableCell align="center">
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton
              color="primary"
              size="small"
              onClick={() => router.visit(route("trimestres.edit", t.id))}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDelete(t.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={5} align="center">
        Aucun trimestre trouvé.
      </TableCell>
    </TableRow>
  )}
</TableBody>

            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={trimestres.last_page || 1}
              page={trimestres.current_page || 1}
              onChange={(e, page) => handlePage(page)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>
      </Card>
    </Box>
  </Box>
</GuestLayout>

    );
}