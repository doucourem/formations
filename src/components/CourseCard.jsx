import React from "react";
import {
  Card, CardContent, Typography, Box, Chip, Button, Stack, CardMedia
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StarIcon from "@mui/icons-material/Star";
import NewReleasesIcon from "@mui/icons-material/NewReleases";

const isRecent = (dateStr) => {
  const now = new Date();
  const pub = new Date(dateStr);
  const diff = (now - pub) / (1000 * 3600 * 24); // jours
  return diff <= 30;
};

const CourseCard = ({ course, onLearnMore }) => {
  const nouveau = isRecent(course.date);
  const populaire = course.vues > 1000;

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: 3,
        position: "relative",
        overflow: "visible",
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-5px)" },
      }}
    >
      {/* Badges */}
      <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 1 }}>
        <Stack direction="row" spacing={1}>
          {nouveau && (
            <Chip label="Nouveau" icon={<NewReleasesIcon />} color="secondary" size="small" />
          )}
          {populaire && (
            <Chip label="Populaire" icon={<StarIcon />} color="primary" size="small" />
          )}
        </Stack>
      </Box>

      {/* Vidéo si dispo */}
      {course.video ? (
        <video width="100%" height="180" controls style={{ objectFit: "cover" }}>
          <source src={course.video} type="video/mp4" />
        </video>
      ) : (
        <CardMedia
          component="img"
          height="180"
          image={course.image}
          alt={course.titre}
          sx={{ objectFit: "cover" }}
        />
      )}

      <CardContent>
        <Typography variant="h6" gutterBottom noWrap>{course.titre}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{course.description}</Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip icon={<SchoolIcon />} label={course.niveau} variant="outlined" size="small" />
          <Chip icon={<AccessTimeIcon />} label={course.duree} variant="outlined" size="small" />
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={() => onLearnMore?.(course)}
        >
          En savoir plus
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
