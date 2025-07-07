import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { supabase } from '../utils/supabaseClient';

export default function AddCourseForm() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    niveau: '',
    duree: '',
    rating: '',
    image: '',
    video_url: '',
    contenu: [],
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('courses').insert([form]);

    if (error) {
      setMessage("Erreur : " + error.message);
    } else {
      setMessage("✅ Cours ajouté !");
      setForm({ title: '', description: '', niveau: '', duree: '', rating: '', image: '', video_url: '', contenu: [] });
    }
  };

  return (
    <Box maxWidth="sm" mx="auto">
      <Typography variant="h5" mb={2}>Ajouter un cours</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Titre" fullWidth margin="normal" required
          value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <TextField label="Description" fullWidth margin="normal" multiline rows={3}
          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <TextField label="Niveau" fullWidth margin="normal"
          value={form.niveau} onChange={e => setForm({ ...form, niveau: e.target.value })} />
        <TextField label="Durée" fullWidth margin="normal"
          value={form.duree} onChange={e => setForm({ ...form, duree: e.target.value })} />
        <TextField label="Note" fullWidth margin="normal"
          value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
        <TextField label="Image (URL)" fullWidth margin="normal"
          value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} />
        <TextField label="Vidéo (URL)" fullWidth margin="normal"
          value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} />

        <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
          Publier le cours
        </Button>
      </form>

      {message && <Typography color="primary" mt={2}>{message}</Typography>}
    </Box>
  );
}
