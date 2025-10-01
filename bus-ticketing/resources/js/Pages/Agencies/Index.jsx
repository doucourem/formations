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
} from '@mui/material';

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

  return (
    <GuestLayout>
      <Typography variant="h4" gutterBottom>
        Agences
      </Typography>

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
        <Button variant="contained" color="primary" onClick={filtrer}>
          Filtrer
        </Button>
      </Box>

      {/* Tableau */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Nom</strong></TableCell>
              <TableCell><strong>Ville</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
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
                    <Button
                      href={route('agencies.edit', agence.id)}
                      color="primary"
                      size="small"
                    >
                      Éditer
                    </Button>
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
    </GuestLayout>
  );
}
