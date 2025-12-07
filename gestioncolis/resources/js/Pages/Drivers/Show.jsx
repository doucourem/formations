import React, { useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Avatar,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { useForm, router } from "@inertiajs/react";

export default function Show({ driver }) {
  const [openUpload, setOpenUpload] = useState(false);

  const uploadForm = useForm({
    type: "",
    file: null
  });

  const handleUpload = () => {
    uploadForm.post(`/drivers/${driver.id}/documents`, {
      onSuccess: () => {
        setOpenUpload(false);
        uploadForm.reset();
      }
    });
  };

  const handleDelete = (docId) => {
    router.delete(`/drivers/${driver.id}/documents/${docId}`);
  };

  return (
    <GuestLayout>
      <Card sx={{ maxWidth: 900, mx: "auto", mt: 4, borderRadius: 3 }}>
        <CardHeader
          title={<Typography variant="h5">Détail du Chauffeur</Typography>}
        />

        <CardContent>
          {/* Infos du chauffeur */}
          <Box display="flex" gap={3} mb={4}>
            <Avatar
              src={driver.photo}
              sx={{ width: 120, height: 120, borderRadius: 2 }}
            />

            <Box>
              <Typography variant="h6">
                {driver.first_name} {driver.last_name}
              </Typography>
              <Typography>Téléphone : {driver.phone}</Typography>
              <Typography>Email : {driver.email ?? "—"}</Typography>
              <Typography>Adresse : {driver.address ?? "—"}</Typography>
              <Typography>
                Date de naissance : {driver.birth_date ?? "—"}
              </Typography>
            </Box>
          </Box>

          {/* Section documents */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Documents</Typography>

            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => setOpenUpload(true)}
            >
              Ajouter Document
            </Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Date d'expiration</TableCell>
                <TableCell>Fichier</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {driver.documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Aucun document
                  </TableCell>
                </TableRow>
              )}

              {driver.documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.expires_at ?? "—"}</TableCell>
                  <TableCell>
                    <a href={doc.file_path} target="_blank">
                      Voir fichier
                    </a>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleDelete(doc.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal upload */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)}>
        <DialogTitle>Ajouter un document</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Type de document"
              value={uploadForm.data.type}
              onChange={(e) => uploadForm.setData("type", e.target.value)}
              fullWidth
            />

            <TextField
              type="date"
              label="Date d'expiration"
              InputLabelProps={{ shrink: true }}
              value={uploadForm.data.expires_at}
              onChange={(e) => uploadForm.setData("expires_at", e.target.value)}
              fullWidth
            />

            <Button variant="contained" component="label">
              Choisir fichier
              <input
                type="file"
                hidden
                onChange={(e) =>
                  uploadForm.setData("file", e.target.files[0])
                }
              />
            </Button>

            {uploadForm.errors.file && (
              <Typography variant="body2" color="error">
                {uploadForm.errors.file}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleUpload}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </GuestLayout>
  );
}
