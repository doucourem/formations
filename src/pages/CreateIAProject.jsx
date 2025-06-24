import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import axios from "axios";

export default function CreateIAProject() {
  const [title, setTitle] = useState("");
  const [objectif, setObjectif] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);

    try {
      await axios.post("http://localhost:8000/api/projects/", {
        title,
        objectif,
      });
      setMessage("Projet IA créé avec succès !");
      setTitle("");
      setObjectif("");
    } catch (err) {
      setMessage("Erreur lors de la création du projet.");
      setError(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Créer un projet IA
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <TextField
          label="Titre du projet"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Ex : Assistant IA pour influenceurs"
          fullWidth
        />

        <TextField
          label="Objectif du projet"
          variant="outlined"
          value={objectif}
          onChange={(e) => setObjectif(e.target.value)}
          required
          multiline
          rows={5}
          placeholder="Décris ici ce que tu souhaites réaliser avec l’IA"
          fullWidth
        />

        <Button type="submit" variant="contained" color="primary" size="large">
          Créer le projet
        </Button>
      </Box>

      {message && (
        <Alert severity={error ? "error" : "success"} sx={{ mt: 3 }}>
          {message}
        </Alert>
      )}
    </Container>
  );
}
