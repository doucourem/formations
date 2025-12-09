import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Pagination,
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function Index() {
  const { thirdParties } = usePage().props; // récupère les tiers depuis le controller
  const [search, setSearch] = useState("");

  const filtered = thirdParties.filter(tp =>
    tp.name.toLowerCase().includes(search.toLowerCase()) ||
    tp.phone.includes(search)
  );

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce client ?")) {
      Inertia.delete(route("thirdParties.destroy", id));
    }
  };

  return (
    <GuestLayout>
      <Card sx={{ p: 3, borderRadius: 3 }}>
        <CardHeader title="Liste des tiers" />
        <CardContent>
          <Box display="flex" gap={2} mb={2}>
            <TextField
              label="Rechercher un client"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={() => Inertia.get(route("third-parties.create"))}
            >
              + Ajouter un client
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {['Nom', 'Téléphone', 'Montant total', 'Payé', 'Actions'].map(col => (
                    <TableCell
                      key={col}
                      sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
            <TableBody>
  {filtered.length > 0 ? (
    filtered.map(tp => (
      <TableRow key={tp.id} hover>
        <TableCell>{tp.name}</TableCell>
        <TableCell>{tp.phone}</TableCell>
        <TableCell>{tp.total_amount || 0} XOF</TableCell>
        <TableCell>{tp.total_paid || 0} XOF</TableCell>
        <TableCell>
          {/* Voir le détail */}
          <IconButton onClick={() => Inertia.get(route("third-parties.show", tp.id))} title="Voir détail">
            <VisibilityIcon />
          </IconButton>

          {/* Modifier */}
          <IconButton onClick={() => Inertia.get(route("third-parties.edit", tp.id))} title="Modifier">
            <EditIcon />
          </IconButton>

          {/* Supprimer */}
          <IconButton onClick={() => handleDelete(tp.id)} title="Supprimer">
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={5} align="center">
        Aucun client trouvé.
      </TableCell>
    </TableRow>
  )}
</TableBody>

            </Table>
          </TableContainer>

    
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
