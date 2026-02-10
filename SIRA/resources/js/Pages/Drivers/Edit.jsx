import React, { useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { router } from "@inertiajs/react";
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  Avatar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Edit({ driver, companies = [] }) {
  const [form, setForm] = useState({
    first_name: driver.first_name || "",
    last_name: driver.last_name || "",
    phone: driver.phone || "",
    email: driver.email || "",
    birth_date: driver.birth_date || "",
    address: driver.address || "",
    photo: null,
    remove_photo: false,
    company_id: driver.company_id || "",
  });

  const [preview, setPreview] = useState(driver.photo ? `/storage/${driver.photo}` : null);
  const [localErrors, setLocalErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleChange = (field, value) => {
    if (field === "phone") value = value.replace(/\D/g, "").slice(0, 8);
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(prev => ({ ...prev, photo: file, remove_photo: false }));
    setPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setForm(prev => ({ ...prev, photo: null, remove_photo: true }));
    setPreview(null);
  };

  const validateAll = () => {
    const errors = {};
    ["first_name", "last_name", "phone", "email", "photo", "company_id"].forEach(field => {
      const value = form[field];
      switch (field) {
        case "first_name":
          if (!value.trim()) errors.first_name = "Le prénom est obligatoire";
          break;
        case "last_name":
          if (!value.trim()) errors.last_name = "Le nom est obligatoire";
          break;
        case "phone":
          if (!/^\d{8}$/.test(value)) errors.phone = "Téléphone invalide (8 chiffres)";
          break;
        case "email":
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = "Email invalide";
          break;
        case "photo":
          if (value) {
            if (!["image/jpeg", "image/png"].includes(value.type)) errors.photo = "Formats autorisés : JPG, PNG";
            if (value.size > 2 * 1024 * 1024) errors.photo = "La photo doit faire moins de 2 Mo";
          }
          break;
        case "company_id":
          if (!value) errors.company_id = "La compagnie est obligatoire";
          break;
        default:
          break;
      }
    });
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!validateAll()) return;

  const payload = new FormData();
  payload.append("first_name", form.first_name);
  payload.append("last_name", form.last_name);
  payload.append("phone", form.phone);
  payload.append("email", form.email || "");
  payload.append("birth_date", form.birth_date || "");
  payload.append("address", form.address || "");
   payload.append("company_id", form.company_id || "");
  // ✅ Make sure remove_photo is always boolean
  payload.append("remove_photo", form.remove_photo ? "1" : "0");
  if (form.photo) payload.append("photo", form.photo);
  payload.append("_method", "PUT");

  router.post(route("drivers.update", driver.id), payload, {
    forceFormData: true,
    onSuccess: () => setSnackbar({ open: true, message: "Chauffeur mis à jour avec succès !", severity: "success" }),
    onError: (errors) => setSnackbar({ open: true, message: errors ? Object.values(errors).join(", ") : "Erreur lors de l'enregistrement.", severity: "error" }),
  });
};


  return (
    <GuestLayout>
      <Card sx={{ maxWidth: 650, mx: "auto", mt: 4, borderRadius: 4, p: 2 }}>
        <CardHeader title={<Typography variant="h5" fontWeight="bold">Modifier Chauffeur</Typography>} sx={{ textAlign: "center" }} />
        <CardContent>
          <Box component="form" encType="multipart/form-data" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3}>

            {/* PHOTO */}
            <Box textAlign="center">
              <Box sx={{ width: 130, height: 130, mx: "auto", borderRadius: 3, overflow: "hidden", border: "2px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Avatar
  src={driver.photo_url || '/default-avatar.png'}
  sx={{ width: 120, height: 120, borderRadius: 2 }}
/>
              </Box>
              <Box display="flex" justifyContent="center" gap={1} mt={1}>
                <Button variant="contained" component="label">Changer photo
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {preview && <Tooltip title="Supprimer photo"><IconButton onClick={handleRemovePhoto} color="error"><DeleteIcon /></IconButton></Tooltip>}
              </Box>
              {localErrors.photo && <Typography color="error">{localErrors.photo}</Typography>}
            </Box>

            <TextField label="Prénom" value={form.first_name} onChange={e => handleChange("first_name", e.target.value)} error={!!localErrors.first_name} helperText={localErrors.first_name} fullWidth />
            <TextField label="Nom" value={form.last_name} onChange={e => handleChange("last_name", e.target.value)} error={!!localErrors.last_name} helperText={localErrors.last_name} fullWidth />
            <TextField label="Téléphone (8 chiffres)" value={form.phone} onChange={e => handleChange("phone", e.target.value)} error={!!localErrors.phone} helperText={localErrors.phone} fullWidth />
            <TextField label="Email" type="email" value={form.email} onChange={e => handleChange("email", e.target.value)} error={!!localErrors.email} helperText={localErrors.email} fullWidth />
            <TextField label="Date de naissance" type="date" value={form.birth_date} onChange={e => handleChange("birth_date", e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label="Adresse" value={form.address} onChange={e => handleChange("address", e.target.value)} multiline rows={2} fullWidth />

            {/* COMPAGNIE */}
            <FormControl fullWidth error={!!localErrors.company_id}>
              <InputLabel>Compagnie</InputLabel>
              <Select value={form.company_id} onChange={e => handleChange("company_id", e.target.value)} label="Compagnie">
                <MenuItem value="">Sélectionner une compagnie</MenuItem>
                {companies.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
              {localErrors.company_id && <Typography color="error">{localErrors.company_id}</Typography>}
            </FormControl>

            <Button type="submit" variant="contained" color="primary" sx={{ py: 1.2, borderRadius: 2, fontSize: "1rem" }}>Enregistrer</Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </GuestLayout>
  );
}
