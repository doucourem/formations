import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
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
  Typography,
  Stack,
  IconButton,
  Button,
  Tooltip,
  TextField,
  Pagination,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function Index({ agencies, filters }) {
  const [parPage, setParPage] = useState(filters?.per_page || 10);
  const [ville, setVille] = useState(filters?.city || '');

  const filtrer = () => {
    Inertia.get(
      route('agencies.index'),
      { per_page: parPage, city: ville },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette agence ?")) {
      Inertia.delete(route('agencies.destroy', id), { preserveState: true });
    }
  };

  return (
    <GuestLayout>
       <Card elevation={3} sx={{ borderRadius: 3 }}>
         <CardHeader
                    title={<Typography variant="h5">Agences</Typography>}
                    action={
                      <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => Inertia.get(route('agencies.create'))}
        >
          Créer une agence
        </Button>
                    }
                  />
 <CardContent>
      {/* Filtres */}
      <Box display="flex" gap={2} mb={3} alignItems="flex-end">
        <TextField
          label="Ville"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Par page"
          type="number"
          value={parPage}
          onChange={(e) => setParPage(Number(e.target.value))}
          variant="outlined"
          size="small"
          sx={{ width: 120 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={filtrer}
          sx={{ height: 40 }}
        >
          Filtrer
        </Button>
      </Box>

      {/* Tableau */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Ville</TableCell>
              <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agencies?.data?.length > 0 ? (
              agencies.data.map((agence) => (
                <TableRow key={agence.id}>
                  <TableCell>{agence.id}</TableCell>
                  <TableCell>{agence.name}</TableCell>
                  <TableCell>{agence.city || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      href={route('agencies.edit', agence.id)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(agence.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucune agence trouvée.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box mt={3} display="flex" justifyContent="center">
        <Pagination
          count={agencies?.last_page || 1}
          page={agencies?.current_page || 1}
          onChange={(e, page) =>
            Inertia.get(route('agencies.index'), {
              per_page: parPage,
              city: ville,
              page,
            })
          }
          color="primary"
        />
      </Box>
      </CardContent>
      </Card>
    </GuestLayout>
  );
}
