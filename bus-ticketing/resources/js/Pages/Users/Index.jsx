import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack
} from '@mui/material';

export default function Index({ initialUsers = { data: [], links: [] }, initialFilters = {} }) {
  const [users, setUsers] = useState(initialUsers);
  const [role, setRole] = useState(initialFilters.role || '');
  const [perPage, setPerPage] = useState(initialFilters.per_page || 20);

  const handleFilter = () => {
    Inertia.get(
      route('users.index'),
      { role, per_page: perPage },
      {
        preserveState: true,
        onSuccess: page => setUsers(page.props.users ?? { data: [], links: [] }),
      }
    );
  };

  const handlePage = (url) => {
    if (!url) return;
    Inertia.get(url, {}, {
      preserveState: true,
      onSuccess: page => setUsers(page.props.users ?? { data: [], links: [] }),
    });
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Utilisateurs</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => Inertia.get(route('users.create'))}
          >
            Créer un utilisateur
          </Button>
        </Stack>

        {/* Filtres */}
        <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" alignItems="flex-end">
          <TextField
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            size="small"
          />
          <TextField
            label="Par page"
            type="number"
            value={perPage}
            onChange={(e) => setPerPage(e.target.value)}
            size="small"
            sx={{ width: 100 }}
          />
          <Button variant="contained" color="secondary" onClick={handleFilter}>
            Filtrer
          </Button>
        </Stack>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.data?.map(user => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      href={route('users.edit', user.id)}
                    >
                      Éditer
                    </Button>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Aucun utilisateur
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
          {users.links?.map((link, i) => (
            <Button
              key={i}
              disabled={!link?.url}
              onClick={() => handlePage(link.url)}
              dangerouslySetInnerHTML={{ __html: link.label }}
              variant={link.active ? "contained" : "outlined"}
              size="small"
            />
          ))}
        </Stack>
      </Box>
    </GuestLayout>
  );
}
