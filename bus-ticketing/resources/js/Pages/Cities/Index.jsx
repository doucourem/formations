import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, Stack,
} from '@mui/material';

export default function Index({ cities }) {
  if (!cities) return null;

  const handleDelete = (id) => {
    if (confirm('Voulez-vous vraiment supprimer cette ville ?')) {
      Inertia.delete(route('cities.destroy', id));
    }
  };

  const handlePagination = (url) => {
    if (url) Inertia.get(url);
  };

  return (
    <GuestLayout>
      <Typography variant="h4" gutterBottom>Villes</Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => Inertia.visit(route('cities.create'))}
        >
          Ajouter une ville
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cities.data?.map(city => (
              <TableRow key={city.id}>
                <TableCell>{city.id}</TableCell>
                <TableCell>{city.name}</TableCell>
                <TableCell>{city.code || '-'}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => Inertia.visit(route('cities.edit', city.id))}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(city.id)}
                  >
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        {cities.links?.map((link, i) => (
          <Button
            key={i}
            disabled={!link.url}
            variant={link.active ? 'contained' : 'outlined'}
            size="small"
            onClick={() => handlePagination(link.url)}
          >
            <span dangerouslySetInnerHTML={{ __html: link.label }} />
          </Button>
        ))}
      </Stack>
    </GuestLayout>
  );
}
