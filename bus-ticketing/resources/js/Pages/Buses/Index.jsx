import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
} from '@mui/material';

export default function Index({ buses, filters, agencies }) {
  const [parPage, setParPage] = useState(filters?.per_page || 20);
  const [agenceId, setAgenceId] = useState(filters?.agency_id || '');

  const handleFilter = () => {
    Inertia.get(
      route('buses.index'),
      { per_page: parPage, agency_id: agenceId },
      { preserveState: true }
    );
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Liste des bus
        </Typography>

        {/* Filtrage */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            select
            label="Agence"
            value={agenceId}
            onChange={(e) => setAgenceId(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Toutes les agences</MenuItem>
            {agencies?.map((agency) => (
              <MenuItem key={agency.id} value={agency.id}>
                {agency.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Par page"
            type="number"
            inputProps={{ min: 1 }}
            value={parPage}
            onChange={(e) => setParPage(e.target.value)}
            sx={{ width: 120 }}
          />

          <Button variant="contained" color="primary" onClick={handleFilter}>
            Filtrer
          </Button>
        </Stack>

        {/* Tableau */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Modèle</TableCell>
                <TableCell>Places</TableCell>
                <TableCell>Agence</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {buses?.data?.map((bus) => (
                <TableRow key={bus.id}>
                  <TableCell>{bus.id}</TableCell>
                  <TableCell>{bus.model}</TableCell>
                  <TableCell>{bus.seats}</TableCell>
                  <TableCell>{bus.agency?.name ?? '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      href={route('buses.edit', bus.id)}
                    >
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          {buses?.links?.map((link, i) => (
            <Button
              key={i}
              disabled={!link.url}
              variant={link.active ? 'contained' : 'outlined'}
              size="small"
              onClick={() => link.url && Inertia.get(link.url)}
              // S'assurer que label est une string
            >
              {typeof link.label === 'string' ? (
                <span dangerouslySetInnerHTML={{ __html: link.label }} />
              ) : (
                String(link.label)
              )}
            </Button>
          ))}
        </Stack>
      </Box>
    </GuestLayout>
  );
}
