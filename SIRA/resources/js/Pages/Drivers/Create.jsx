import React, { useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { useForm } from "@inertiajs/react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

export default function Create({ companies = [] }) {
  const {
    data,
    setData,
    post,
    processing,
    errors: serverErrors,
    recentlySuccessful
  } = useForm({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    birth_date: "",
    address: "",
    photo: null,
    company_id: "", // ← ajouté
  });

  const [preview, setPreview] = useState(null);
  const [localErrors, setLocalErrors] = useState({});

  const validateField = (name, value) => {
    let err = "";

    switch (name) {
      case "first_name":
        if (!value.trim()) err = "Le prénom est obligatoire";
        break;
      case "last_name":
        if (!value.trim()) err = "Le nom est obligatoire";
        break;
      case "phone":
        if (!/^\d{8}$/.test(value)) err = "Téléphone invalide (8 chiffres)";
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          err = "Email invalide";
        break;
      case "photo":
        if (value) {
          if (!["image/jpeg", "image/png"].includes(value.type)) {
            err = "Formats autorisés : JPG, PNG";
          }
          if (value.size > 2 * 1024 * 1024) {
            err = "La photo doit faire moins de 2 Mo";
          }
        }
        break;
      case "company_id":
        if (!value) err = "La compagnie est obligatoire";
        break;
      default:
        break;
    }

    setLocalErrors(prev => ({ ...prev, [name]: err }));
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    setData("phone", val);
    validateField("phone", val);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setData("photo", file);
    validateField("photo", file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const validateAll = () => {
    const fields = ["first_name", "last_name", "phone", "email", "photo", "company_id"];
    fields.forEach(f => validateField(f, data[f]));
    return Object.values(localErrors).every(err => !err);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    post("/drivers");
  };

  const allErrors = { ...serverErrors, ...localErrors };

  return (
    <GuestLayout>
      <Card sx={{ maxWidth: 650, mx: "auto", mt: 4, borderRadius: 4, p: 2 }}>
        <CardHeader
          title={<Typography variant="h5" fontWeight="bold">Ajouter un Chauffeur</Typography>}
        />
        <CardContent>
          <Box component="form" encType="multipart/form-data" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3}>
            
            {/* Photo */}
            <Box textAlign="center">
              <Box sx={{ width: 130, height: 130, mx: "auto", borderRadius: 3, overflow: "hidden", border: "2px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Avatar src={preview || "/default-avatar.png"} sx={{ width: "100%", height: "100%" }} variant="square" />
              </Box>
              <Button variant="contained" component="label" sx={{ mt: 1 }}>
                Choisir une photo
                <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
              </Button>
              {allErrors.photo && <Typography color="error" variant="body2">{allErrors.photo}</Typography>}
            </Box>

            {/* Prénom */}
            <TextField label="Prénom" value={data.first_name} onChange={e => { setData("first_name", e.target.value); validateField("first_name", e.target.value); }} error={!!allErrors.first_name} helperText={allErrors.first_name} fullWidth />

            {/* Nom */}
            <TextField label="Nom" value={data.last_name} onChange={e => { setData("last_name", e.target.value); validateField("last_name", e.target.value); }} error={!!allErrors.last_name} helperText={allErrors.last_name} fullWidth />

            {/* Téléphone */}
            <TextField label="Téléphone (8 chiffres)" value={data.phone} onChange={handlePhoneChange} error={!!allErrors.phone} helperText={allErrors.phone} fullWidth />

            {/* Email */}
            <TextField label="Email" value={data.email} onChange={e => { setData("email", e.target.value); validateField("email", e.target.value); }} error={!!allErrors.email} helperText={allErrors.email} fullWidth />

            {/* Date de naissance */}
            <TextField label="Date de naissance" type="date" value={data.birth_date} onChange={e => setData("birth_date", e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />

            {/* Adresse */}
            <TextField label="Adresse" value={data.address} onChange={e => setData("address", e.target.value)} multiline rows={2} fullWidth />

            {/* Compagnie */}
            <FormControl fullWidth error={!!allErrors.company_id}>
              <InputLabel>Compagnie</InputLabel>
              <Select value={data.company_id} onChange={e => { setData("company_id", e.target.value); validateField("company_id", e.target.value); }} label="Compagnie">
                <MenuItem value="">Sélectionner une compagnie</MenuItem>
                {companies.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
              {allErrors.company_id && <Typography color="error" variant="body2">{allErrors.company_id}</Typography>}
            </FormControl>

            <Button type="submit" variant="contained" color="primary" disabled={processing} sx={{ py: 1.2, borderRadius: 2, fontSize: "1rem" }}>Enregistrer</Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar open={recentlySuccessful} autoHideDuration={2000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success">Chauffeur ajouté avec succès !</Alert>
      </Snackbar>
    </GuestLayout>
  );
}
