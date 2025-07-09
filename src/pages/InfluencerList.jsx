import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Avatar,
  CardActionArea,
} from "@mui/material";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function InfluencerListFrontend() {
  const [influencers, setInfluencers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterNiche, setFilterNiche] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchInfluencers = async () => {
      const { data, error } = await supabase
        .from("influencers")
        .select("id, name, bio, image, niche, followers");

      if (error) console.error("Erreur Supabase:", error);
      else {
        setInfluencers(data);
        setFiltered(data);
      }
    };

    fetchInfluencers();
  }, []);

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

  const nicheList = [...new Set(influencers.map((inf) => inf.niche))];

  return (
    <Box sx={{ maxWidth: "1000px", mx: "auto", mt: 5, px: 2 }}>
      <Typography variant="h4" gutterBottom textAlign="center">
        🌟 Influenceurs en vedette
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <FormControl fullWidth sx={{ flex: 1 }}>
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

        <FormControl fullWidth sx={{ flex: 1 }}>
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

      <Grid container spacing={3}>
        {filtered.map((inf) => (
          <Grid item xs={12} sm={6} md={4} key={inf.id}>
            <Card sx={{ height: "100%", boxShadow: 4 }}>
              <CardActionArea component={Link} to={`/influencer/${inf.id}`}>
                <Box sx={{ display: "flex", alignItems: "center", p: 2 }}>
                  <Avatar
                    src={inf.image}
                    alt={inf.name}
                    sx={{ width: 64, height: 64, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{inf.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {inf.niche} — {inf.followers.toLocaleString()} abonnés
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="body2" color="text.secondary">
                    {inf.bio?.length > 120
                      ? inf.bio.slice(0, 120) + "…"
                      : inf.bio}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
