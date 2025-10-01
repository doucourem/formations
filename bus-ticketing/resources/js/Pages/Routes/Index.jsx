import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
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
  TextField,
  Stack,
} from '@mui/material';

export default function Index({ initialRoutes, initialFilters }) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [parPage, setParPage] = useState(initialFilters?.per_page || 20);

  const filtrer = () => {
    Inertia.get(
      route('routes.index'),
      { per_page: parPage },
      {
        preserveState: true,
        onSuccess: page => setRoutes(page.props.routes),
      }
    );
  };

  const handlePage = (url) => {
    Inertia.get(url, {}, {
      preserveState: true,
      onSuccess: page => setRoutes(page.props.routes),
    });
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Routes</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => Inertia.get(route('routes.create'))}
          >
            Créer une route
          </Button>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <TextField
            label="Par page"
            type="number"
            value={parPage}
            onChange={e => setParPage(Number(e.target.value))}
            size="small"
            sx={{ width: 100 }}
          />
          <Button variant="outlined" onClick={filtrer}>
            Filtrer
          </Button>
        </Stack>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Ville de départ</TableCell>
                <TableCell>Ville d'arrivée</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.data.map((routeItem) => (
                <TableRow key={routeItem.id}>
                  <TableCell>{routeItem.id}</TableCell>
                  <TableCell>{routeItem.departureCity?.name || '-'}</TableCell>
                  <TableCell>{routeItem.arrivalCity?.name || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => Inertia.get(routeItem.edit_url)}
                    >
                      Éditer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Stack direction="row" spacing={1} mt={2}>
          {routes.links.map((link, i) => (
            <Button
              key={i}
              variant="outlined"
              size="small"
              disabled={!link.url}
              onClick={() => link.url && handlePage(link.url)}
            >
              {link.label.replace(/<[^>]*>?/gm, '')}
            </Button>
          ))}
        </Stack>
      </Box>
    </GuestLayout>
  );
}
