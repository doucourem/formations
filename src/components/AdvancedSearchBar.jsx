import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const categories = [
  { label: 'Tous', value: '' },
  { label: 'Développement', value: 'dev' },
  { label: 'Design', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Data & IA', value: 'data' },
];

const AdvancedSearchBar = ({ onSearch }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ search, category, location, startDate, endDate });
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={2}
      sx={{
        p: 2,
        mt: 2,
        mx: 'auto',
        maxWidth: 1200,
        borderRadius: 3,
        backgroundColor: '#fafafa',
      }}
      role="search"
      aria-label="Barre de recherche de formation"
    >
      <Grid container spacing={2}>
        {/* Rechercher */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Rechercher une formation"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Champ de recherche"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Localisation */}
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Localisation"
            variant="outlined"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Champ de localisation"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Catégorie */}
        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            label="Catégorie"
            variant="outlined"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrer par catégorie"
          >
            {categories.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Date de début */}
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Date de début"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            aria-label="Date de début"
          />
        </Grid>

        {/* Date de fin */}
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            label="Date de fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            aria-label="Date de fin"
          />
        </Grid>

        {/* Bouton */}
        <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            aria-label="Rechercher"
          >
            Rechercher
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AdvancedSearchBar;
