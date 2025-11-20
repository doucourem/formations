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

    Inertia.get(
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
    if (confirm("Voulez-vous vraiment supprimer ce trimestre ?")) {
      Inertia.delete(route("trimestres.destroy", id));
    }
  };

  const handlePage = (page) => {
    Inertia.get(
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
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        
        {/* HEADER */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Trimestres – {boutique.name}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() =>
              Inertia.visit(
                route("boutiques.trimestres.create", boutique.id)
              )
            }
          >
            Ajouter un trimestre
          </Button>
        </Stack>

        {/* TABLE */}
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
                    <TableCell>{t.start_date}</TableCell>
                    <TableCell>{t.end_date}</TableCell>
                    <TableCell>
                      <strong>
                        {t.result?.toLocaleString()} FCFA
                      </strong>
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">

                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => Inertia.visit(route("trimestres.edit", t.id))}
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

        {/* PAGINATION */}
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
<Box mt={2}>
  <Typography variant="h6">Dépenses</Typography>
  {form.depenses.map((d, i) => (
    <Stack direction="row" spacing={1} key={i} mb={1}>
      <TextField
        label="Description"
        value={d.description}
        onChange={(e) => handleDepenseChange(i, 'description', e.target.value)}
      />
      <TextField
        label="Montant"
        type="number"
        value={d.amount}
        onChange={(e) => handleDepenseChange(i, 'amount', e.target.value)}
      />
      <IconButton color="error" onClick={() => removeDepense(i)}>❌</IconButton>
    </Stack>
  ))}
  <Button variant="outlined" onClick={addDepense}>+ Ajouter une dépense</Button>
</Box>
<Box mt={2}>
  <Typography variant="h6">Crédits</Typography>
  {form.credits.map((c, i) => (
    <Stack direction="row" spacing={1} key={i} mb={1}>
      <TextField
        label="Description"
        value={c.description}
        onChange={(e) => handleCreditChange(i, 'description', e.target.value)}
      />
      <TextField
        label="Montant"
        type="number"
        value={c.amount}
        onChange={(e) => handleCreditChange(i, 'amount', e.target.value)}
      />
      <IconButton color="error" onClick={() => removeCredit(i)}>❌</IconButton>
    </Stack>
  ))}
  <Button variant="outlined" onClick={addCredit}>+ Ajouter un crédit</Button>
</Box>

      </Box>
    </GuestLayout>
  );
}
