import React from "react";
import { Link, router } from "@inertiajs/react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
    CardHeader,
    Button
    

} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Index({ companies }) {
  const deleteCompany = (id) => {
    if (confirm("Supprimer cette compagnie ?")) {
      router.delete(`/companies/${id}`);
    }
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ mb: 3 }}>
         <CardHeader
                  title={<Typography variant="h5"> Compagnies</Typography>}
                  action={
                    <Button
  variant="contained"
  color="primary"
  startIcon={<AddIcon />}
  component={Link}
  href={route('companies.create')}
>
  Nouvelle compagnie
</Button>

                  }
                />
        <CardContent>
         
          <Typography variant="body2" color="text.secondary" mb={2}>
            Gestion des compagnies de transport et gros porteurs
          </Typography>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}>Adresse</TableCell>
              <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.data.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>
                  {c.type === "passengers"
                    ? "Transport passagers"
                    : "Cargo / Gros porteur"}
                </TableCell>
                <TableCell>{c.contact || "Non renseigné"}</TableCell>
                <TableCell>{c.address || "-"}</TableCell>
                <TableCell align="center">
                  <IconButton
                    component={Link}
                    href={`/companies/${c.id}`}
                    color="primary"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    component={Link}
                    href={`/companies/${c.id}/edit`}
                    color="secondary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => deleteCompany(c.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GuestLayout>
  );
}
