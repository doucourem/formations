import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Button,
  Grid,
  Paper,
  IconButton,
  Menu,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SortIcon from '@mui/icons-material/Sort';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ search, category, location, startDate, endDate });
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (value) => {
    if (onSearch && value) {
      onSearch({ search, category, location, startDate, endDate, sortBy: value });
    }
    setAnchorEl(null);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
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
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Rechercher une formation"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Localisation"
            variant="outlined"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            fullWidth
            label="Catégorie"
            variant="outlined"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Date de début"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Date de fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={6} sm={6} md={1}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ height: '100%' }}
          >
            Rechercher
          </Button>
        </Grid>

        <Grid item xs={6} sm={6} md={'auto'}>
          <IconButton
            onClick={handleMenuClick}
            aria-label="Ouvrir les options de tri"
            aria-controls={open ? 'filter-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <SortIcon />
          </IconButton>

          <Menu
            id="filter-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={() => handleMenuClose(null)}
          >
            <MenuItem onClick={() => handleMenuClose('recent')}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} /> Les plus récents
            </MenuItem>
            <MenuItem onClick={() => handleMenuClose('popular')}>
              <SortIcon fontSize="small" sx={{ mr: 1 }} /> Les plus populaires
            </MenuItem>
            <MenuItem onClick={() => handleMenuClose('favorites')}>
              <FavoriteIcon fontSize="small" sx={{ mr: 1 }} /> Mes favoris
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AdvancedSearchBar;
