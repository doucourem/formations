import { useEffect, useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

interface Thread {
  id: number;
  title: string;
  last_message?: string;
  last_message_date?: string;
  replies_count?: number;
  author: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  category?: {
    id: number;
    name: string;
  } | null;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return 'inconnue';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diff < 1) return "à l'instant";
  if (diff < 60) return `il y a ${diff} min`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'hier';
  return `il y a ${days}j`;
}

export default function ThreadList() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Récupérer les threads
  useEffect(() => {
    api.get('/threads').then(res => setThreads(res.data));
  }, []);

  // Extraire la liste unique des catégories (id + name)
  const categories = useMemo(() => {
    const map = new Map<number, string>();
    threads.forEach(t => {
      if (t.category) {
        map.set(t.category.id, t.category.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [threads]);

  // Filtrer les threads selon la catégorie sélectionnée
  const filteredThreads = useMemo(() => {
    if (categoryFilter === 'all') return threads;
    return threads.filter(t => t.category?.id.toString() === categoryFilter);
  }, [threads, categoryFilter]);

  return (
    <Box maxWidth="900px" mx="auto" p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" component="h2" fontWeight="bold">
          📚 Sujets disponibles
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to="/threads/new"
        >
          ➕ Nouveau sujet
        </Button>
      </Box>

      <FormControl fullWidth sx={{ maxWidth: 300, mb: 3 }}>
        <InputLabel id="category-filter-label">Filtrer par catégorie</InputLabel>
        <Select
          labelId="category-filter-label"
          value={categoryFilter}
          label="Filtrer par catégorie"
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <MenuItem value="all">Toutes les catégories</MenuItem>
          {categories.map(c => (
            <MenuItem key={c.id} value={c.id.toString()}>{c.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {filteredThreads.length === 0 ? (
        <Typography color="text.secondary" align="center">
          Aucun sujet pour le moment.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table aria-label="threads table">
            <TableHead>
              <TableRow>
                <TableCell>Sujet</TableCell>
                <TableCell>Auteur</TableCell>
                <TableCell>Dernier message</TableCell>
                <TableCell align="right">💬 Réponses</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredThreads.map((t) => (
                <TableRow
                  key={t.id}
                  hover
                  component={RouterLink}
                  to={`/threads/${t.id}`}
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  <TableCell component="th" scope="row" sx={{ color: 'primary.main' }}>
                    {t.title}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {t.author.avatar_url && (
                        <Avatar
                          alt={t.author.username}
                          src={t.author.avatar_url}
                          sx={{ width: 24, height: 24 }}
                        />
                      )}
                      <Typography>{t.author.username}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(t.last_message_date)}</TableCell>
                  <TableCell align="right">{t.replies_count ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
