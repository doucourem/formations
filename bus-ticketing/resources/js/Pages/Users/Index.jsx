import React, { useState } from "react";
import { Inertia } from "@inertiajs/inertia";
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
  Pagination,
  Stack,
  IconButton,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import GuestLayout from "@/Layouts/GuestLayout";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function Index({ users, filters }) {
  const [perPage, setPerPage] = useState(filters?.per_page || 20);
  const [role, setRole] = useState(filters?.role || "");

  const handleDelete = (id) => {
    if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      Inertia.delete(route("users.destroy", id), { preserveState: true });
    }
  };

  return (
    <GuestLayout>
      <Box sx={{ p: 3 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={<Typography variant="h5">Utilisateurs</Typography>}
            action={
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => Inertia.get(route("users.create"))}
              >
                Créer un utilisateur
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ bgcolor: "#1976d2" }}>
                  <TableRow>
                    <TableCell x={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}><strong>ID</strong></TableCell>
                    <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}><strong>Nom</strong></TableCell>
                    <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}><strong>Email</strong></TableCell>
                    <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }}><strong>Rôle</strong></TableCell>
                    <TableCell sx={{ backgroundColor: '#1976d2', color: 'white', fontWeight: 'bold' }} align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.data && users.data.length > 0 ? (
                    users.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role || "-"}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" href={route("users.edit", user.id)} size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(user.id)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Aucun utilisateur trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={3} display="flex" justifyContent="center">
              <Pagination
                count={users.last_page || 1}
                page={users.current_page || 1}
                onChange={(e, page) => Inertia.get(route("users.index"), { per_page: perPage, role, page })}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </GuestLayout>
  );
}
