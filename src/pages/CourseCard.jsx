import React, { useState } from "react";
import { Container, Grid, Typography, TextField, MenuItem, Box } from "@mui/material";
import CourseCard from "../components/CourseCard";
import courses from "../data/courses";

export default function CourseCard2() {
  const [query, setQuery] = useState("");
  const [niveau, setNiveau] = useState("");
  const [ordre, setOrdre] = useState(""); // vues_asc, vues_desc

  const filtered = courses
    .filter((c) =>
      c.titre.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
    )
    .filter((c) => !niveau || c.niveau === niveau)
    .sort((a, b) => {
      if (ordre === "vues_asc") return a.vues - b.vues;
      if (ordre === "vues_desc") return b.vues - a.vues;
      return 0;
    });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
        Recherchez une Formation
      </Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4 }}>
        <TextField
          label="Recherche"
          variant="outlined"
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <TextField
          label="Niveau"
          select
          value={niveau}
          onChange={(e) => setNiveau(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="Débutant">Débutant</MenuItem>
          <MenuItem value="Intermédiaire">Intermédiaire</MenuItem>
          <MenuItem value="Avancé">Avancé</MenuItem>
        </TextField>

        <TextField
          label="Trier par"
          select
          value={ordre}
          onChange={(e) => setOrdre(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Aucun</MenuItem>
          <MenuItem value="vues_desc">+ Populaires</MenuItem>
          <MenuItem value="vues_asc">- Populaires</MenuItem>
        </TextField>
      </Box>

      <Grid container spacing={4}>
        {filtered.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard course={course} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
