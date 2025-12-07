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
  Button,
  IconButton,
  TextField,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { route } from 'ziggy-js';

export default function DriverDocumentsIndex({ driver, documents, flash }) {
  const [type, setType] = useState('');
  const [file, setFile] = useState(null);

  // Upload d'un document
  const handleUpload = (e) => {
    e.preventDefault();
    if (!type || !file) return;

    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', file);

    Inertia.post(route('driver_documents.store', { driver: driver.id }), formData, {
      preserveState: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  // Suppression d'un document
  const handleDelete = (docId) => {
    if (confirm("Voulez-vous vraiment supprimer ce document ?")) {
      Inertia.delete(route('driver_documents.destroy', { driver: driver.id, document: docId }), {
        preserveState: true,
      });
    }
  };

  return (
    <GuestLayout>
      <Card elevation={3} sx={{ borderRadius: 3, p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <CardHeader
          title={<Typography variant="h5">Documents de {driver.first_name} {driver.last_name}</Typography>}
          action={
            <Button variant="contained" color="primary" href={route('drivers.index')}>
              ← Retour aux chauffeurs
            </Button>
          }
        />
        <CardContent>
          {/* Messages flash */}
          {flash?.success && <Alert severity="success" sx={{ mb: 2 }}>{flash.success}</Alert>}
          {flash?.error && <Alert severity="error" sx={{ mb: 2 }}>{flash.error}</Alert>}

          {/* Upload document */}
          <Box
            component="form"
            onSubmit={handleUpload}
            display="flex"
            gap={2}
            mb={3}
            alignItems="flex-end"
          >
            <TextField
              label="Type de document"
              value={type}
              onChange={(e) => setType(e.target.value)}
              variant="outlined"
              size="small"
              required
            />

            {/* Input fichier stylisé */}
            <label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
                style={{ display: 'none' }}
              />
              <Button variant="outlined" component="span">
                Choisir un fichier
              </Button>
            </label>

            <Button type="submit" variant="contained" color="primary" startIcon={<AddIcon />}>
              Ajouter
            </Button>
          </Box>

          {/* Tableau des documents */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Fichier</TableCell>
                  <TableCell>Expiration</TableCell>
                  <TableCell>Créé le</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.id}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>
                        {doc.file_path ? (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            href={doc.file_path}
                            target="_blank"
                          >
                            Télécharger
                          </Button>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{doc.expires_at || '-'}</TableCell>
                      <TableCell>{doc.created_at}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleDelete(doc.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun document trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </GuestLayout>
  );
}
