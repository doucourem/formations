import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";

const staticInfluencers = [
  { id: 1, name: "Alice Dupont", niche: "Beauté", followers: 120000 },
  { id: 2, name: "Bob Martin", niche: "Tech", followers: 45000 },
  { id: 3, name: "Clara Ben", niche: "Fitness", followers: 98000 },
  { id: 4, name: "David Lee", niche: "Beauté", followers: 75000 },
  { id: 5, name: "Eva Smith", niche: "Tech", followers: 130000 },
];

export default function InfluencerList() {
  const [influencers, setInfluencers] = useState(staticInfluencers);
  const [filtered, setFiltered] = useState(staticInfluencers);
  const [filterNiche, setFilterNiche] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Extraire les niches uniques
  const nicheList = [...new Set(staticInfluencers.map((inf) => inf.niche))];

  useEffect(() => {
    let result = [...influencers];

    if (filterNiche) {
      result = result.filter((inf) => inf.niche === filterNiche);
    }

    result.sort((a, b) =>
      sortOrder === "asc" ? a.followers - b.followers : b.followers - a.followers
    );

    setFiltered(result);
  }, [filterNiche, sortOrder, influencers]);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h4" gutterBottom>
        Liste des influenceurs
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="filter-niche-label">Filtrer par niche</InputLabel>
          <Select
            labelId="filter-niche-label"
            value={filterNiche}
            label="Filtrer par niche"
            onChange={(e) => setFilterNiche(e.target.value)}
          >
            <MenuItem value="">Toutes</MenuItem>
            {nicheList.map((niche) => (
              <MenuItem key={niche} value={niche}>
                {niche}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="sort-order-label">Trier par followers</InputLabel>
          <Select
            labelId="sort-order-label"
            value={sortOrder}
            label="Trier par followers"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="desc">🔽 Plus populaires</MenuItem>
            <MenuItem value="asc">🔼 Moins populaires</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <List>
        {filtered.map((inf) => (
          <React.Fragment key={inf.id}>
            <ListItem
              button
              component={Link}
              to={`/influencers/${inf.id}`}
              divider
            >
              <ListItemText
                primary={inf.name}
                secondary={`${inf.niche} — ${inf.followers.toLocaleString()} followers`}
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}
