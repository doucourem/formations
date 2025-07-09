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
} from "@mui/material";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function InfluencerListFrontend() {
  const [influencers, setInfluencers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterNiche, setFilterNiche] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Charger depuis Supabase
  useEffect(() => {
    const fetchInfluencers = async () => {
      const { data, error } = await supabase
        .from("influencers")
        .select("id, name, bio, followers");

      if (error) {
        console.error("Erreur Supabase:", error);
      } else {
        setInfluencers(data);
        setFiltered(data);
      }
    };

    fetchInfluencers();
  }, []);

  // Appliquer filtres et tri
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

  // Liste dynamique des niches
  const nicheList = [...new Set(influencers.map((inf) => inf.niche))];

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
          <ListItem
            key={inf.id}
            button
            component={Link}
            to={`/influencer/${inf.id}`}
            divider
          >
            <ListItemText
              primary={inf.name}
              secondary={`${inf.bio} — ${inf.followers.toLocaleString()} followers`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
