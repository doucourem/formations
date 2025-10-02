import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Box,
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
  Pagination,
  Stack,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Index({ agencies, filters }) {
  const [parPage, setParPage] = useState(filters?.per_page || 20);
  const [ville, setVille] = useState(filters?.city || '');

  const filtrer = () => {
    Inertia.get(
      route('agencies.index'),
      { per_page: parPage, city: ville },
      { preserveState: true }
    );
  };

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cette agence ?")) {
      Inertia.delete(route('agencies.destroy', id), { preserveState: true });
    }
  };

  return (
    <GuestLayout>
      {/* Header avec titre + bouton Créer */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Agences</Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          href={route('agencies.create')}
        >
          Créer
        </Button>
      </Box>

      {/* Filtres */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems="flex-end">
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
        <Button variant="contained" color="primary" onClick={filtrer}>
          Filtrer
        </Button>
      </Stack>

      {/* Tableau */}
      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#1976d2' }}>
            <TableRow>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Ville</TableCell>
              <TableCell align="center" sx={{ color: '#ffffff', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agencies?.data?.length > 0 ? (
              agencies.data.map((agence) => (
                <TableRow key={agence.id}>
                  <TableCell>{agence.id}</TableCell>
                  <TableCell>{agence.name}</TableCell>
                  <TableCell>{agence.city || '-'}</TableCell>
                  <TableCell align="center">
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
          showFirstButton
          showLastButton
          getItemAriaLabel={(type, page, selected) => {
            switch (type) {
              case 'first': return 'Première page';
              case 'last': return 'Dernière page';
              case 'next': return 'Page suivante';
              case 'previous': return 'Page précédente';
              case 'page': return `Page ${page}${selected ? ' (sélectionnée)' : ''}`;
              default: return '';
            }
          }}
        />
      </Box>
    </GuestLayout>
  );
}
