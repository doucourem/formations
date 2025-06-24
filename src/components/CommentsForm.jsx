import React, { useState } from 'react';
import { Box, TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';

const CommentsForm = () => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setComments((prev) => [...prev, { id: Date.now(), text }]);
    setText('');
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h6" gutterBottom>Commentaires</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Votre commentaire"
          multiline
          fullWidth
          minRows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Champ commentaire"
        />
        <Button type="submit" variant="contained" sx={{ mt: 1 }}>
          Envoyer
        </Button>
      </form>
      <List sx={{ mt: 3 }}>
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Aucun commentaire pour le moment.</Typography>
        ) : (
          comments.map((c) => (
            <ListItem key={c.id} divider>
              <ListItemText primary={c.text} />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default CommentsForm;
