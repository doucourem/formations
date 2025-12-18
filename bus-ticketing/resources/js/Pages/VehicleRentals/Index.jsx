import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import GuestLayout from '@/Layouts/GuestLayout';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Box } from '@mui/material';

export default function Index({ rentals }) {
  const handleDelete = (id) => {
    if (confirm('Voulez-vous supprimer cette location ?')) {
      Inertia.delete(route('vehicle-rentals.destroy', id), { preserveState: true });
    }
  };

  return (
    <GuestLayout>
      <Box mb={2}>
        <Button variant="contained" onClick={() => Inertia.get(route('vehicle-rentals.create'))}>
          Nouvelle Location
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['ID', 'Véhicule', 'Client', 'Début', 'Fin', 'Prix', 'Photos', 'Statut', 'Actions'].map((col) => (
                <TableCell key={col}><strong>{col}</strong></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rentals.data.map((rental) => (
              <TableRow key={rental.id}>
                <TableCell>{rental.id}</TableCell>
                <TableCell>{rental.vehicle?.registration_number || '-'}</TableCell>
                <TableCell>{rental.client_name}</TableCell>
                <TableCell>{rental.rental_start}</TableCell>
                <TableCell>{rental.rental_end}</TableCell>
                <TableCell>{rental.rental_price}</TableCell>
                <TableCell>
                  {rental.photo_before_url && <img src={rental.photo_before_url} alt="Avant" width={50} />}
                  {rental.photo_after_url && <img src={rental.photo_after_url} alt="Après" width={50} />}
                </TableCell>
                <TableCell>{rental.status}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => Inertia.get(route('vehicle-rentals.edit', rental.id))}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDelete(rental.id)}>Supprimer</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GuestLayout>
  );
}
